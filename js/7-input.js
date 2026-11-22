/* طبقة الإدخال / Input abstraction.
   The story logic only listens to Input.on(fn) and receives { type:'activate', target:'<id>', source:'mouse|key|touch|xr' }.
   To add touch or WebXR hands later: write an adapter that calls Input.dispatch(...) -- do NOT touch story.js. */
const Input = (function () {
  const listeners = []; let hovered = null; let enabled = true;
  function on(fn) { listeners.push(fn); }
  function dispatch(ev) { if (!enabled) return; listeners.forEach(fn => fn(ev)); }
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
  function install(scene, level) { (adapters[level] || adapters.desktop)(scene); }
  return { on, dispatch, install, setEnabled };
})();
