/* إعدادات المشروع / Project settings */
(function () {
  const q = new URLSearchParams(location.search);
  const level = ['desktop', 'touch', 'vr'].includes(q.get('level')) ? q.get('level') : 'desktop';
  window.CONFIG = {
    // phones (incl. "Desktop site" mode, which hides the Android UA): play per-line mp3 files through a plain <audio> element
    mobile: q.get('files') === '1' || (q.get('files') !== '0' && (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 0 && Math.min(screen.width, screen.height) < 900))),
    FILES: {"back1": "audio4/1-back1.mp3?v=4", "back2": "audio4/2-back2.mp3?v=4", "back3": "audio4/3-back3.mp3?v=4", "c1": "audio4/4-c1.mp3?v=4", "c1r": "audio4/5-c1r.mp3?v=4", "c2": "audio4/6-c2.mp3?v=4", "c2r": "audio4/7-c2r.mp3?v=4", "c3": "audio4/8-c3.mp3?v=4", "c3r": "audio4/9-c3r.mp3?v=4", "calm1": "audio4/10-calm1.mp3?v=4", "cut1": "audio4/11-cut1.mp3?v=4", "cut2": "audio4/12-cut2.mp3?v=4", "cw1": "audio4/13-cw1.mp3?v=4", "cw2": "audio4/14-cw2.mp3?v=4", "les1": "audio4/15-les1.mp3?v=4", "les2": "audio4/16-les2.mp3?v=4", "les3": "audio4/17-les3.mp3?v=4", "open1": "audio4/18-open1.mp3?v=4", "open2": "audio4/19-open2.mp3?v=4", "p1": "audio4/20-p1.mp3?v=4", "p1r": "audio4/21-p1r.mp3?v=4", "p2": "audio4/22-p2.mp3?v=4", "p2r": "audio4/23-p2r.mp3?v=4", "p3": "audio4/24-p3.mp3?v=4", "p3r": "audio4/25-p3r.mp3?v=4", "res1": "audio4/26-res1.mp3?v=4", "res2": "audio4/27-res2.mp3?v=4", "res3": "audio4/28-res3.mp3?v=4", "res4": "audio4/29-res4.mp3?v=4", "set1": "audio4/30-set1.mp3?v=4", "skipcheck": "audio4/31-skipcheck.mp3?v=4", "w_board": "audio4/32-w_board.mp3?v=4", "w_other": "audio4/33-w_other.mp3?v=4"},
    PRELOAD: ["audio4/18-open1.mp3?v=4", "audio4/19-open2.mp3?v=4", "audio4/11-cut1.mp3?v=4"],
    level,                       // desktop (low) | touch (medium) | vr (high) -- only desktop is built in v1
    fast: q.get('fast') === '1', // test mode: skips speech/waits (used by automated tests only)
    lessonMs: 9000, outageMs: 3800,
    interactDistance: 4.6,       // meters: max distance to talk to the teacher
    // Calibration order as seen by the student facing the board:
    // tl = top-left, tr = top-right, br = bottom-right, bl = bottom-left.
    // NOTE: the thesis documents say "the four points in the correct order" without naming the order.
    // Confirm it against the real board model, then edit here (and re-record lines cw2 / set1 if the order changes).
    calibrationOrder: ['tl', 'tr', 'br', 'bl'],
    hintAfterFailedCalibrations: 2,
    masteryRuns: 1,              // number of fully-correct calibration runs required
    voiceUrl: "audio4/34-zz_voice.mp3?v=4",   // one mp3 with all recorded lines (Arabic neural TTS, rendered offline)
    /* every spoken line: id -> [speaker, text]. Speakers: الراوي (narrator), المعلم, طالب, الموجه, أنت (the player) */
    LINES: {
 "open1": [
  "الراوي",
  "الحصة الثالثة في معمل الحاسب. اليوم بالذات، يزور الموجه التربوي الفصل، والجميع متوتر قليلًا."
 ],
 "open2": [
  "الراوي",
  "أنت أخصائي تكنولوجيا التعليم في المدرسة. تقف عند الباب وتتأمل الفصل، وتعرف أن أي عطل صغير اليوم قد يتحول إلى موقف محرج أمام الموجه."
 ],
 "les1": [
  "المعلم",
  "صباح الخير يا شباب. النهارده هنتكلم عن عناصر الوسائط المتعددة: النص، والصورة، والصوت، والفيديو."
 ],
 "les2": [
  "طالب",
  "يا أستاذ، إحنا بنستخدم الفيديو في الدرس إمتى بالظبط؟"
 ],
 "les3": [
  "المعلم",
  "سؤال حلو. بنستخدم الفيديو لما نحتاج نشرح حركة أو خطوات. تعالوا نفتح الشريحة اللي بعدها على السبورة."
 ],
 "cut1": [
  "طالب",
  "إيه ده؟! النور راح!"
 ],
 "cut2": [
  "الراوي",
  "ساد الظلام فجأة، وتوقفت المراوح وأجهزة الحاسب. ارتفعت همهمة الطلاب، والتفت الموجه ناحية المعلم."
 ],
 "back1": [
  "الراوي",
  "عاد التيار بعد لحظات، لكن السبورة ما زالت متجمدة، لا تستجيب للمس."
 ],
 "back2": [
  "المعلم",
  "يا نهار أبيض! السبورة مش بتستجيب! والموجه بيتفرج عليا دلوقتي… أعمل إيه؟!"
 ],
 "back3": [
  "الموجه",
  "همم… أنا منتظر يا أستاذ."
 ],
 "c1": [
  "أنت",
  "هعيد تشغيل الجهاز بالكامل حالًا."
 ],
 "c1r": [
  "المعلم",
  "لا! هنضيع وقت الحصة قدام الموجه… أنا متوتر جدًا ومش عارف أعمل إيه!"
 ],
 "c2": [
  "أنت",
  "اهدا يا أستاذ. كمّل الشرح للطلاب شفوي، وأنا هفحص السبورة فورًا."
 ],
 "c2r": [
  "المعلم",
  "حاضر… شكرًا. هكمل الشرح شفوي، وانت شوف العطل بسرعة."
 ],
 "c3": [
  "أنت",
  "ده عطل كبير، الأفضل ننهي الحصة."
 ],
 "c3r": [
  "المعلم",
  "ننهي الحصة؟! والموجه حاضر؟ لا لا، لازم نكمل بأي طريقة."
 ],
 "calm1": [
  "الراوي",
  "استعاد المعلم هدوءه وعاد يشرح للطلاب، بينما يدوّن الموجه ملاحظة في ورقته. والآن، ابدأ بالأساس: حاسب المعلم."
 ],
 "w_board": [
  "المعلم",
  "السبورة مش بتتجاوب مع لمستك… والموجه بيبص علينا! مش المفروض نهدى الأول؟!"
 ],
 "w_other": [
  "المعلم",
  "قبل ما تفحص أي حاجة، ممكن تهديني؟ الموجه بيبص علينا!"
 ],
 "p1": [
  "أنت",
  "هعيد تشغيل الحاسب بالكامل."
 ],
 "p1r": [
  "الراوي",
  "تمد يدك إلى زر الإيقاف، ثم تتذكر أن إعادة التشغيل ستستغرق دقائق ثمينة أمام الموجه. فتتراجع قبل فوات الأوان."
 ],
 "p2": [
  "أنت",
  "هفحص كابل التوصيل وأتأكد إن الحاسب شغال بثبات."
 ],
 "p2r": [
  "الراوي",
  "تتأكد أن كابل الإشارة موصول بإحكام، وأن الحاسب يعمل بثبات. إذن المشكلة في استجابة اللمس، والسبورة تحتاج إلى معايرة."
 ],
 "p3": [
  "أنت",
  "هسيب الحاسب وأروح أعاير السبورة على طول."
 ],
 "p3r": [
  "الراوي",
  "قبل أن تلمس السبورة، تتذكر أن الأصل أن تطمئن أولًا على الكابل وعلى استقرار الحاسب."
 ],
 "skipcheck": [
  "الراوي",
  "تلمس السبورة فلا يحدث شيء. تتذكر أنك لم تتأكد بعد من توصيلات الحاسب والكابل."
 ],
 "set1": [
  "الراوي",
  "تلمس السبورة بإصبعك، فتظهر قائمة الإعدادات على الشاشة الاحتياطية، وفيها خيار معايرة اللمس. المس نقاط المعايرة الأربع بالترتيب الصحيح."
 ],
 "cw1": [
  "المعلم",
  "مش شايف أي استجابة… هي المعايرة بتتم بالترتيب ده؟"
 ],
 "cw2": [
  "المعلم",
  "لسه مش بتستجيب… أظن إن المعايرة بتبدأ من الركن العلوي الأيسر، وبعدين مع عقارب الساعة."
 ],
 "res1": [
  "الراوي",
  "تلمس النقطة الأخيرة، فيرتجف الضوء على السبورة، ثم تضيء من جديد وتعود إلى الدرس."
 ],
 "res2": [
  "المعلم",
  "الله! اشتغلت! شكرًا يا بشمهندس، أنقذت الحصة."
 ],
 "res3": [
  "الموجه",
  "أحسنتم. تعاملتم مع العطل بهدوء وسرعة، وهذا هو المطلوب."
 ],
 "res4": [
  "الراوي",
  "ابتسم المعلم، وعاد الطلاب إلى درسهم. لقد أُنقذت الحصة."
 ]
},
    /* id -> [start_seconds, duration_seconds] inside the voice mp3 */
    VOICE: {"open1": [0.0, 10.987], "open2": [11.237, 13.172], "les1": [24.659, 11.179], "les2": [36.088, 4.626], "les3": [40.964, 9.935], "cut1": [51.149, 4.068], "cut2": [55.467, 12.195], "back1": [67.912, 9.042], "back2": [77.204, 8.663], "back3": [86.117, 4.065], "c1": [90.432, 3.334], "c1r": [94.016, 7.255], "c2": [101.521, 6.98], "c2r": [108.751, 7.514], "c3": [116.515, 3.561], "c3r": [120.326, 7.572], "calm1": [128.148, 14.767], "w_board": [143.164, 7.943], "w_other": [151.358, 5.836], "p1": [157.443, 2.926], "p1r": [160.62, 11.166], "p2": [172.036, 4.938], "p2r": [177.223, 13.771], "p3": [191.245, 4.044], "p3r": [195.539, 7.26], "skipcheck": [203.049, 8.13], "set1": [211.429, 2.54], "cw1": [214.219, 4.814], "cw2": [219.283, 7.568], "res1": [227.101, 0.473], "res2": [227.824, 2.693], "res3": [230.766, 1.569], "res4": [232.585, 7.182]}
  };
})();
