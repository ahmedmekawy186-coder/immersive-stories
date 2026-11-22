/* طبقة الإدخال / Input abstraction.
   The story logic only listens to Input.on(fn) and receives { type:'activate', target:'<id>', source:'mouse|key|touch|xr' }.
   To add touch or WebXR hands later: write an adapter that calls Input.dispatch(...) -- do NOT touch story.js. */
const Input = (function () {
  const listeners = []; let hovered = null; let enabled = true;
  function on(fn) { listeners.push(fn); }
  let lastAct = { t: 0, target: '', source: '' };
  function dispatch(ev) {
    if (!enabled) return;
    if (ev.type === 'activate') {   // a touch also fires a synthetic click: drop the duplicate
      const now = performance.now();
      if (lastAct.target === ev.target && lastAct.source !== ev.source && now - lastAct.t < 700) return;
      lastAct = { t: now, target: ev.target, source: ev.source };
    }
    listeners.forEach(fn => fn(ev));
  }
  function setEnabled(v) { enabled = v; }

  const adapters = {
    /* Low level: mouse + keyboard (A-Frame cursor with rayOrigin: mouse). Touch taps also arrive here as clicks. */
    desktop(scene) {
      scene.addEventListener('click', e => {
        const el = e.target; const t = el && el.dataset && el.dataset.target;
        if (t) dispatch({ type: 'activate', target: t, source: 'mouse' });
      });
      scene.addEventListener('mouseenter', e => {
        const el = e.target; if (el && el.dataset && el.dataset.target) { hovered = el; document.body.classList.add('hot'); window.dispatchEvent(new CustomEvent('hover-target', { detail: el.dataset })); }
      });
      scene.addEventListener('mouseleave', e => {
        if (hovered === e.target) { hovered = null; document.body.classList.remove('hot'); window.dispatchEvent(new CustomEvent('hover-target', { detail: null })); }
      });
      window.addEventListener('keydown', e => {
        if ((e.key === 'e' || e.key === 'E' || e.key === 'د') && hovered) dispatch({ type: 'activate', target: hovered.dataset.target, source: 'key' });
      });
    },
    /* TODO v2 (medium): touch screen full-screen, tap + drag-to-look. Adapter placeholder. */
    touch(scene) { adapters.desktop(scene); },
    /* TODO v3 (high): WebXR hands/controllers: on 'triggerdown' / pinch of an entity with data-target, dispatch activate. */
    vr(scene) { adapters.desktop(scene); }
  };

  /* ---- touch: stable drag-to-look, robust tap picking (big targets), on-screen joystick. No gyro. ---- */
  function installTouch(scene) {
    const camEl = document.getElementById('cam'), rigEl = document.getElementById('rig');
    const isTouch = () => (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
    if (!isTouch()) return;
    const THREE_ = window.THREE; let down = null, lastTap = 0;
    const lookObjs = () => { const lc = camEl.components['look-controls']; return lc && lc.yawObject ? { y: lc.yawObject, p: lc.pitchObject } : null; };
    const canvasEl = () => scene.canvas || document.querySelector('canvas');
    function pick(cx, cy) {
      const cv = canvasEl(); if (!cv || !THREE_) return null; const r = cv.getBoundingClientRect(), cam = camEl.getObject3D('camera');
      const els = [...document.querySelectorAll('.interactable[data-target]')]; if (!els.length) return null;
      const v = new THREE_.Vector3(), best = { el: null, d: 1e9 };
      const slack = Math.max(46, Math.min(r.width, r.height) * 0.07);   // finger-sized target in CSS px
      scene.object3D.updateMatrixWorld(true);
      els.forEach(el => {
        const o = el.object3D; o.getWorldPosition(v); v.project(cam); if (v.z > 1 || v.z < -1) return;
        const sx = r.left + (v.x + 1) / 2 * r.width, sy = r.top + (1 - v.y) / 2 * r.height; const d = Math.hypot(sx - cx, sy - cy);
        const cal = /^cal-/.test(el.dataset.target); const lim = cal ? slack * 1.6 : slack * 1.2;
        if (d < lim && (cal ? d - 1000 : d) < best.d) { best.el = el; best.d = cal ? d - 1000 : d; }
      });
      if (best.el) return best.el;
      // real raycast for big objects (board, teacher body)
      const rc = new THREE_.Raycaster(); rc.setFromCamera(new THREE_.Vector2((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), cam);
      const meshes = []; els.forEach(el => el.object3D.traverse(m => { if (m.isMesh) { m.__el = el; meshes.push(m); } }));
      const hit = rc.intersectObjects(meshes, false)[0]; return hit ? hit.object.__el : null;
    }
    window.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' || !(e.target && e.target.tagName === 'CANVAS')) return; down = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, t: performance.now(), moved: false, id: e.pointerId }; }, true);
    window.addEventListener('pointermove', e => {
      if (!down || e.pointerId !== down.id) return;
      if (!down.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10) down.moved = true;
      if (down.moved) { const lo = lookObjs(); if (lo) {
        const dx = e.clientX - down.lx, dy = e.clientY - down.ly; const k = 0.0042;
        lo.y.rotation.y += dx * k; lo.p.rotation.x = Math.max(-1.0, Math.min(1.0, lo.p.rotation.x + dy * k)); } }
      down.lx = e.clientX; down.ly = e.clientY;
    }, true);
    window.addEventListener('pointerup', e => {
      if (!down || e.pointerId !== down.id) return; const d = down; down = null;
      if (d.moved || performance.now() - d.t > 700) return;
      const el = pick(e.clientX, e.clientY); if (el) { lastTap = performance.now(); dispatch({ type: 'activate', target: el.dataset.target, source: 'touch' }); }
    }, true);
    window.addEventListener('pointercancel', () => { down = null; }, true);
    // joystick
    const j = document.createElement('div'); j.id = 'joy'; j.innerHTML = '<div id="joyk"></div>'; document.body.appendChild(j);
    const st = document.createElement('style'); st.textContent = '#joy{position:fixed;left:16px;bottom:150px;width:112px;height:112px;border-radius:50%;background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.4);z-index:35;touch-action:none;display:none}#joyk{position:absolute;left:34px;top:34px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.55)}body.playing #joy{display:block}'; document.head.appendChild(st);
    let jv = { x: 0, y: 0 }, jid = null;
    const jset = e => { const r = j.getBoundingClientRect(); let x = (e.clientX - r.left - 56) / 44, y = (e.clientY - r.top - 56) / 44; const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; } jv = { x, y }; const k = document.getElementById('joyk'); k.style.left = (34 + x * 34) + 'px'; k.style.top = (34 + y * 34) + 'px'; };
    j.addEventListener('pointerdown', e => { jid = e.pointerId; j.setPointerCapture(jid); jset(e); e.stopPropagation(); });
    j.addEventListener('pointermove', e => { if (e.pointerId === jid) jset(e); });
    const jend = e => { if (e.pointerId !== jid) return; jid = null; jv = { x: 0, y: 0 }; const k = document.getElementById('joyk'); k.style.left = '34px'; k.style.top = '34px'; };
    j.addEventListener('pointerup', jend); j.addEventListener('pointercancel', jend);
    let tprev = performance.now();
    (function loop(t) {
      requestAnimationFrame(loop); const dt = Math.min(0.05, (t - tprev) / 1000); tprev = t;
      if ((!jv.x && !jv.y)) return; const w = rigEl.components['wasd-controls']; if (!w || !w.data.enabled) return;
      const lo = lookObjs(); const yaw = lo ? lo.y.rotation.y : 0, sp = 1.7, fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
      const p = rigEl.object3D.position; p.x += (fx * -jv.y + rx * jv.x) * sp * dt; p.z += (fz * -jv.y + rz * jv.x) * sp * dt;
    })(tprev);
  }
  function install(scene, level) { (adapters[level] || adapters.desktop)(scene); installTouch(scene); }
  return { on, dispatch, install, setEnabled };
})();
