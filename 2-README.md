# بيئة القصص الرقمية الغامرة | Immersive Digital Story Environment

**العربية**

بيئة تعلّم ثلاثية الأبعاد تعمل من المتصفح مباشرة (A-Frame / WebXR)، مبنية لرسالة الماجستير: *أثر اختلاف مستويات الانغماس (منخفض – متوسط – مرتفع) في بيئات التعلم القائمة على القصص الرقمية الغامرة على الفهم الإجرائي والكفاءة الذاتية المهنية لدى طلاب تكنولوجيا التعليم وتصوراتهم نحوها*.

### ما الموجود في الإصدار v1
- **القصة الثانية**: «طوارئ السبورة التفاعلية أثناء زيارة الموجه» بالمستوى المنخفض (شاشة + فأرة + لوحة مفاتيح).
- مسار القصة: مقدمة، حصة عادية، انقطاع التيار، تهدئة المعلم، فحص الحاسب والكابل، فتح إعدادات السبورة، لمس نقاط المعايرة الأربع بالترتيب، ثم الحل. الأخطاء تُقابَل بتغذية راجعة سردية (على لسان المعلم أو الراوي) ويُعاد المحاولة حتى الإتقان.
- واجهة عربية RTL بمنظور الشخص الأول.
- **صوت مكاني حقيقي** (Web Audio API / HRTF) للسماعات: طنين المحول خارج الفصل، لوحة الكهرباء، مراوح الأجهزة، المكيف، همهمة الطلاب، وصوت انقطاع التيار وعودته. كل الأصوات مولَّدة برمجيًا (بلا ملفات ذات حقوق).
- **سجل التفاعل** (المعيار 51): رقم الجلسة عند البدء، وتسجيل كل تفاعل بالزمن والخطوة والخطأ والمحاولة، وتنزيل CSV/JSON في النهاية (ويُحفظ نسخة احتياطية في المتصفح).

### مستويات الانغماس (خارطة الطريق)
| المستوى | الوسيط | الأداة | الحالة |
|---|---|---|---|
| منخفض | شاشة عادية | فأرة + لوحة مفاتيح | **جاهز في v1** (`?level=desktop`) |
| متوسط | شاشة لمس ملء الشاشة | اللمس المباشر | قيد التطوير (`?level=touch`) |
| مرتفع | نظارة VR (Meta Quest عبر WebXR) | اليدان الافتراضيتان + عصا التنقل | قيد التطوير (`?level=vr`) |

منطق القصة (`js/story.js`) لا يعرف نوع الإدخال: يستقبل فقط حدث `activate` من `js/input.js`. إضافة اللمس أو WebXR تعني كتابة adapter جديد في `input.js` دون تعديل القصة.

### التشغيل
- محليًا: افتح مجلد المشروع بخادم ثابت، مثل `python3 -m http.server` ثم `http://localhost:8000`. (لا حاجة لأي تثبيت أو build.)
- النشر: GitHub Pages من الفرع `main` والمجلد الجذر. الرابط: `https://<username>.github.io/<repo>/`.
- التحكم: W A S D للحركة، اسحب بالفأرة لإدارة الرأس، انقر (أو اضغط E) للتفاعل. استخدم سماعات.

### إعدادات البحث
في `js/config.js`: زمن الحصة قبل الحادثة، ترتيب نقاط المعايرة، وعدد مرات الإتقان. ترتيب نقاط المعايرة غير منصوص عليه في وثائق الرسالة، والمبدئي هو: العلوية اليسرى، العلوية اليمنى، السفلية اليمنى، السفلية اليسرى. يجب مطابقته مع السبورة الفعلية.

### مؤقت في v1 (Placeholders)
- نماذج الفصل والشخصيات بسيطة مبنية بالأشكال الأساسية، وستُستبدل بنماذج GLB واقعية (CC0/CC-BY) مع شخصيات متحركة.
- أصوات الحوار بدون تسجيل صوتي (نص مكتوب فقط). يوجد خطاف `AudioEngine.playVoice(url, position)` لوضع تسجيلات حقيقية موضعية.
- لا تصادم مع الأثاث (حدود الغرفة فقط).

---

**English**

A browser-based 3D learning environment (A-Frame / WebXR, static site, no build step) for a master's thesis on the effect of three immersion levels in immersive digital-story learning environments.

**v1 contains:** Story 2 ("interactive whiteboard emergency during the supervisor's visit") at the low-immersion level (screen + mouse/keyboard); Arabic RTL first-person overlay; real positional audio (Web Audio HRTF, headphones assumed, all sounds synthesized); narrative feedback on wrong order with retry until mastery; full interaction logging with CSV/JSON export (criterion 51).

**Roadmap:** `?level=touch` (full-screen touch) and `?level=vr` (WebXR hands/controllers on Meta Quest). Story logic is input-agnostic: add an adapter in `js/input.js`.

**Run:** serve the folder statically (`python3 -m http.server`). **Deploy:** GitHub Pages, branch `main`, root.

**Placeholders:** primitive-shape classroom and characters (to be replaced with GLB assets), no recorded voice yet (`AudioEngine.playVoice` hook ready), room-bounds only (no furniture collision). The calibration point order is an assumption (see `js/config.js`).
