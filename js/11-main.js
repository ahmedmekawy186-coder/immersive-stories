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

  document.addEventListener('DOMContentLoaded', async () => {
    try { await Promise.all([document.fonts.load('700 40px Cairo'), document.fonts.load('400 40px Cairo')]); } catch (e) {}
    const scene = document.querySelector('a-scene');
    const start = () => {
      Classroom.build(scene);
      Input.install(scene, CONFIG.level);
      window.addEventListener('hover-target', e => UI.hint(e.detail ? e.detail.label + '  (انقر أو اضغط E)' : ''));
      document.getElementById('level-badge').textContent = ({ desktop: 'المستوى المنخفض: شاشة + فأرة + لوحة مفاتيح', touch: 'المستوى المتوسط: شاشة لمس (قيد التطوير)', vr: 'المستوى المرتفع: نظارة VR (قيد التطوير)' })[CONFIG.level];
      document.body.classList.add('ready');
    };
    if (scene.hasLoaded) start(); else scene.addEventListener('loaded', start);

    const go = document.getElementById('go'), sid = document.getElementById('sid'), err = document.getElementById('sid-err');
    go.addEventListener('click', () => {
      const v = sid.value.trim();
      if (!/^[\w\u0600-\u06FF\- ]{1,40}$/.test(v)) { err.textContent = 'اكتب رقم الجلسة (حروف أو أرقام فقط).'; return; }
      Logger.start(v, CONFIG.level); AudioEngine.init();
      UI.hide('intro'); UI.show('hud');
      const rig = document.getElementById('rig'); rig.setAttribute('wasd-controls', 'enabled', true);
      document.getElementById('cam').setAttribute('look-controls', 'enabled', true);
      Story.begin();
    });
    sid.addEventListener('keydown', e => { if (e.key === 'Enter') go.click(); });
    document.getElementById('dl-csv').onclick = () => Logger.exportCSV();
    document.getElementById('dl-json').onclick = () => Logger.exportJSON();
    document.getElementById('again').onclick = () => location.reload();
  });
})();
