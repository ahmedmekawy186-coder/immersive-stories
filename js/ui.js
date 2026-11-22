/* واجهة عربية RTL + الصوت المنطوق / Arabic RTL overlay + spoken narration (browser speech synthesis) */
const UI = (function () {
  const $ = id => document.getElementById(id);
  const fast = () => !!(window.CONFIG && CONFIG.fast);
  let sayTimer = null, skipFn = null, muted = false, voices = [], voiceNoticeShown = false;

  /* ---- voices ---- */
  function loadVoices() {
    try { voices = (window.speechSynthesis ? speechSynthesis.getVoices() : []).filter(v => /^ar/i.test(v.lang) || /arab|عرب/i.test(v.name)); } catch (e) { voices = []; }
  }
  if (window.speechSynthesis) { loadVoices(); try { speechSynthesis.onvoiceschanged = loadVoices; } catch (e) {} }
  const MALE = /shakir|naayf|hamed|majed|maged|tarik|salem|male|ahmed|omar/i;
  const PROF = {
    'الراوي': { pitch: 1.0, rate: 0.92, g: 'any', i: 0 },
    'المعلم': { pitch: 0.8, rate: 0.95, g: 'male', i: 0 },
    'الموجه': { pitch: 0.6, rate: 0.88, g: 'male', i: 1 },
    'طالب': { pitch: 1.45, rate: 1.03, g: 'any', i: 1 },
    'أنت': { pitch: 1.0, rate: 0.98, g: 'male', i: 2 }
  };
  function pick(who) {
    if (!voices.length) return null; const p = PROF[who] || PROF['الراوي'];
    const pool = p.g === 'male' && voices.some(v => MALE.test(v.name)) ? voices.filter(v => MALE.test(v.name)) : voices;
    return pool[p.i % pool.length];
  }
  function hasVoice() { return voices.length > 0; }
  function anyVoice() { return hasVoice() || (window.AudioEngine && AudioEngine.hasVoice()); }
  function setMuted(v) { muted = v; if (v) { try { speechSynthesis.cancel(); } catch (e) {} } const b = $('btn-voice'); if (b) b.textContent = v ? 'الصوت المنطوق: متوقف' : 'الصوت المنطوق: يعمل'; }
  function skip() { if (skipFn) skipFn(); }

  function speak(who, text, o) {
    o = o || {};
    return new Promise(res => {
      if (skipFn) skipFn();
      const est = Math.min(15000, 1500 + text.length * 75) * (fast() ? 0.06 : 1);
      const t0 = performance.now(); let done = false, tm = null;
      const fin = () => { if (done) return; done = true; clearTimeout(tm); skipFn = null; res(); };
      if (window.CONFIG && CONFIG.mobile && o.id && CONFIG.FILES && CONFIG.FILES[o.id] && !muted && !fast() && AudioEngine.hasVoice()) {
        const dur = (CONFIG.VOICE[o.id] || [0, 4])[1] * 1000, ts = performance.now();
        skipFn = () => { AudioEngine.stopVoice(); fin(); };
        tm = setTimeout(fin, dur + 5000);
        AudioEngine.playFile(CONFIG.FILES[o.id]).then(() => {
          const e = AudioEngine.fileErr(); if (e) { const st = document.getElementById('status'); if (st && !/voice file/.test(st.textContent)) st.textContent += ' | voice file problem: ' + e; }
          setTimeout(fin, Math.max(0, dur - (performance.now() - ts) - 100));
        });
        return;
      }
      /* 1) recorded voices (Egyptian/Arabic neural TTS, pre-rendered, spatialised) */
      const vv = window.CONFIG && CONFIG.VOICE && o.id && CONFIG.VOICE[o.id];
      if (!muted && vv && !fast() && window.AudioEngine && AudioEngine.hasVoice()) {
        skipFn = () => { AudioEngine.stopVoice(); fin(); };
        tm = setTimeout(fin, vv[1] * 1000 + 3000);
        AudioEngine.playSprite(vv[0], vv[1], o.pos).then(fin);
        return;
      }
      /* 2) browser speech synthesis if an Arabic voice is installed */
      skipFn = () => { try { speechSynthesis.cancel(); } catch (e) {} fin(); };
      const speech = !muted && hasVoice() && !fast();
      tm = setTimeout(fin, speech ? est + 8000 : est);
      if (speech) {
        try {
          const u = new SpeechSynthesisUtterance(text), p = PROF[who] || PROF['الراوي'], v = pick(who);
          if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'ar-EG';
          u.pitch = p.pitch; u.rate = p.rate; u.volume = 1;
          u.onend = () => setTimeout(fin, Math.max(200, est * 0.45 - (performance.now() - t0)));
          u.onerror = () => setTimeout(fin, Math.max(200, est - (performance.now() - t0)));
          speechSynthesis.cancel(); speechSynthesis.speak(u);
        } catch (e) { /* timing fallback already armed */ }
      }
      /* 3) otherwise: subtitles with reading-time pause */
    });
  }

  /* ---- subtitles ---- */
  function showSub(who, text) {
    const box = $('subtitle'), narr = !who || who === 'الراوي';
    $('sub-speaker').textContent = who || 'الراوي'; $('sub-speaker').style.display = 'block';
    $('sub-text').textContent = text; clearTimeout(sayTimer);
    box.className = 'show ' + (narr ? 'narration' : 'dialogue');
  }
  /* spoken line: shows subtitle, speaks it, resolves when finished (or skipped) */
  async function line(who, text, o) {
    o = o || {}; showSub(who, text);
    await speak(who || 'الراوي', text, o);
    if (!o.keep) { await new Promise(r => setTimeout(r, fast() ? 15 : (o.gap || 380))); }
    sayTimer = setTimeout(clearSay, 2600);
  }
  /* silent, timed message (hints) */
  function say(speaker, text, ms) {
    showSub(speaker, text);
    if (ms) sayTimer = setTimeout(clearSay, ms);
  }
  function clearSay() { $('subtitle').classList.remove('show'); }
  function objective(text) { const o = $('objective'); if (!text) { o.classList.remove('show'); return; } $('obj-text').textContent = text; o.classList.add('show'); }
  function hint(text) { const h = $('hint'); h.textContent = text || ''; h.classList.toggle('show', !!text); }
  function choose(prompt, list) {
    return new Promise(res => {
      const c = $('choices'); $('choices-prompt').textContent = prompt || ''; const box = $('choices-list'); box.innerHTML = '';
      list.forEach(it => {
        const b = document.createElement('button'); b.textContent = it.text; b.className = 'choice';
        b.onclick = () => { c.classList.remove('show'); res(it); }; box.appendChild(b);
      });
      c.classList.add('show');
    });
  }
  function show(id) { $(id).classList.add('show'); }
  function hide(id) { $(id).classList.remove('show'); }
  function flash() { const f = $('flash'); f.className = ''; void f.offsetWidth; f.className = 'go'; }
  /* full-screen title card */
  function cine(title, sub) { $('cine-title').textContent = title || ''; $('cine-sub').textContent = sub || ''; $('cine').classList.add('show'); }
  function cineHide() { $('cine').classList.remove('show'); }
  function voiceNotice() {
    if (voiceNoticeShown || anyVoice() || muted) return; voiceNoticeShown = true;
    say('', 'ملحوظة: تعذّر تحميل ملف الأصوات المسجلة، فستظهر الحوارات كتابةً فقط. تأكد من الاتصال بالإنترنت وأعد تحميل الصفحة.', 9000);
  }
  function summary(sum) {
    const tbl = $('sum-table'); tbl.innerHTML = '';
    const rows = [['رقم الجلسة', sum.session_id], ['المستوى', ({ desktop: 'منخفض (شاشة + فأرة)', touch: 'متوسط (لمس)', vr: 'مرتفع (VR)' })[sum.level]],
      ['الزمن الكلي (ثانية)', sum.total_time_s], ['عدد الأخطاء', sum.error_count], ['محاولات المعايرة', sum.calibration_attempts]];
    rows.forEach(r => { const tr = document.createElement('tr'); tr.innerHTML = '<th></th><td></td>'; tr.children[0].textContent = r[0]; tr.children[1].textContent = r[1]; tbl.appendChild(tr); });
  }
  document.addEventListener('keydown', e => { if (e.code === 'Space' && !/INPUT|TEXTAREA|BUTTON/.test((e.target || {}).tagName || '')) { e.preventDefault(); skip(); } });
  return { say, line, clearSay, objective, hint, choose, show, hide, flash, cine, cineHide, summary, skip, setMuted, hasVoice: anyVoice, voiceNotice, $ };
})();
