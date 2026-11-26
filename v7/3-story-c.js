/* القصة 2: طوارئ السبورة التفاعلية أثناء زيارة الموجه
   State machine: intro -> lesson -> incident -> calm(teacher) -> checkpc -> settings -> calibrate -> resolution -> done
   Reads only Input events; speaks through UI.line (recorded voices), draws through Classroom, logs through Logger. */
const Story = (function () {
  const C = CONFIG, WHOKEY = { 'المعلم': 'teacher', 'الموجه': 'supervisor', 'طالب': 'student' };
  let state = 'boot', busy = false, calSeq = [], calAttempt = 0, calFailed = 0, masteryRuns = 0, errCount = {};
  const SPOTS = { teacher: { at: [-1.7, -1.7], look: [-1.7, -3.1] }, pc: { at: [2.7, -1.9], look: [3.0, -3.3] }, board: { at: [0, -2.4], look: [0, -4.4] } };

  const wait = ms => new Promise(r => setTimeout(r, C.fast ? ms * 0.05 : ms));
  const log = (ev, o) => Logger.log(ev, Object.assign({ state: state }, o || {}));
  const rigEl = () => document.getElementById('rig');
  const rig = () => rigEl().object3D.position;
  const dist = p => Math.hypot(rig().x - p[0], rig().z - p[2]);
  function go(s) { state = s; document.body.dataset.story=s; log('state_enter'); const st = document.getElementById('status'); if (st) st.textContent = (st.textContent.split(' | ')[0] || '') + ' | state: ' + s + ' | audio: ' + (AudioEngine.mode ? AudioEngine.mode() : '') + (st.dataset.perf || ''); }
  function stepStart(name) { log('step_start', { step: name }); }
  function stepDone(name) { log('step_complete', { step: name }); }
  function walkEnabled(v) { rigEl().setAttribute('wasd-controls', 'enabled', v); }

  /* spoken line by id (see CONFIG.LINES / CONFIG.VOICE). Speaker's mouth moves and a marker floats over them. */
  async function L(id) {
    const ln = C.LINES[id], who = ln[0], k = WHOKEY[who];
    let pos = null; if (k) { try { pos = Classroom.worldPos(k); } catch (e) {} }
    if (k) Classroom.talk(k, true);
    try { await UI.line(who, ln[1], { id: id, pos: pos }); } finally { if (k) Classroom.talk(k, false); }
  }
  function err(kind, target, expected, id) {
    errCount[kind] = (errCount[kind] || 0) + 1;
    log('error', { target, expected, correct: false, attempt: errCount[kind], detail: kind });
    AudioEngine.error(); return L(id);
  }
  function neutral(target, detail) { log('interaction', { target, detail }); }

  /* camera glide + turn (also the "tap to go there" for touch / no-keyboard players) */
  function glide(at, look, ms) {
    return new Promise(res => {
      const p = rig(), x0 = p.x, z0 = p.z, t0 = performance.now(), d = C.fast ? 1 : ms;
      const lc = document.getElementById('cam').components['look-controls'], yo = lc && lc.yawObject, po = lc && lc.pitchObject;
      const y0 = yo ? yo.rotation.y : 0, pi0 = po ? po.rotation.x : 0;
      let y1 = 0; if (look) { y1 = Math.atan2(-(look[0] - at[0]), -(look[1] - at[1])); while (y1 - y0 > Math.PI) y1 -= 2 * Math.PI; while (y1 - y0 < -Math.PI) y1 += 2 * Math.PI; }
      (function step() {
        const k = Math.min(1, (performance.now() - t0) / d), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        p.x = x0 + (at[0] - x0) * e; p.z = z0 + (at[1] - z0) * e;
        if (yo && look) yo.rotation.y = y0 + (y1 - y0) * e; if (po) po.rotation.x = pi0 * (1 - e);
        if (k < 1) requestAnimationFrame(step); else res();
      })();
    });
  }
  async function approach(name) {
    const s = SPOTS[name], lim = name === 'board' ? 3.2 : 2.6;
    if (dist(Classroom.POS[name]) <= lim) return;
    await glide(s.at, s.look, 1500);
  }

  /* ---- flow ---- */
  async function begin() {
    go('intro'); busy = true; walkEnabled(false);
    rig().x = 3.9; rig().z = 4.6;
    Classroom.setMood('teacher', 'talk'); Classroom.setMood('supervisor', 'note'); Classroom.setMood('students', 'type');
    UI.cine('طوارئ السبورة', 'القصة الثانية  •  التدريب الميداني');
    await wait(2600);
    UI.cineHide(); await wait(1200);                     // fade to the classroom: the narration plays over the scene
    glide([0.9, 3.0], [-1.0, -3.0], 14000);            // the camera walks you in from the door
    await L('open1'); await L('open2'); await wait(500);
    await lesson();
  }
  async function lesson() {
    go('lesson');
    await L('les1');
    Classroom.setMood('students', 'chat'); await wait(500); Classroom.setMood('students', 'type');
    await L('les2');
    Classroom.turn('teacher', 150); Classroom.setMood('teacher', 'point');         // stays mostly facing the class, gestures to the screen sideways
    await L('les3');
    await wait(900);
    await incident();
  }
  async function incident() {
    go('incident'); log('incident_power_cut');
    Classroom.setPower(false); AudioEngine.powerCut(); Classroom.Board.draw('off'); UI.flash();
    Classroom.setMood('teacher', 'anxious'); Classroom.setMood('students', 'gasp'); Classroom.setMood('supervisor', 'watch');
    Classroom.faceTeacherTo(rig().x, rig().z);
    await L('cut1');
    Classroom.setMood('students', 'chat');
    await L('cut2');
    Classroom.setPower(true); AudioEngine.powerReturn(); Classroom.Board.draw('frozen');
    await wait(500); await L('back1');
    Classroom.setMood('students', 'chat');
    await L('back2'); await L('back3');
    UI.objective('اقترب من المعلم وهدّئه (انقر عليه)');
    walkEnabled(true); busy = false; go('calm'); stepStart('calm_teacher');
  }
  async function resolution() {
    go('resolution'); busy = true; Classroom.showCalibration(false); UI.objective('');
    Classroom.Board.draw('calibrated'); AudioEngine.success();
    await L('res1'); Classroom.Board.draw('lesson'); Classroom.setMood('teacher', 'talk'); Classroom.setMood('students', 'type');
    await L('res2'); Classroom.setMood('supervisor', 'note'); await L('res3'); await L('res4');
    await finish();
  }
  async function finish() {
    go('done'); log('session_end'); UI.clearSay(); walkEnabled(false);
    UI.cine('انتهت القصة', 'شكرًا لك'); await wait(2600);
    UI.cineHide(); UI.summary(Logger.summary()); UI.show('end');
    if (document.pointerLockElement) document.exitPointerLock();
  }

  /* ---- interactions ---- */
  async function teacherDialogue() {
    busy = true; UI.objective('');
    const ch = await UI.choose('ماذا تقول للمعلم؟', [
      { id: 'restart_now', ok: false, say: 'c1', rep: 'c1r', text: 'هعيد تشغيل الجهاز بالكامل حالًا.', kind: 'tech_before_calm' },
      { id: 'reassure', ok: true, say: 'c2', rep: 'c2r', text: 'اهدا يا أستاذ. كمّل الشرح للطلاب شفوي، وأنا هفحص السبورة فورًا.' },
      { id: 'end_lesson', ok: false, say: 'c3', rep: 'c3r', text: 'ده عطل كبير، الأفضل ننهي الحصة.', kind: 'abandon_lesson' }
    ]);
    await L(ch.say);
    if (ch.ok) {
      log('dialogue_choice', { target: ch.id, expected: 'reassure', correct: true, attempt: (errCount.calm_dialogue = (errCount.calm_dialogue || 0) + 1) });
      Classroom.setMood('teacher', 'talk'); stepDone('calm_teacher');
      await L(ch.rep); Classroom.setMood('supervisor', 'note'); await L('calm1');
      UI.objective('توجّه إلى حاسب المعلم وافحص التوصيلات (انقر عليه)');
      go('checkpc'); stepStart('check_pc'); busy = false;
    } else {
      await err(ch.kind, ch.id, 'reassure', ch.rep);
      log('dialogue_choice', { target: ch.id, expected: 'reassure', correct: false, detail: ch.kind });
      await wait(600); return teacherDialogue();
    }
  }
  async function pcDialogue() {
    busy = true; UI.objective('');
    const ch = await UI.choose('تقف أمام حاسب المعلم. الشاشة تعمل، لكن السبورة لا تستجيب للمس. ماذا تفعل؟', [
      { id: 'restart_full', ok: false, kind: 'restart_full', say: 'p1', rep: 'p1r', text: 'إعادة تشغيل الحاسب بالكامل.' },
      { id: 'check_cable', ok: true, say: 'p2', rep: 'p2r', text: 'فحص كابل التوصيل والتأكد من استقرار عمل الحاسب.' },
      { id: 'skip_check', ok: false, kind: 'skip_check', say: 'p3', rep: 'p3r', text: 'تجاهل الحاسب والتوجه مباشرة إلى معايرة السبورة.' }
    ]);
    await L(ch.say);
    if (ch.ok) {
      log('dialogue_choice', { target: ch.id, expected: 'check_cable', correct: true });
      stepDone('check_pc'); AudioEngine.click(); await L(ch.rep);
      UI.objective('توجّه إلى السبورة وافتح قائمة الإعدادات (انقر عليها)');
      go('settings'); stepStart('open_settings'); busy = false;
    } else {
      await err(ch.kind, ch.id, 'check_cable', ch.rep);
      log('dialogue_choice', { target: ch.id, expected: 'check_cable', correct: false, detail: ch.kind });
      UI.objective('افحص حاسب المعلم (انقر عليه)'); busy = false;
    }
  }
  function calibrationStart() {
    calSeq = []; calAttempt++;
    Classroom.Board.draw('settings', { done: 0 }); Classroom.showCalibration(true);
    C.calibrationOrder.forEach(k=>Classroom.markTarget(k,'#38d99b')); Classroom.markTarget(C.calibrationOrder[0],'#ffb347');
    log('calibration_attempt_start', { attempt: calAttempt });
  }
  async function calibrationTap(key) {
    const expected = C.calibrationOrder[calSeq.length];
    if (key === expected) {
      calSeq.push(key); Classroom.markTarget(key, '#35d07f'); window.dispatchEvent(new CustomEvent('hand-target',{detail:key})); AudioEngine.boardTap(true);
      log('calibration_point', { target: key, expected, correct: true, attempt: calAttempt, detail: 'position_' + calSeq.length });
      Classroom.Board.draw('settings', { done: calSeq.length });
      if(calSeq.length<C.calibrationOrder.length) Classroom.markTarget(C.calibrationOrder[calSeq.length],'#ffb347');
      if (calSeq.length === C.calibrationOrder.length) {
        log('calibration_attempt_end', { attempt: calAttempt, correct: true });
        masteryRuns++;
        if (masteryRuns >= C.masteryRuns) { stepDone('calibrate'); log('mastery_reached', { attempt: calAttempt }); busy = true; await wait(700); resolution(); }
      }
    } else {
      busy = true; Classroom.markTarget(key, '#e74c3c'); AudioEngine.boardTap(false); calFailed++;
      errCount.calibration_wrong_order = (errCount.calibration_wrong_order || 0) + 1;
      log('calibration_point', { target: key, expected, correct: false, attempt: calAttempt, detail: 'calibration_wrong_order' });
      log('calibration_attempt_end', { attempt: calAttempt, correct: false, detail: 'wrong_order' });
      log('error', { target: key, expected, correct: false, attempt: errCount.calibration_wrong_order, detail: 'calibration_wrong_order' });
      const speaking = L(calFailed >= C.hintAfterFailedCalibrations ? 'cw2' : 'cw1');
      await wait(1400);
      Object.keys(Classroom.state.calTargets).forEach(k => Classroom.markTarget(k, '#7fe9ff'));
      calibrationStart(); busy = false;     // board resets while the teacher is still talking
      speaking.catch(() => {});
    }
  }

  function onInput(ev) {
    if (ev.type !== 'activate' || busy) return;
    handle(ev.target).catch(e => { console.error(e); busy = false; });
  }
  async function handle(t) {
    if (state === 'done' || state === 'resolution' || state === 'boot' || state === 'intro' || state === 'incident' || state === 'lesson') { neutral(t, 'ignored_in_' + state); return; }
    if (t === 'supervisor') { neutral(t, 'inspect_supervisor'); UI.say('', 'الموجه التربوي جالس على جانب الفصل يتابع بهدوء ويدوّن ملاحظاته. لا يحتاج منك شيئًا الآن.', 5000); return; }

    if (state === 'calm') {
      if (t === 'teacher') { busy = true; await approach('teacher'); log('interaction', { target: t, correct: true, expected: 'teacher', detail: 'open_dialogue' }); await teacherDialogue(); return; }
      if (t === 'pc' || t === 'board' || t.indexOf('cal-') === 0) { busy = true; await err('tech_before_calm', t, 'teacher', t === 'board' ? 'w_board' : 'w_other'); busy = false; return; }
    }
    if (state === 'checkpc') {
      if (t === 'pc') { busy = true; await approach('pc'); log('interaction', { target: t, correct: true, expected: 'pc', detail: 'open_pc_options' }); await pcDialogue(); return; }
      if (t === 'board') { busy = true; await err('skipped_check', t, 'pc', 'skipcheck'); busy = false; return; }
      if (t === 'teacher') { neutral(t, 'talk_teacher'); UI.say('المعلم', 'أكملتُ الشرح شفهيًا مع الطلاب… أرجو أن تصلح السبورة بسرعة.', 5000); return; }
    }
    if (state === 'settings') {
      if (t === 'board') {
        busy = true; await glide([0,-2.35],[0,-4.4],900); walkEnabled(false);
        log('interaction', { target: t, correct: true, expected: 'board', detail: 'open_settings_menu' });
        stepDone('open_settings'); AudioEngine.boardTap(true);
        UI.objective('المس نقاط المعايرة الأربع بالترتيب الصحيح');
        go('calibrate'); stepStart('calibrate'); calibrationStart();
        const sp = L('set1'); busy = false; sp.catch(() => {}); return;   // narration plays while you can already tap targets
      }
      if (t === 'teacher' || t === 'pc') { neutral(t, 'not_needed_now'); UI.say('', 'الآن دور السبورة نفسها.', 3000); return; }
    }
    if (state === 'calibrate') {
      if (t.indexOf('cal-') === 0) { await calibrationTap(t.slice(4)); return; }
      neutral(t, 'not_needed_now'); return;
    }
    neutral(t, 'unhandled');
  }

  Input.on(onInput);
  return { begin, getState: () => state, isBusy: () => busy, _debug: { go } };
})();
