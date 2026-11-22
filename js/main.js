(function () {
  const THREE = AFRAME.THREE;
  AFRAME.registerComponent('room-bounds', { tick() { const p = this.el.object3D.position; p.x = Math.max(-4.5, Math.min(4.5, p.x)); p.z = Math.max(-4.0, Math.min(4.7, p.z)); p.y = 0; } });
  AFRAME.registerComponent('audio-listener-sync', {
    init() { this.p = new THREE.Vector3(); this.f = new THREE.Vector3(); this.u = new THREE.Vector3(0, 1, 0); this.q = new THREE.Quaternion(); this.last = null; this.acc = 0; },
    tick() {
      const o = this.el.object3D; o.getWorldPosition(this.p); o.getWorldDirection(this.f); o.getWorldQuaternion(this.q); this.u.set(0, 1, 0).applyQuaternion(this.q);
      AudioEngine.updateListener(this.p, this.f, this.u);
      if (this.last) { const d = Math.hypot(this.p.x - this.last.x, this.p.z - this.last.z); if (d < 1) this.acc += d; if (this.acc > 0.75) { this.acc = 0; AudioEngine.footstep(); } }
      this.last = this.last || new THREE.Vector3(); this.last.copy(this.p);
    }
  });

  /* keep the canvas affordable on phones in "desktop site" mode (huge canvas): start at pixel ratio <= 1.5, step down only if fps < 26 */
  function startPerfGuard() {
    const sc = document.querySelector('a-scene'); let ratio = Math.min(window.devicePixelRatio || 1, 1.5), frames = 0, t0 = performance.now(), lows = 0;
    const apply = () => { try { sc.renderer.setPixelRatio(ratio); sc.resize(); } catch (e) {} }; apply();
    (function loop() { frames++; requestAnimationFrame(loop); })();
    setInterval(() => {
      const now = performance.now(), fps = frames * 1000 / (now - t0); frames = 0; t0 = now; window.__fps = Math.round(fps); window.__ratio = ratio;
      const st = document.getElementById('status'); if (st) st.dataset.perf = ' | fps ' + window.__fps + ' @x' + ratio.toFixed(2);
      if (fps < 26 && ratio > 0.85) { if (++lows >= 2) { ratio = Math.max(0.85, ratio * 0.85); lows = 0; apply(); } } else lows = 0;
    }, 2000);
  }
  function setStatus(t) { const el = document.getElementById('status'); if (el) el.textContent = t; }
  window.addEventListener('error', e => setStatus('JS error: ' + (e.message || '') + ' @' + String(e.filename || '').split('/').pop() + ':' + e.lineno));
  window.addEventListener('unhandledrejection', e => setStatus('JS error: ' + String(e.reason && e.reason.message || e.reason)));
  ['touchend', 'click'].forEach(ev => document.addEventListener(ev, () => AudioEngine.resume(), { passive: true }));
  document.addEventListener('DOMContentLoaded', async () => {
    try { await Promise.all([document.fonts.load('700 40px Cairo'), document.fonts.load('400 40px Cairo')]); } catch (e) {}
    const scene = document.querySelector('a-scene');
    const start = () => {
      Classroom.build(scene); Classroom.mergeStatic();
      Input.install(scene, CONFIG.level);
      window.addEventListener('hover-target', e => UI.hint(e.detail ? e.detail.label + '  (انقر أو اضغط E)' : ''));
      document.getElementById('level-badge').textContent = ({ desktop: 'المستوى المنخفض: شاشة + فأرة + لوحة مفاتيح', touch: 'المستوى المتوسط: شاشة لمس (قيد التطوير)', vr: 'المستوى المرتفع: نظارة VR (قيد التطوير)' })[CONFIG.level];
      document.body.classList.add('ready');
    };
    if (scene.hasLoaded) start(); else scene.addEventListener('loaded', start);

    const go = document.getElementById('go'), sid = document.getElementById('sid'), err = document.getElementById('sid-err');
    go.addEventListener('click', () => {
      const v = sid.value.trim();
      if (!v || v.length > 40) { err.textContent = 'اكتب رقم الجلسة (حتى 40 حرفًا).'; return; }
      Logger.start(v, CONFIG.level); AudioEngine.init();
      startPerfGuard();
      go.disabled = true; go.textContent = 'جارٍ تحميل الأصوات…';
      if (CONFIG.mobile) { AudioEngine.unlockEl(); AudioEngine.preload(CONFIG.PRELOAD); }
      const voice = CONFIG.fast ? Promise.resolve(false) : CONFIG.mobile ? Promise.resolve('files') : AudioEngine.loadVoice(CONFIG.voiceUrl).catch(e => { window.__voiceErr = String(e && e.message || e); console.warn('voice load failed', e); return false; });
      voice.then(ok => {
        setStatus(ok ? 'voice: ' + ok : 'voice: FAILED ' + (window.__voiceErr || ''));
        UI.hide('intro'); UI.show('hud'); if (!ok && !CONFIG.fast) UI.voiceNotice();
        document.getElementById('cam').setAttribute('look-controls', 'enabled', true);
        document.body.classList.add('playing'); Story.begin();
      });
    });
    sid.addEventListener('keydown', e => { if (e.key === 'Enter') go.click(); });
    document.getElementById('btn-skip').onclick = () => UI.skip();
    let mutedNow = false; document.getElementById('btn-voice').onclick = () => { mutedNow = !mutedNow; UI.setMuted(mutedNow); };
    document.getElementById('dl-csv').onclick = () => Logger.exportCSV();
    document.getElementById('dl-json').onclick = () => Logger.exportJSON();
    document.getElementById('again').onclick = () => location.reload();
  });
})();
