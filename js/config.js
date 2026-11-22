/* إعدادات المشروع / Project settings */
(function () {
  const q = new URLSearchParams(location.search);
  const level = ['desktop', 'touch', 'vr'].includes(q.get('level')) ? q.get('level') : 'desktop';
  window.CONFIG = {
    // phones (incl. "Desktop site" mode, which hides the Android UA): play per-line mp3 files through a plain <audio> element
    mobile: q.get('files') === '1' || (q.get('files') !== '0' && (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 0 && Math.min(screen.width, screen.height) < 900))),
    FILES: {"back1": "audio/1-back1.mp3?v=3", "back2": "audio/2-back2.mp3?v=3", "back3": "audio/3-back3.mp3?v=3", "c1": "audio/4-c1.mp3?v=3", "c1r": "audio/5-c1r.mp3?v=3", "c2": "audio/6-c2.mp3?v=3", "c2r": "audio/7-c2r.mp3?v=3", "c3": "audio/8-c3.mp3?v=3", "c3r": "audio/9-c3r.mp3?v=3", "calm1": "audio/10-calm1.mp3?v=3", "cut1": "audio/11-cut1.mp3?v=3", "cut2": "audio/12-cut2.mp3?v=3", "cw1": "audio/13-cw1.mp3?v=3", "cw2": "audio/14-cw2.mp3?v=3", "les1": "audio/15-les1.mp3?v=3", "les2": "audio/16-les2.mp3?v=3", "les3": "audio/17-les3.mp3?v=3", "open1": "audio/18-open1.mp3?v=3", "open2": "audio/19-open2.mp3?v=3", "p1": "audio/20-p1.mp3?v=3", "p1r": "audio/21-p1r.mp3?v=3", "p2": "audio/22-p2.mp3?v=3", "p2r": "audio/23-p2r.mp3?v=3", "p3": "audio/24-p3.mp3?v=3", "p3r": "audio/25-p3r.mp3?v=3", "res1": "audio/26-res1.mp3?v=3", "res2": "audio/27-res2.mp3?v=3", "res3": "audio/28-res3.mp3?v=3", "res4": "audio/29-res4.mp3?v=3", "set1": "audio/30-set1.mp3?v=3", "skipcheck": "audio/31-skipcheck.mp3?v=3", "w_board": "audio/32-w_board.mp3?v=3", "w_other": "audio/33-w_other.mp3?v=3"},
    PRELOAD: ["audio/18-open1.mp3?v=3", "audio/19-open2.mp3?v=3", "audio/11-cut1.mp3?v=3"],
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
    voiceUrl: "audio/1-voice.mp3",   // one mp3 with all recorded lines (Arabic neural TTS, rendered offline)
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
    VOICE: {"open1": [0.0, 10.918], "open2": [11.168, 14.094], "les1": [25.512, 11.184], "les2": [36.946, 4.825], "les3": [42.021, 9.939], "cut1": [52.21, 3.321], "cut2": [55.781, 11.0], "back1": [67.032, 7.647], "back2": [74.929, 8.663], "back3": [83.842, 4.376], "c1": [88.468, 3.334], "c1r": [92.053, 7.255], "c2": [99.558, 6.98], "c2r": [106.788, 7.514], "c3": [114.551, 3.561], "c3r": [118.363, 7.572], "calm1": [126.184, 12.834], "w_board": [139.268, 7.943], "w_other": [147.462, 5.836], "p1": [153.547, 2.926], "p1r": [156.724, 12.511], "p2": [169.484, 4.938], "p2r": [174.672, 12.869], "p3": [187.791, 4.044], "p3r": [192.085, 7.684], "skipcheck": [200.019, 8.925], "set1": [209.194, 13.955], "cw1": [223.399, 3.902], "cw2": [227.551, 7.568], "res1": [235.369, 8.155], "res2": [243.774, 7.039], "res3": [251.062, 7.447], "res4": [258.76, 7.051]}
  };
})();
