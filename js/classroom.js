/* مشهد الفصل الذكي / Smart classroom + computer lab (procedural placeholders, no external 3D assets in v1).
   World: x right, -z toward the front wall (board at z=-4.5), y up, meters. Room 10 x 9.5 x 3.2. */
const Classroom = (function () {
  const THREE = AFRAME.THREE;
  const state = { fixtures: [], pointLights: [], screens: [], fans: [], board: null, calTargets: {}, people: {} };
  const POS = { teacher: [-1.7, 0, -3.1], supervisor: [4.2, 0, 3.7], pc: [3.0, 0.9, -3.3], board: [0, 1.6, -4.4] };

  const MOB = false;   // full quality on every device (phones included); optimisation is done by merging static geometry + adaptive pixel ratio
  function E(parent, tag, attrs) {
    attrs = attrs || {};
    if (tag === 'a-sphere') { attrs['segments-width'] = attrs['segments-width'] || 14; attrs['segments-height'] = attrs['segments-height'] || 10; }
    if (tag === 'a-cylinder') attrs['segments-radial'] = attrs['segments-radial'] || 12;
    if (tag === 'a-cone') attrs['segments-radial'] = attrs['segments-radial'] || 8;
    const el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(k => el.setAttribute(k, attrs[k]));
    parent.appendChild(el); return el;
  }
  const P = a => a.join(' ');
  function box(parent, pos, size, color, extra) {
    const el = boxEl(parent, pos, size, color, extra);
    if (!extra && parent.id === 'classroom') el.setAttribute('data-merge', '1');
    return el;
  }
  function boxEl(parent, pos, size, color, extra) {
    return E(parent, 'a-box', Object.assign({ position: P(pos), width: size[0], height: size[1], depth: size[2],
      material: 'color:' + color + '; roughness:0.85; metalness:0.05' }, extra || {}));
  }
  function applyCanvas(el, canvas, srgb) {
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const set = () => { const m = el.getObject3D('mesh'); if (m) { m.material.map = tex; m.material.color.set(0xffffff); m.material.needsUpdate = true; } };
    if (el.getObject3D && el.getObject3D('mesh')) set(); else el.addEventListener('loaded', set);
    return tex;
  }
  function canvasOf(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }
  function rtlText(ctx, text, x, y, font, color, align) {
    ctx.direction = 'rtl'; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.font = font; ctx.fillStyle = color; ctx.fillText(text, x, y);
  }
  function sign(parent, text, pos, rotY, w, h, bg, fg) {
    const c = canvasOf(512, Math.round(512 * h / w), (g, W, H) => {
      g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = fg; g.lineWidth = 6; g.strokeRect(8, 8, W - 16, H - 16);
      const lines = text.split('\n'); lines.forEach((l, i) => rtlText(g, l, W / 2, H * (i + 1) / (lines.length + 1), '700 ' + Math.round(H / (lines.length + 1.4)) + 'px Cairo, Tahoma, sans-serif', fg));
    });
    const el = E(parent, 'a-plane', { position: P(pos), rotation: '0 ' + rotY + ' 0', width: w, height: h, material: 'shader:flat; side:double' });
    applyCanvas(el, c); return el;
  }
  function wall(parent, pos, rotY, w, h, color) {
    return E(parent, 'a-plane', { position: P(pos), rotation: '0 ' + rotY + ' 0', width: w, height: h, material: 'color:' + color + '; roughness:1; side:double' });
  }

  /* ---------- people (simple articulated placeholders; facing -z by default) ---------- */
  function person(parent, o) {
    const root = E(parent, 'a-entity', { position: P(o.pos), rotation: '0 ' + (o.rotY || 0) + ' 0' });
    const skin = o.skin || '#c99a74', shirt = o.shirt || '#ffffff', pants = o.pants || '#2b2f3a';
    const hipY = o.seated ? 0.5 : 0.82;
    if (o.seated) {
      [-0.1, 0.1].forEach(x => { box(root, [x, hipY, -0.22], [0.15, 0.15, 0.45], pants);
        E(root, 'a-cylinder', { position: P([x, 0.27, -0.44]), radius: 0.065, height: 0.5, material: 'color:' + pants });
        box(root, [x, 0.03, -0.5], [0.12, 0.06, 0.26], '#1a1a1a'); });
    } else {
      [-0.1, 0.1].forEach(x => { E(root, 'a-cylinder', { position: P([x, hipY / 2, 0]), radius: 0.075, height: hipY, material: 'color:' + pants });
        box(root, [x, 0.03, -0.05], [0.12, 0.06, 0.26], '#1a1a1a'); });
    }
    box(root, [0, hipY + 0.29, 0], [0.42, 0.58, 0.25], shirt);
    if (o.tie) box(root, [0, hipY + 0.38, -0.13], [0.06, 0.34, 0.01], o.tie);
    if (o.jacket) { box(root, [-0.17, hipY + 0.29, -0.005], [0.1, 0.6, 0.27], o.jacket); box(root, [0.17, hipY + 0.29, -0.005], [0.1, 0.6, 0.27], o.jacket); }
    const head = E(root, 'a-entity', { position: P([0, hipY + 0.78, 0]) });
    E(head, 'a-sphere', { radius: 0.115, scale: '1 1.15 1', material: 'color:' + skin + '; roughness:0.8' });
    E(head, 'a-sphere', { radius: 0.12, position: '0 0.05 0.02', scale: '1.0 0.8 1.0', material: 'color:' + (o.hair || '#1c1612') });
    [-0.04, 0.04].forEach(x => E(head, 'a-sphere', { radius: 0.014, position: P([x, 0.02, -0.105]), material: 'color:#101010' }));
    const mouth = box(head, [0, -0.058, -0.108], [0.034, 0.008, 0.01], '#5a1f1f');
    const marker = E(head, 'a-cone', { position: '0 0.33 0', rotation: '180 0 0', 'radius-bottom': 0.055, 'radius-top': 0, height: 0.11, material: 'shader:flat; color:#ffd479', visible: 'false' });
    if (o.mustache) box(head, [0, -0.04, -0.108], [0.08, 0.018, 0.02], '#1c1612');
    if (o.glasses) { [-0.04, 0.04].forEach(x => E(head, 'a-torus', { radius: 0.025, 'radius-tubular': 0.003, position: P([x, 0.02, -0.112]), material: 'color:#222' })); }
    const arms = [-1, 1].map(s => {
      const piv = E(root, 'a-entity', { position: P([s * 0.26, hipY + 0.52, 0]) });
      E(piv, 'a-cylinder', { position: '0 -0.24 0', radius: 0.045, height: 0.5, material: 'color:' + (o.jacket || shirt) });
      E(piv, 'a-sphere', { position: '0 -0.5 0', radius: 0.05, material: 'color:' + skin });
      if (o.seated) piv.object3D.rotation.x = 1.1;
      return piv;
    });
    root.__parts = { arms, head, mouth, marker, seated: !!o.seated }; root.__phase = Math.random() * 6;
    root.setAttribute('person-anim', 'mood:' + (o.mood || 'idle'));
    return root;
  }

  /* ---------- textures ---------- */
  function floorTexture() {
    const c = canvasOf(256, 256, (g, W, H) => {
      g.fillStyle = '#c9c1af'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#bdb5a2' : '#d0c8b6'; g.fillRect(i * 128 + 2, j * 128 + 2, 124, 124); }
    });
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 9.5); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function desktopCanvas(on) {
    return canvasOf(256, 160, (g, W, H) => {
      if (!on) { g.fillStyle = '#050607'; g.fillRect(0, 0, W, H); return; }
      const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#1f5fa8'); gr.addColorStop(1, '#0d2f63'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,0.2)'; for (let i = 0; i < 4; i++) g.fillRect(14, 12 + i * 26, 22, 18);
      g.fillStyle = '#10182a'; g.fillRect(0, H - 14, W, 14);
    });
  }
  function windowCanvas() {
    return canvasOf(256, 180, (g, W, H) => {
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#8fc4ee'); gr.addColorStop(1, '#e8f3fb'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.fillStyle = '#c9b18d'; [[10, 110, 50, 70], [70, 90, 60, 90], [140, 120, 45, 60], [195, 100, 55, 80]].forEach(r => g.fillRect(r[0], r[1], r[2], r[3]));
      g.fillStyle = '#7a5a3a'; g.fillRect(118, 70, 5, 110); g.fillStyle = '#3f7d3a'; for (let a = 0; a < 6; a++) { g.beginPath(); g.ellipse(120 + Math.cos(a) * 18, 70 + Math.sin(a) * 6, 20, 4, a, 0, 6.3); g.fill(); }
    });
  }

  /* ---------- board ---------- */
  const Board = (function () {
    const W = 1280, H = 720; const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; const g = canvas.getContext('2d');
    let tex = null, plane = null;
    const font = (w, s) => w + ' ' + s + 'px Cairo, Tahoma, sans-serif';
    function slide(dim) {
      g.fillStyle = '#f7f9fc'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#1b3a6b'; g.fillRect(0, 0, W, 130);
      rtlText(g, 'مقدمة في تكنولوجيا التعليم', W - 60, 68, font(700, 64), '#fff', 'right');
      ['عناصر الوسائط المتعددة', 'النص والصورة والصوت والفيديو', 'متى نستخدم كل عنصر داخل الدرس؟'].forEach((t, i) => {
        g.fillStyle = '#e8a33d'; g.beginPath(); g.arc(W - 70, 250 + i * 120, 14, 0, 6.3); g.fill();
        rtlText(g, t, W - 110, 250 + i * 120, font(600, 52), '#1d2b44', 'right');
      });
      g.fillStyle = '#2e9d57'; g.beginPath(); g.arc(70, 66, 12, 0, 6.3); g.fill();
      if (dim) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, W, H); }
    }
    function draw(mode, o) {
      o = o || {};
      if (mode === 'off') { g.fillStyle = '#040506'; g.fillRect(0, 0, W, H); }
      else if (mode === 'lesson') slide(false);
      else if (mode === 'frozen') {
        slide(true);
        g.fillStyle = 'rgba(160,20,20,0.92)'; g.fillRect(W / 2 - 330, H / 2 + 20, 660, 100);
        rtlText(g, 'السبورة لا تستجيب للمس', W / 2, H / 2 + 70, font(700, 48), '#fff');
        g.fillStyle = '#ff4d4d'; g.beginPath(); g.moveTo(W / 2, 70); g.lineTo(W / 2 + 80, 210); g.lineTo(W / 2 - 80, 210); g.closePath(); g.fill();
        g.fillStyle = '#fff'; g.fillRect(W / 2 - 6, 105, 12, 60); g.beginPath(); g.arc(W / 2, 185, 8, 0, 6.3); g.fill();
      } else if (mode === 'settings') {
        g.fillStyle = '#0c1f3d'; g.fillRect(0, 0, W, H);
        g.fillStyle = '#13335f'; g.fillRect(0, 0, W, 120);
        rtlText(g, 'إعدادات السبورة  ›  معايرة اللمس', W - 50, 62, font(700, 56), '#fff', 'right');
        rtlText(g, 'المس نقاط المعايرة الأربع بالترتيب الصحيح', W / 2, H / 2 - 20, font(600, 52), '#cfe4ff');
        rtlText(g, 'إذا أخطأت في الترتيب تُعاد المعايرة من البداية', W / 2, H / 2 + 60, font(400, 38), '#8fb2dd');
        const ok = o.done || 0; for (let i = 0; i < 4; i++) { g.fillStyle = i < ok ? '#35d07f' : '#274b7c'; g.beginPath(); g.arc(W / 2 + 90 - i * 60, H - 120, 18, 0, 6.3); g.fill(); }
        if (o.hint) rtlText(g, o.hint, W / 2, H - 50, font(600, 36), '#ffd479');
      } else if (mode === 'calibrated') {
        g.fillStyle = '#0c3b26'; g.fillRect(0, 0, W, H);
        rtlText(g, 'تمت المعايرة بنجاح', W / 2, H / 2, font(700, 78), '#7bffb2');
      }
      if (tex) tex.needsUpdate = true;
    }
    function attach(el) { plane = el; tex = applyCanvas(el, canvas); draw('lesson'); }
    return { draw, attach };
  })();

  /* ---------- build ---------- */
  function build(scene) {
    const root = E(scene, 'a-entity', { id: 'classroom' });
    // shell
    const fl = E(root, 'a-plane', { rotation: '-90 0 0', position: '0 0 0.25', width: 10, height: 9.5, material: 'roughness:0.6; side:double' });
    fl.addEventListener('loaded', () => { const m = fl.getObject3D('mesh'); m.material.map = floorTexture(); m.material.needsUpdate = true; });
    E(root, 'a-plane', { rotation: '90 0 0', position: '0 3.2 0.25', width: 10, height: 9.5, material: 'color:#f4f1ea; side:double' });
    const walls = [[[0, 1.6, -4.5], 0, 10], [[0, 1.6, 5], 180, 10], [[-5, 1.6, 0.25], 90, 9.5], [[5, 1.6, 0.25], -90, 9.5]];
    walls.forEach(w => {
      wall(root, w[0], w[1], w[2], 3.2, '#f1ede2');
      const d = [w[0][0], 0.55, w[0][2]]; const off = 0.012;
      if (w[1] === 0) d[2] += off; else if (w[1] === 180) d[2] -= off; else if (w[1] === 90) d[0] += off; else d[0] -= off;
      wall(root, d, w[1], w[2], 1.1, '#5f93ab');
    });

    // windows on the right wall (x=5)
    const winCanvas = windowCanvas();
    [-2.6, 0.6, 3.6].forEach(z => {
      const w = E(root, 'a-plane', { position: P([4.97, 1.9, z]), rotation: '0 -90 0', width: 1.8, height: 1.3, material: 'shader:flat; side:double' });
      applyCanvas(w, winCanvas);
      if (MOB) return;
      box(root, [4.95, 1.9, z], [0.05, 1.4, 0.06], '#9aa0a6'); box(root, [4.95, 1.9, z - 0.9], [0.05, 1.4, 0.06], '#9aa0a6'); box(root, [4.95, 1.9, z + 0.9], [0.05, 1.4, 0.06], '#9aa0a6');
      box(root, [4.95, 1.25, z], [0.05, 0.06, 1.86], '#9aa0a6'); box(root, [4.95, 2.55, z], [0.05, 0.06, 1.86], '#9aa0a6');
    });
    // door (back wall right)
    box(root, [3.8, 1.05, 4.96], [1.05, 2.1, 0.06], '#7b4b2a'); box(root, [3.35, 1.0, 4.92], [0.05, 0.05, 0.08], '#d9d9d9');
    sign(root, 'معمل الحاسب الآلي', [3.8, 2.55, 4.96], 180, 1.6, 0.4, '#1b3a6b', '#ffffff');
    // front wall dressing
    sign(root, 'الفصل الذكي', [0, 2.95, -4.46], 0, 1.8, 0.3, '#1b3a6b', '#ffd479');
    // flag
    box(root, [-3.7, 1.2, -4.3], [0.04, 2.4, 0.04], '#8a8a8a');
    box(root, [-3.35, 2.2, -4.3], [0.7, 0.14, 0.02], '#ce1126'); box(root, [-3.35, 2.06, -4.3], [0.7, 0.14, 0.02], '#ffffff'); box(root, [-3.35, 1.92, -4.3], [0.7, 0.14, 0.02], '#111111');
    E(root, 'a-sphere', { position: '-3.35 2.06 -4.28', radius: 0.04, material: 'color:#c09300' });
    // left wall: fuse box, AC, notice
    box(root, [-4.93, 1.6, -3.2], [0.12, 0.6, 0.45], '#8e9399');
    box(root, [-4.86, 1.7, -3.2], [0.03, 0.08, 0.12], '#c0392b');
    sign(root, 'لوحة الكهرباء\nخطر', [-4.86, 2.05, -3.2], 90, 0.4, 0.25, '#c0392b', '#ffffff');
    box(root, [-4.75, 2.7, 0.5], [0.4, 0.35, 1.2], '#e9eaec');
    sign(root, 'تعليمات استخدام المعمل\nحافظ على الأجهزة', [-4.97, 1.8, 2.6], 90, 1.1, 0.8, '#fff6dc', '#6b4b00');
    // ceiling lights + point lights
    [-3.0, 0, 3.0].forEach(x => [-2.5, 0.5, 3.5].forEach(z => {
      state.fixtures.push(box(root, [x, 3.15, z], [0.3, 0.06, 1.3], '#ffffff', { material: 'color:#ffffff; emissive:#fffbe8; emissiveIntensity:1.2' }));
    }));
    (MOB ? [] : [[-2.5, -2.0], [2.5, -2.0], [-2.5, 2.2], [2.5, 2.2]]).forEach(p => {
      state.pointLights.push(E(root, 'a-entity', { position: P([p[0], 2.9, p[1]]), light: 'type:point; intensity:0.75; distance:10; decay:1.2; color:#fff6e0' }));
    });
    // ceiling fans
    [[-2.5, 0.5], [2.5, 0.5]].forEach(p => {
      const f = E(root, 'a-entity', { position: P([p[0], 3.0, p[1]]), animation: MOB ? 'enabled:false' : 'property:rotation; to:0 360 0; dur:1800; loop:true; easing:linear' });
      E(f, 'a-cylinder', { radius: 0.05, height: 0.2, material: 'color:#444' });
      [0, 120, 240].forEach(a => { const b = E(f, 'a-entity', { rotation: '0 ' + a + ' 0' }); box(b, [0.5, -0.1, 0], [0.9, 0.02, 0.16], '#5b3d26'); });
      state.fans.push(f);
    });

    // lab stations
    const rows = [0.2, 1.8, 3.4];
    const screenOn = desktopCanvas(true), screenOff = desktopCanvas(false);
    state.screenTex = { on: new THREE.CanvasTexture(screenOn), off: new THREE.CanvasTexture(screenOff) };
    state.screenTex.on.colorSpace = state.screenTex.off.colorSpace = THREE.SRGBColorSpace;
    [-1, 1].forEach(side => rows.forEach((z, r) => {
      const cx = side * 2.8;
      box(root, [cx, 0.74, z], [2.9, 0.05, 0.75], '#b78a55');                 // desk top
      [-1.35, 1.35].forEach(dx => box(root, [cx + dx, 0.37, z], [0.05, 0.74, 0.7], '#8a8f95'));
      box(root, [cx, 0.5, z - 0.3], [2.8, 0.5, 0.02], '#9c7448');             // modesty panel
      [-0.7, 0.7].forEach(dx => {
        const sx = cx + dx;
        box(root, [sx, 0.77, z - 0.05], [0.1, 0.03, 0.18], '#222'); box(root, [sx, 0.88, z - 0.06], [0.04, 0.2, 0.04], '#222');
        box(root, [sx, 1.08, z - 0.08], [0.55, 0.36, 0.04], '#1a1a1a');
        const scr = E(root, 'a-plane', { position: P([sx, 1.08, z - 0.055]), width: 0.5, height: 0.31, material: 'shader:flat' });
        scr.addEventListener('loaded', () => { const m = scr.getObject3D('mesh'); m.material.map = state.screenTex.on; m.material.color.set(0xffffff); m.material.needsUpdate = true; });
        state.screens.push(scr);
        if (MOB) return;
        box(root, [sx, 0.775, z + 0.2], [0.42, 0.02, 0.14], '#2a2a2a'); box(root, [sx + 0.3, 0.775, z + 0.2], [0.06, 0.02, 0.1], '#2a2a2a');
        box(root, [sx - dx * 0.35 + (dx > 0 ? 0.55 : -0.55) * 0, 0.4, z - 0.2], [0.2, 0.4, 0.4], '#2d2d30');  // tower under desk
        // chair
        box(root, [sx, 0.45, z + 0.78], [0.42, 0.05, 0.42], '#2c3e50'); box(root, [sx, 0.7, z + 0.98], [0.42, 0.45, 0.05], '#2c3e50');
        box(root, [sx, 0.22, z + 0.78], [0.05, 0.4, 0.05], '#555');
      });
    }));
    // VR headsets on desks (reference art direction)
    [[-3.2, 0.2], [2.3, 1.8], [3.6, 0.2], [-2.0, 1.8]].forEach(p => { box(root, [p[0], 0.82, p[1] + 0.15], [0.2, 0.1, 0.12], '#f2f2f2'); box(root, [p[0], 0.82, p[1] + 0.2], [0.16, 0.07, 0.03], '#151515'); });
    state.students = [];
    // seated students (placeholders)
    const sCols = ['#ffffff', '#c9d6e8', '#e8d6c9', '#d9e8c9'];
    [[-3.5, 1.8], [-2.1, 0.2], [2.1, 1.8], [3.5, 0.2], [-3.5, 0.2]].forEach((p, i) => {
      state.students.push(person(root, { pos: [p[0], 0, p[1] + 0.72], rotY: 0, seated: true, shirt: sCols[i % 4], pants: '#2f3b52', hair: i % 2 ? '#2a1f18' : '#111', skin: i % 2 ? '#b98a64' : '#d1a47d', mood: 'type' }));
    });
    // teacher desk + PC (interactive)
    box(root, [3.0, 0.38, -3.3], [1.7, 0.76, 0.75], '#a9784a');
    box(root, [3.0, 0.8, -3.3], [0.5, 0.03, 0.2], '#222'); box(root, [3.0, 0.9, -3.32], [0.04, 0.2, 0.04], '#222'); box(root, [3.0, 1.12, -3.32], [0.62, 0.4, 0.04], '#1a1a1a');
    const tscr = E(root, 'a-plane', { position: '3.0 1.12 -3.295', width: 0.56, height: 0.34, material: 'shader:flat' });
    tscr.addEventListener('loaded', () => { const m = tscr.getObject3D('mesh'); m.material.map = state.screenTex.on; m.material.color.set(0xffffff); m.material.needsUpdate = true; });
    state.screens.push(tscr);
    box(root, [3.0, 0.775, -3.1], [0.42, 0.02, 0.14], '#2a2a2a'); box(root, [3.55, 0.45, -3.3], [0.22, 0.42, 0.45], '#2d2d30');
    // signal cable from PC to board
    box(root, [2.0, 0.02, -4.35], [2.0, 0.015, 0.015], '#111');
    box(root, [1.0, 0.02, -4.4], [0.04, 0.04, 0.04], '#333');

    // interactive board
    box(root, [0, 1.6, -4.43], [2.62, 1.55, 0.08], '#22272e');
    const bd = E(root, 'a-plane', { id: 'board-screen', position: '0 1.6 -4.385', width: 2.4, height: 1.35, material: 'shader:flat' });
    Board.attach(bd); state.board = Board;
    box(root, [0, 0.82, -4.4], [1.2, 0.06, 0.12], '#22272e');   // marker tray
    // calibration targets (hidden until needed)
    const spots = { tl: [-1.0, 2.1], tr: [1.0, 2.1], br: [1.0, 1.1], bl: [-1.0, 1.1] };
    Object.keys(spots).forEach(k => {
      const g = E(root, 'a-entity', { id: 'cal-' + k, position: P([spots[k][0], spots[k][1], -4.37]), visible: 'false' });
      E(g, 'a-ring', { 'radius-inner': 0.05, 'radius-outer': 0.085, material: 'shader:flat; color:#7fe9ff; side:double' });
      box(g, [0, 0, 0], [0.2, 0.012, 0.005], '#7fe9ff'); box(g, [0, 0, 0], [0.012, 0.2, 0.005], '#7fe9ff');
      const hit = E(g, 'a-circle', { radius: 0.26, position: '0 0 0.02', 'data-target': 'cal-' + k, 'data-label': 'نقطة معايرة', material: 'opacity:0; transparent:true; depthWrite:false' });
      state.calTargets[k] = { group: g, hit: hit, spot: spots[k] };
    });
    const bhit = E(root, 'a-plane', { class: 'interactable', 'data-target': 'board', 'data-label': 'السبورة التفاعلية', position: '0 1.6 -4.36', width: 2.4, height: 1.35, material: 'opacity:0; transparent:true; depthWrite:false' });

    // people
    state.people.teacher = person(root, { pos: POS.teacher, rotY: 180, shirt: '#cfd9e6', pants: '#33363d', tie: '#7a1f1f', mustache: true, skin: '#c99a74', mood: 'talk' });
    state.people.supervisor = person(root, { pos: POS.supervisor, rotY: 0, seated: true, shirt: '#ffffff', jacket: '#4a4f57', pants: '#3c4048', tie: '#1d3557', glasses: true, hair: '#6e6e6e', skin: '#c19470', mood: 'idle' });
    box(root, [4.2, 0.45, 3.78], [0.45, 0.05, 0.45], '#7b3b2a'); box(root, [4.2, 0.72, 4.0], [0.45, 0.5, 0.05], '#7b3b2a'); box(root, [4.2, 0.22, 3.78], [0.05, 0.4, 0.05], '#555');
    box(root, [4.2, 0.9, 3.55], [0.3, 0.02, 0.22], '#e5d9b5');   // clipboard
    // hit boxes
    const hitStyle = 'opacity:0; transparent:true; depthWrite:false';
    E(root, 'a-box', { class: 'interactable', 'data-target': 'teacher', 'data-label': 'المعلم', position: P([POS.teacher[0], 0.95, POS.teacher[2]]), width: 0.8, height: 1.9, depth: 0.6, material: hitStyle });
    E(root, 'a-box', { class: 'interactable', 'data-target': 'supervisor', 'data-label': 'الموجه التربوي', position: '4.2 0.75 3.9', width: 0.8, height: 1.5, depth: 0.8, material: hitStyle });
    E(root, 'a-box', { class: 'interactable', 'data-target': 'pc', 'data-label': 'حاسب المعلم', position: '3.0 0.95 -3.3', width: 0.9, height: 0.8, depth: 0.5, material: hitStyle });
    // hit planes for calibration targets must be raycastable even when hidden-> toggled via class
    Object.keys(state.calTargets).forEach(k => state.calTargets[k].hit.classList.remove('interactable'));
  }


  /* Merge all static boxes into one mesh per material: ~250 draw calls -> ~15, identical look. */
  function mergeStatic(done) {
    const root = document.getElementById('classroom'), sc = document.querySelector('a-scene'); let tries = 0;
    const iv = setInterval(() => {
      const els = [...root.querySelectorAll('[data-merge]')];
      if (!els.every(e => e.getObject3D('mesh')) && ++tries < 40) return;
      clearInterval(iv);
      try {
        const before = sc.renderer.info.render.calls; sc.object3D.updateMatrixWorld(true);
        const groups = {};
        els.forEach(e => { const m = e.getObject3D('mesh'); if (!m) return; const g = m.geometry.clone(); g.applyMatrix4(m.matrixWorld);
          const k = m.material.color.getHexString() + '|' + m.material.roughness + '|' + m.material.metalness; (groups[k] = groups[k] || { mat: m.material, geos: [] }).geos.push(g); });
        Object.keys(groups).forEach(k => {
          const G = groups[k]; let nv = 0, ni = 0; G.geos.forEach(g => { nv += g.attributes.position.count; ni += g.index.count; });
          const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), idx = new Uint32Array(ni); let vo = 0, io = 0;
          G.geos.forEach(g => { pos.set(g.attributes.position.array, vo * 3); nor.set(g.attributes.normal.array, vo * 3); uv.set(g.attributes.uv.array, vo * 2);
            for (let i = 0; i < g.index.count; i++) idx[io + i] = g.index.array[i] + vo; vo += g.attributes.position.count; io += g.index.count; g.dispose(); });
          const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setIndex(new THREE.BufferAttribute(idx, 1));
          const mesh = new THREE.Mesh(geo, G.mat.clone()); mesh.frustumCulled = false; root.object3D.add(mesh);
        });
        els.forEach(e => e.parentNode && e.parentNode.removeChild(e));
        console.log('merged static boxes:', els.length, 'entities into', Object.keys(groups).length, 'meshes');
      } catch (err) { console.warn('merge skipped', err); }
      if (done) done();
    }, 150);
  }

  function refreshRaycaster() {
    const sc = document.querySelector('a-scene'); if (sc.components.raycaster) sc.components.raycaster.refreshObjects();
  }
  function showCalibration(show) {
    Object.keys(state.calTargets).forEach(k => {
      const t = state.calTargets[k]; t.group.setAttribute('visible', show);
      t.hit.classList.toggle('interactable', show);
      t.group.querySelectorAll('a-ring,a-box').forEach(e => e.setAttribute('material', 'shader:flat; color:#7fe9ff'));
    });
    refreshRaycaster();
  }
  function markTarget(k, color) {
    state.calTargets[k].group.querySelectorAll('a-ring,a-box').forEach(e => e.setAttribute('material', 'shader:flat; color:' + color));
  }
  function setPower(on) {
    state.fixtures.forEach(f => f.setAttribute('material', 'color:#ffffff; emissive:' + (on ? '#fffbe8' : '#000000') + '; emissiveIntensity:' + (on ? 1.2 : 0)));
    state.pointLights.forEach(l => l.setAttribute('light', 'intensity', on ? 0.75 : 0));
    const amb = document.getElementById('ambient'); if (amb) amb.setAttribute('light', 'intensity', on ? (MOB ? 0.95 : 0.45) : 0.16);
    const hm = document.getElementById('hemi'); if (hm) hm.setAttribute('light', 'intensity', on ? (MOB ? 0.7 : 0.35) : 0.1);
    const sn = document.getElementById('sun'); if (sn) sn.setAttribute('light', 'intensity', on ? 0.4 : 0.18);
    state.fans.forEach(f => f.setAttribute('animation', 'enabled', on));
    state.screens.forEach(s => { const m = s.getObject3D('mesh'); if (m) { m.material.map = on ? state.screenTex.on : state.screenTex.off; m.material.needsUpdate = true; } });
  }
  function faceTeacherTo(x, z) {
    const p = state.people.teacher.object3D.position; const yaw = Math.atan2(x - p.x, z - p.z) * 180 / Math.PI + 180;
    state.people.teacher.setAttribute('rotation', '0 ' + yaw + ' 0');
  }
  function setMood(who, mood) {
    if (who === 'students') { state.students.forEach(s => s.setAttribute('person-anim', 'mood', mood)); return; }
    state.people[who].setAttribute('person-anim', 'mood', mood);
  }
  /* who: teacher | supervisor | student. Mouth moves, head bobs, a small yellow marker floats over the speaker. */
  function talk(who, on) {
    const el = who === 'student' ? state.students[0] : state.people[who]; if (!el) return;
    el.__speaking = !!on; const p = el.__parts; if (p) p.marker.setAttribute('visible', !!on);
  }
  function turn(who, yawDeg) { state.people[who].setAttribute('rotation', '0 ' + yawDeg + ' 0'); }
  function worldPos(who) {
    if (who === 'student') { const v = new THREE.Vector3(); state.students[0].object3D.getWorldPosition(v); return [v.x, 1.2, v.z]; }
    const v = new THREE.Vector3(); state.people[who].object3D.getWorldPosition(v); return [v.x, v.y + 1.5, v.z];
  }

  AFRAME.registerComponent('person-anim', {
    schema: { mood: { default: 'idle' } },
    tick(t) {
      if (MOB && t - (this.__last || 0) < 60) return; this.__last = t;
      const el = this.el, p = el.__parts; if (!p) return; const m = this.data.mood, s = t / 1000, ph = el.__phase || 0, sin = Math.sin;
      const [L, R] = p.arms, sit = p.seated, base = sit ? 1.1 : 0.05;   // +x swings the arm FORWARD (-z)
      const arm = (a, x, z) => { a.object3D.rotation.x = x; a.object3D.rotation.z = z || 0; };
      let hx = 0, hy = 0;
      switch (m) {
        case 'type': arm(L, base + sin(s * 7 + ph) * 0.05); arm(R, base + sin(s * 8 + ph) * 0.05); hy = sin(s * 0.5 + ph) * 0.1; hx = 0.12; break;
        case 'chat': arm(L, base + sin(s * 2 + ph) * 0.06); arm(R, base + sin(s * 2.4 + ph) * 0.06); hy = sin(s * 1.4 + ph) * 0.7; break;
        case 'gasp': arm(L, 2.3 + sin(s * 6 + ph) * 0.05, 0.25); arm(R, 2.3 + sin(s * 6 + ph + 1) * 0.05, -0.25); hx = -0.18; break;
        case 'talk': arm(L, 0.5 + sin(s * 2.2) * 0.3, 0.1); arm(R, 0.9 + sin(s * 2.6 + 1) * 0.4, -0.1); hy = sin(s * 0.7) * 0.25; break;
        case 'point': arm(L, 0.1, 0.05); arm(R, 1.6 + sin(s * 1.5) * 0.04, -0.12); break;
        case 'anxious': arm(L, 2.4 + sin(s * 9) * 0.15, 0.5); arm(R, 2.4 + sin(s * 9 + 2) * 0.15, -0.5); hy = sin(s * 3.5) * 0.4; hx = 0.05; break;
        case 'calm': arm(L, 0.2, 0); arm(R, 0.2, 0); break;
        case 'note': arm(L, base, 0); arm(R, 1.25 + sin(s * 6) * 0.06, 0); hx = 0.35; break;
        case 'watch': arm(L, base, 0); arm(R, base, 0); hy = 0.7; hx = 0.03; break;
        default: arm(L, base + sin(s * 0.8 + ph) * 0.03); arm(R, base + sin(s * 0.8 + ph + 1) * 0.03); hy = sin(s * 0.4 + ph) * 0.15;
      }
      if (el.__speaking) { p.mouth.object3D.scale.y = 1 + Math.abs(sin(s * 13)) * 3.2; hx += sin(s * 6) * 0.04; p.marker.object3D.position.y = 0.33 + sin(s * 6) * 0.025; } else p.mouth.object3D.scale.y = 1;
      const h = p.head.object3D.rotation; h.x += (hx - h.x) * 0.12; h.y += (hy - h.y) * 0.12;
    }
  });

  return { build, mergeStatic, setPower, showCalibration, markTarget, setMood, talk, turn, worldPos, faceTeacherTo, Board, state, POS, refreshRaycaster };
})();
