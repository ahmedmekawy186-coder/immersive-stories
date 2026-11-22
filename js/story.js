/* القصة 2: طوارئ السبورة التفاعلية أثناء زيارة الموجه
   State machine: intro -> lesson -> incident -> calm(teacher) -> checkpc -> settings -> calibrate -> resolution -> done
   Reads only Input events; draws through UI / Classroom / AudioEngine; logs through Logger. */
const Story = (function () {
  const C = CONFIG, NAMES = { tl: 'العلوية اليسرى', tr: 'العلوية اليمنى', br: 'السفلية اليمنى', bl: 'السفلية اليسرى' };
  let state = 'boot', busy = false, calSeq = [], calAttempt = 0, calFailed = 0, masteryRuns = 0, errCount = {}, timers = [];

  const log = (ev, o) => Logger.log(ev, Object.assign({ state: state }, o || {}));
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const rig = () => document.getElementById('rig').object3D.position;
  const dist = p => Math.hypot(rig().x - p[0], rig().z - p[2]);
  function go(s) { state = s; log('state_enter'); }
  function stepStart(name) { log('step_start', { step: name }); }
  function stepDone(name) { log('step_complete', { step: name }); }
  function err(kind, target, expected, speaker, text) {
    errCount[kind] = (errCount[kind] || 0) + 1;
    log('error', { target, expected, correct: false, attempt: errCount[kind], detail: kind });
    AudioEngine.error(); UI.say(speaker, text, 9000);
  }
  function neutral(target, detail) { log('interaction', { target, detail }); }

  /* ---- flow ---- */
  function begin() {
    go('intro');
    UI.say('', 'أنت أخصائي تكنولوجيا التعليم، وتقف في الفصل الذكي بمعمل الحاسب أثناء حصة يحضرها الموجه التربوي. استمع جيدًا لما يدور حولك.', 8000);
    UI.objective('استمع إلى الحصة وتأمل المكان');
    later(lesson, 5000);
  }
  function lesson() {
    go('lesson');
    UI.say('المعلم', 'والآن نصل إلى أهم عناصر الوسائط المتعددة: النص والصورة والصوت والفيديو، ولكل عنصر موضع مناسب داخل الدرس…', 8000);
    later(incident, C.lessonMs);
  }
  function incident() {
    go('incident'); busy = true;
    log('incident_power_cut');
    Classroom.setPower(false); AudioEngine.powerCut(); Classroom.Board.draw('off');
    Classroom.setMood('teacher', 'anxious');
    UI.objective('');
    UI.say('', 'ينقطع التيار الكهربائي فجأة… يخيّم الظلام على الفصل، وتتوقف المراوح والأجهزة، وتعلو همهمة الطلاب.', C.outageMs + 600);
    later(() => {
      Classroom.setPower(true); AudioEngine.powerReturn(); Classroom.Board.draw('frozen');
      Classroom.faceTeacherTo(rig().x, rig().z);
      UI.say('المعلم', 'يا إلهي! عاد التيار لكن السبورة لا تستجيب للمس… والموجه التربوي يتابعني الآن، ماذا أفعل؟!', 12000);
      UI.objective('اقترب من المعلم وهدّئه (انقر عليه)');
      busy = false; go('calm'); stepStart('calm_teacher');
    }, C.outageMs);
  }
  function resolution() {
    go('resolution'); busy = true; Classroom.showCalibration(false);
    Classroom.Board.draw('calibrated'); AudioEngine.success(); UI.objective('');
    UI.say('', 'تضيء السبورة وتستجيب للمس من جديد.', 4000);
    later(() => { Classroom.Board.draw('lesson'); Classroom.setMood('teacher', 'talk'); UI.say('المعلم', 'ممتاز! عادت السبورة تستجيب. شكرًا لك، لقد أنقذت الحصة.', 6000); }, 2200);
    later(() => UI.say('', 'يومئ الموجه التربوي برأسه باستحسان ويدوّن ملاحظة في ورقته.', 5000), 6500);
    later(finish, 11500);
  }
  function finish() {
    go('done'); log('session_end'); UI.clearSay();
    UI.summary(Logger.summary()); UI.show('end');
    if (document.pointerLockElement) document.exitPointerLock();
  }

  /* ---- interactions ---- */
  function teacherDialogue() {
    busy = true;
    UI.choices('ماذا تقول للمعلم؟', [
      { id: 'restart_now', ok: false, text: 'سأعيد تشغيل الحاسب بالكامل حالًا.', reply: ['المعلم', 'لا! سنضيع وقت الحصة أمام الموجه… أنا متوتر جدًا، لا أعرف ماذا أفعل!'] , kind: 'tech_before_calm' },
      { id: 'reassure', ok: true, text: 'اهدأ يا أستاذ، تابع الشرح شفهيًا مع الطلاب وأنا أفحص السبورة فورًا.' },
      { id: 'end_lesson', ok: false, text: 'هذا عطل كبير، الأفضل أن ننهي الحصة.', reply: ['المعلم', 'ننهي الحصة؟! والموجه حاضر؟ لا… لا أريد ذلك، يجب أن نكمل بأي طريقة.'], kind: 'abandon_lesson' }
    ], ch => {
      busy = false;
      if (ch.ok) {
        log('dialogue_choice', { target: ch.id, expected: 'reassure', correct: true, attempt: (errCount.calm_dialogue = (errCount.calm_dialogue || 0) + 1) });
        Classroom.setMood('teacher', 'talk'); stepDone('calm_teacher');
        UI.say('المعلم', 'حسنًا… شكرًا لك. سأكمل الشرح شفهيًا للطلاب، وأنت أصلح العطل بسرعة.', 9000);
        UI.objective('توجّه إلى حاسب المعلم وافحص التوصيلات (انقر عليه)');
        go('checkpc'); stepStart('check_pc');
      } else {
        err(ch.kind, ch.id, 'reassure', ch.reply[0], ch.reply[1]);
        log('dialogue_choice', { target: ch.id, expected: 'reassure', correct: false, detail: ch.kind });
        later(teacherDialogue, 2500);
      }
    });
  }
  function pcDialogue() {
    busy = true;
    UI.choices('تقف أمام حاسب المعلم. الشاشة تعمل، لكن السبورة لا تستجيب للمس. ماذا تفعل؟', [
      { id: 'restart_full', ok: false, kind: 'restart_full', text: 'إعادة تشغيل الحاسب بالكامل.', reply: ['', 'تمدّ يدك إلى زر الإيقاف ثم تتذكر أن إعادة التشغيل ستستغرق دقائق ثمينة أمام الموجه. تتراجع قبل أن يفوت الأوان.'] },
      { id: 'check_cable', ok: true, text: 'فحص كابل التوصيل والتأكد من استقرار عمل الحاسب.' },
      { id: 'skip_check', ok: false, kind: 'skip_check', text: 'تجاهل الحاسب والتوجه مباشرة إلى معايرة السبورة.', reply: ['', 'قبل أن تلمس السبورة، تتذكر أن الأصل أن تتأكد أولًا من الكابل ومن أن الحاسب مستقر.'] }
    ], ch => {
      busy = false;
      if (ch.ok) {
        log('dialogue_choice', { target: ch.id, expected: 'check_cable', correct: true });
        stepDone('check_pc'); AudioEngine.click();
        UI.say('', 'تتأكد أن كابل الإشارة موصول بإحكام وأن الحاسب يعمل بثبات. المشكلة إذن في استجابة اللمس، والسبورة تحتاج إلى معايرة.', 10000);
        UI.objective('توجّه إلى السبورة وافتح قائمة الإعدادات (انقر عليها)');
        go('settings'); stepStart('open_settings');
      } else {
        err(ch.kind, ch.id, 'check_cable', ch.reply[0], ch.reply[1]);
        log('dialogue_choice', { target: ch.id, expected: 'check_cable', correct: false, detail: ch.kind });
      }
    });
  }
  function calibrationStart() {
    calSeq = []; calAttempt++;
    Classroom.Board.draw('settings', { done: 0 }); Classroom.showCalibration(true);
    log('calibration_attempt_start', { attempt: calAttempt });
  }
  function calibrationTap(key) {
    if (busy) return;
    const expected = C.calibrationOrder[calSeq.length];
    if (key === expected) {
      calSeq.push(key); Classroom.markTarget(key, '#35d07f'); AudioEngine.boardTap(true);
      log('calibration_point', { target: key, expected, correct: true, attempt: calAttempt, detail: 'position_' + calSeq.length });
      Classroom.Board.draw('settings', { done: calSeq.length });
      if (calSeq.length === C.calibrationOrder.length) {
        log('calibration_attempt_end', { attempt: calAttempt, correct: true });
        masteryRuns++;
        if (masteryRuns >= C.masteryRuns) { stepDone('calibrate'); log('mastery_reached', { attempt: calAttempt }); busy = true; later(resolution, 700); }
      }
    } else {
      busy = true; Classroom.markTarget(key, '#e74c3c'); AudioEngine.boardTap(false); calFailed++;
      errCount.calibration_wrong_order = (errCount.calibration_wrong_order || 0) + 1;
      log('calibration_point', { target: key, expected, correct: false, attempt: calAttempt, detail: 'calibration_wrong_order' });
      log('calibration_attempt_end', { attempt: calAttempt, correct: false, detail: 'wrong_order' });
      log('error', { target: key, expected, correct: false, attempt: errCount.calibration_wrong_order, detail: 'calibration_wrong_order' });
      UI.say('المعلم', calFailed >= C.hintAfterFailedCalibrations ? 'ما زالت لا تستجيب… أظن أن المعايرة تبدأ من الزاوية ' + NAMES[C.calibrationOrder[0]] + ' ثم تتبع اتجاه عقارب الساعة.' : 'لا أرى أي استجابة… هل المعايرة تتم بهذا الترتيب؟', 9000);
      later(() => { Object.keys(NAMES).forEach(k => Classroom.markTarget(k, '#7fe9ff')); busy = false; calibrationStart(); }, 1400);
    }
  }

  function onInput(ev) {
    if (ev.type !== 'activate' || busy) return;
    const t = ev.target;
    if (state === 'done' || state === 'resolution' || state === 'boot' || state === 'intro' || state === 'incident') { neutral(t, 'ignored_in_' + state); return; }
    if (t === 'supervisor') { neutral(t, 'inspect_supervisor'); UI.say('', 'الموجه التربوي جالس في آخر الفصل يتابع بهدوء ويدوّن ملاحظاته. لا يحتاج منك شيئًا الآن.', 6000); return; }
    if (state === 'lesson') { neutral(t, 'during_lesson'); UI.say('', 'المعلم منشغل بالشرح الآن. أنصت قليلًا.', 4000); return; }

    if (state === 'calm') {
      if (t === 'teacher') { if (dist(Classroom.POS.teacher) > C.interactDistance) { neutral(t, 'too_far'); UI.say('', 'أنت بعيد عن المعلم ولن يسمعك وسط الهمهمة. اقترب منه (WASD).', 5000); return; } log('interaction', { target: t, correct: true, expected: 'teacher', detail: 'open_dialogue' }); teacherDialogue(); return; }
      if (t === 'pc' || t === 'board' || t.indexOf('cal-') === 0) { err('tech_before_calm', t, 'teacher', 'المعلم', t === 'board' ? 'السبورة لا تتجاوب مع لمستك… والموجه ينظر إلينا! ألا يجب أن نهدأ أولًا؟!' : 'قبل أن تفحص أي شيء، هل يمكنك أن تهدّئني؟ الموجه ينظر إلينا!'); return; }
    }
    if (state === 'checkpc') {
      if (t === 'pc') { if (dist(Classroom.POS.pc) > C.interactDistance) { neutral(t, 'too_far'); UI.say('', 'أنت بعيد عن حاسب المعلم. اقترب منه.', 5000); return; } log('interaction', { target: t, correct: true, expected: 'pc', detail: 'open_pc_options' }); pcDialogue(); return; }
      if (t === 'board') { err('skipped_check', t, 'pc', '', 'تلمس السبورة فلا يحدث شيء. تتذكر أنك لم تتأكد بعد من توصيلات الحاسب والكابل.'); return; }
      if (t === 'teacher') { neutral(t, 'talk_teacher'); UI.say('المعلم', 'أكملتُ الشرح شفهيًا مع الطلاب… أرجو أن تصلح السبورة بسرعة.', 6000); return; }
    }
    if (state === 'settings') {
      if (t === 'board') {
        if (dist(Classroom.POS.board) > 5.6) { neutral(t, 'too_far'); UI.say('', 'اقترب من السبورة لتصل إليها.', 4000); return; }
        log('interaction', { target: t, correct: true, expected: 'board', detail: 'open_settings_menu' });
        stepDone('open_settings'); AudioEngine.boardTap(true);
        UI.say('', 'تلمس السبورة بإصبعك فتظهر قائمة الإعدادات على شاشة اللمس الاحتياطية، وفيها خيار معايرة اللمس.', 8000);
        UI.objective('المس نقاط المعايرة الأربع بالترتيب الصحيح');
        go('calibrate'); stepStart('calibrate'); calibrationStart(); return;
      }
      if (t === 'teacher' || t === 'pc') { neutral(t, 'not_needed_now'); UI.say('', 'الآن دور السبورة نفسها.', 3500); return; }
    }
    if (state === 'calibrate') {
      if (t.indexOf('cal-') === 0) { calibrationTap(t.slice(4)); return; }
      neutral(t, 'not_needed_now'); return;
    }
    neutral(t, 'unhandled');
  }

  Input.on(onInput);
  return { begin, getState: () => state, _debug: { go } };
})();
