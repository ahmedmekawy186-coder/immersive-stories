/* محرك الصوت المكاني / Spatial audio engine (Web Audio API, HRTF panners, headphones assumed)
   كل الأصوات مولّدة برمجيًا (لا ملفات حقوق) / All sounds are synthesized: no licensed files. */
const AudioEngine = (function () {
  let ctx = null, master, noiseBuf, started = false;
  const S = {};            // named sources
  const POS = {            // world positions (meters), see classroom.js layout
    transformer: [6.5, 1.6, -1.5],   // outside the right wall
    fuse: [-4.8, 1.6, -3.2],         // fuse box, front-left wall
    lights: [0, 3.0, 0],
    ac: [-4.6, 2.7, 0.5],
    pcLeft: [-2.8, 0.8, 1.8], pcRight: [2.8, 0.8, 1.8],
    murmur: [2.8, 1.3, 2.6],
    board: [0, 1.6, -4.3]
  };

  function pos(p, x, y, z) {
    if (p.positionX) { p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z; }
    else p.setPosition(x, y, z);
  }
  function panner(p, ref, rolloff) {
    const n = ctx.createPanner();
    n.panningModel = 'HRTF'; n.distanceModel = 'inverse';
    n.refDistance = ref || 1; n.rolloffFactor = rolloff || 1.3; n.maxDistance = 60;
    pos(n, p[0], p[1], p[2]); n.connect(master); return n;
  }
  function pinkBuffer() {
    const len = ctx.sampleRate * 4, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
    }
    return b;
  }
  function noiseSrc() { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.start(); return s; }
  function gain(v) { const g = ctx.createGain(); g.gain.value = v; return g; }

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = gain(0.9); master.connect(ctx.destination);
    noiseBuf = pinkBuffer();

    // 1) Room tone (non-positional bed, very low)
    const rt = noiseSrc(), rtf = ctx.createBiquadFilter(); rtf.type = 'lowpass'; rtf.frequency.value = 500;
    S.roomGain = gain(0.05); rt.connect(rtf).connect(S.roomGain).connect(master);

    // 2) AC unit noise (positional)
    const ac = noiseSrc(), acf = ctx.createBiquadFilter(); acf.type = 'bandpass'; acf.frequency.value = 350; acf.Q.value = 0.7;
    S.acGain = gain(0.5); ac.connect(acf).connect(S.acGain).connect(panner(POS.ac, 1.5, 1));

    // 3) Transformer / mains hum 50 Hz + harmonics (positional, outside the wall)
    S.humGain = gain(0.55); const humLP = ctx.createBiquadFilter(); humLP.type = 'lowpass'; humLP.frequency.value = 600;
    S.humOsc = [50, 100, 150, 250].map((f, i) => {
      const o = ctx.createOscillator(); o.type = i === 0 ? 'sine' : 'sawtooth'; o.frequency.value = f;
      const g = gain([0.5, 0.35, 0.18, 0.08][i]); o.connect(g).connect(humLP); o.start(); return o;
    });
    humLP.connect(S.humGain).connect(panner(POS.transformer, 2, 0.9));

    // 4) Fluorescent tube buzz (positional, ceiling)
    const fo = ctx.createOscillator(); fo.type = 'sawtooth'; fo.frequency.value = 100;
    const ffl = ctx.createBiquadFilter(); ffl.type = 'bandpass'; ffl.frequency.value = 400; ffl.Q.value = 3;
    S.tubeGain = gain(0.04); fo.connect(ffl).connect(S.tubeGain).connect(panner(POS.lights, 2, 1)); fo.start();

    // 5) PC fans (two positional noise sources)
    S.fanGains = [POS.pcLeft, POS.pcRight].map(p => {
      const n = noiseSrc(), hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4000;
      const g = gain(0.22); n.connect(hp).connect(lp).connect(g).connect(panner(p, 1.5, 1.2)); return g;
    });

    // 6) Students' murmur (positional, bursty)
    const mn = noiseSrc(), mbp = ctx.createBiquadFilter(); mbp.type = 'bandpass'; mbp.frequency.value = 700; mbp.Q.value = 1.5;
    S.murmurGain = gain(0.0); const lfo = ctx.createOscillator(); lfo.frequency.value = 2.3;
    const lfoG = gain(0.5); S.murmurMod = gain(0.5); lfo.connect(lfoG).connect(S.murmurMod.gain); lfo.start();
    mn.connect(mbp).connect(S.murmurMod).connect(S.murmurGain).connect(panner(POS.murmur, 1.5, 1));
    S.murmurGain.gain.value = 0.06;
    started = true;
  }

  function ramp(param, v, t) { const n = ctx.currentTime; param.cancelScheduledValues(n); param.setValueAtTime(param.value, n); param.linearRampToValueAtTime(v, n + t); }

  /* One-shots */
  function burst(p, freq, dur, vol, type) {
    if (!ctx) return;
    const n = ctx.createBufferSource(); n.buffer = noiseBuf; n.start(0, Math.random() * 2);
    const f = ctx.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = freq;
    const g = gain(0); const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f).connect(g).connect(p ? panner(p, 1.2, 1) : master); n.stop(t + dur + 0.05);
  }
  function tone(p, f0, f1, dur, vol, type) {
    if (!ctx) return;
    const o = ctx.createOscillator(); o.type = type || 'sine'; const t = ctx.currentTime;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = gain(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(p ? panner(p, 1.2, 1) : master); o.start(t); o.stop(t + dur + 0.05);
  }

  const api = {
    POS,
    init,
    /* AFRAME tick: camera position/orientation -> AudioListener */
    updateListener(p, fwd, up) {
      if (!ctx) return; const l = ctx.listener;
      if (l.positionX) {
        l.positionX.value = p.x; l.positionY.value = p.y; l.positionZ.value = p.z;
        l.forwardX.value = fwd.x; l.forwardY.value = fwd.y; l.forwardZ.value = fwd.z;
        l.upX.value = up.x; l.upY.value = up.y; l.upZ.value = up.z;
      } else { l.setPosition(p.x, p.y, p.z); l.setOrientation(fwd.x, fwd.y, fwd.z, up.x, up.y, up.z); }
    },
    powerCut() {
      if (!ctx) return;
      tone(POS.fuse, 180, 60, 0.25, 0.5, 'square'); burst(POS.fuse, 2500, 0.12, 0.6, 'bandpass');   // relay clunk
      ramp(S.humGain.gain, 0, 0.25); S.humOsc.forEach(o => o.frequency.exponentialRampToValueAtTime(Math.max(20, o.frequency.value * 0.5), ctx.currentTime + 0.8));
      ramp(S.tubeGain.gain, 0, 0.1); ramp(S.acGain.gain, 0, 0.6); S.fanGains.forEach(g => ramp(g.gain, 0, 1.6)); ramp(S.roomGain.gain, 0.02, 0.8);
      tone(POS.board, 900, 200, 0.5, 0.15, 'sine'); // board shutting down
      ramp(S.murmurGain.gain, 0.12, 1.0);
    },
    powerReturn() {
      if (!ctx) return;
      tone(POS.fuse, 120, 220, 0.25, 0.5, 'square'); burst(POS.fuse, 3000, 0.1, 0.5, 'bandpass');
      S.humOsc.forEach((o, i) => o.frequency.setValueAtTime([50, 100, 150, 250][i], ctx.currentTime));
      ramp(S.humGain.gain, 0.55, 0.4); ramp(S.tubeGain.gain, 0.04, 0.3); ramp(S.acGain.gain, 0.5, 2.0);
      S.fanGains.forEach(g => ramp(g.gain, 0.22, 2.5)); ramp(S.roomGain.gain, 0.05, 1.0);
      tone(POS.board, 300, 700, 0.35, 0.08, 'sine');
    },
    boardTap(ok) { if (ok) tone(POS.board, 880, 1320, 0.12, 0.25, 'sine'); else tone(POS.board, 160, 110, 0.18, 0.25, 'square'); },
    error() { tone(POS.board, 220, 140, 0.3, 0.2, 'triangle'); },
    success() {
      [660, 880, 1320].forEach((f, i) => setTimeout(() => tone(POS.board, f, f * 1.01, 0.5, 0.22, 'sine'), i * 140));
      if (ctx) { ramp(S.murmurGain.gain, 0.05, 2.0); }
    },
    footstep() { burst(null, 700, 0.09, 0.18, 'lowpass'); },
    click() { burst(null, 3000, 0.04, 0.12, 'bandpass'); },
    /* Hook for real voice recordings (mp3/ogg in assets/audio/voice/), positioned in 3D.
       Not used in v1: browser speechSynthesis cannot be spatialized. */
    playVoice(url, p) {
      if (!ctx) return;
      fetch(url).then(r => r.ok ? r.arrayBuffer() : Promise.reject()).then(b => ctx.decodeAudioData(b)).then(buf => {
        const s = ctx.createBufferSource(); s.buffer = buf; s.connect(panner(p, 1.5, 1)); s.start();
      }).catch(() => {});
    },
    isStarted: () => started
  };
  return api;
})();
