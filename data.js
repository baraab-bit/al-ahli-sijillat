/* ============================================================================
 * data.js — سجل البنود لكل برنامج (مشروع قياس أثر برامج خدمة المجتمع — البنك الأهلي)
 * ----------------------------------------------------------------------------
 * Single source of truth for the form. The page renders entirely from this
 * object — no content is hard-coded in markup. Tab 7 (بناء القدرات) is on v4
 * and will be patched later by editing THIS file only.
 *
 * Schema:
 *   REGISTER = {
 *     meta:    { client, project, preparedBy, date, statusNote },
 *     stages:  ["مدخلات","أنشطة","مخرجات","نتائج","أثر"]  // results-chain order
 *     programs: [
 *       {
 *         id, name, years:[...], note, unreviewed:bool,
 *         items: [
 *           {
 *             id,                // stable key for localStorage / export
 *             stage,             // one of stages
 *             label,             // البند / المؤشر (faithful to register)
 *             shape,             // "matrix" | "document" | "pii"
 *             years,             // override program years for this item (optional)
 *             source,            // المصدر / الجهة المالكة
 *             status,            // availability status (register)
 *             unreviewed,        // ⚠ غير مُراجَع marker (optional, item-level)
 *             notes              // register notes (shown as hint)
 *           }
 *         ]
 *       }
 *     ]
 *   }
 *
 * shape semantics:
 *   matrix   → years × question grid (numeric/text cell per year)
 *   document → checklist row: status select + notes (NO file upload — emailed separately)
 *   pii      → instruction card: NO personal data entered; only "ready to send" status + count
 * ========================================================================== */

const AVAILABILITY = {
  available:  { key: "available",  label: "متوفر الآن ✓",        tone: "green"  },
  fetch:      { key: "fetch",      label: "يحتاج جلب",            tone: "amber"  },
  permission: { key: "permission", label: "يحتاج إذن / إحالة",    tone: "red"    },
  unreviewed: { key: "unreviewed", label: "⚠ غير مُراجَع",        tone: "violet" }
};

// Status options offered to the client per data shape ------------------------
const DOC_STATUS_OPTIONS = [
  { value: "",            label: "— اختر الحالة —" },
  { value: "will_attach", label: "سأرفقها" },
  { value: "attached",    label: "مرفقة وسأرسلها" },
  { value: "unavailable", label: "غير متوفرة" }
];

const PII_STATUS_OPTIONS = [
  { value: "",           label: "— اختر الحالة —" },
  { value: "ready",      label: "جاهزة للإرسال (بشكل منفصل وآمن)" },
  { value: "partial",    label: "متوفرة جزئياً" },
  { value: "needs_perm", label: "تحتاج إذن / إحالة من جهة مالكة" },
  { value: "unavailable", label: "غير متوفرة" }
];

const DEFAULT_YEARS = [2022, 2023, 2024, 2025];

const REGISTER = {
  meta: {
    client: "البنك الأهلي السعودي (SNB) — إدارة المسؤولية المجتمعية · برامج «أهالينا»",
    project: "قياس أثر برامج خدمة المجتمع — سجل جمع البيانات (السجلات)",
    preparedBy: "قرارات (Qararat AI) — رئاسة قياس الأثر",
    date: "2026-06-24",
    statusNote: "نموذج جمع بيانات — يُملأ على مراحل، يُحفظ تلقائياً، ويُصدَّر إلى Excel للإرسال."
  },

  stages: ["مدخلات", "أنشطة", "مخرجات", "نتائج", "أثر"],

  programs: [
    /* ===================================================================== *
     * البرنامج 1 — الإنتاج الحرفي
     * ===================================================================== */
    {
      id: "p1_handicraft",
      name: "الإنتاج الحرفي",
      years: [2022, 2023, 2024, 2025],
      note: "السنوات مؤكَّدة 2022–2025. السجلات لدى الجمعيات (الفيصلية + حرفة) وهيئة التراث؛ البدجت والاختيار من البنك.",
      unreviewed: false,
      items: [
        { id: "p1_i01", stage: "مدخلات", shape: "matrix", label: "عدد المدربين المعتمدين (لكل سنة)", source: "الجمعية / هيئة التراث", status: "fetch", notes: "المدربات اللاتي يقدّمن التدريب." },
        { id: "p1_i02", stage: "مدخلات", shape: "document", label: "حالة الشراكة مع وزارة الثقافة / هيئة التراث", source: "البنك / هيئة التراث", status: "fetch", notes: "مذكرة التفاهم بين البنك وهيئة التراث؛ هيئة التراث = إشراف، البدجت من البنك." },
        { id: "p1_i03", stage: "مدخلات", shape: "matrix", label: "عدد المسارات الحرفية المتاحة", source: "الجمعية", status: "fetch", notes: "" },
        { id: "p1_i04", stage: "مدخلات", shape: "matrix", label: "نسبة جاهزية الحقيبة التدريبية (%)", source: "الجمعية — تُقيَّم بروبريك من قرارات", status: "fetch", notes: "مؤشر مُقدَّر لا مُبلَّغ ذاتياً؛ تُرسَل نماذج الحقائب ليقيّمها فريق قرارات." },
        { id: "p1_i05", stage: "مدخلات", shape: "document", label: "نماذج الحقائب التدريبية المعتمدة", source: "الجمعية", status: "fetch", notes: "المدخل الفعلي لتقييم الجاهزية أعلاه." },
        { id: "p1_i06", stage: "مدخلات", shape: "matrix", label: "عدد الجهات المنفذة الفعّالة (لكل سنة)", source: "الجمعية", status: "available", notes: "جمعيتان: الفيصلية + حرفة؛ يختلف العدد سنوياً." },
        { id: "p1_i07", stage: "مدخلات", shape: "matrix", label: "التغطية الجغرافية للجهات المنفذة (عدد المدن لكل سنة)", source: "الجمعية", status: "available", notes: "كل سنة كم مدينة غطّاها البرنامج." },

        { id: "p1_i08", stage: "أنشطة", shape: "matrix", label: "عدد المبادرات التسويقية", source: "الجمعية", status: "available", notes: "أُعيدت صياغته من «عدد المنافذ / متاجر سلة». معارض / طلبيات / عروض موظفين سنوياً." },
        { id: "p1_i09", stage: "أنشطة", shape: "matrix", label: "عدد المتاجر الإلكترونية المفتوحة (سلة)", source: "الجمعية / سلة", status: "available", notes: "مبادرة سنة واحدة فقط — تُسجَّل في سنتها فقط لا عبر كل السنوات." },
        { id: "p1_i10", stage: "أنشطة", shape: "matrix", label: "عدد الدورات المنفذة سنوياً", source: "الجمعية", status: "available", notes: "" },
        { id: "p1_i11", stage: "أنشطة", shape: "matrix", label: "عدد ساعات التدريب الإجمالية", source: "الجمعية", status: "available", notes: "" },
        { id: "p1_i12", stage: "أنشطة", shape: "matrix", label: "نسبة إكمال الدورة (Retention) (%)", source: "الجمعية", status: "available", notes: "" },
        { id: "p1_i13", stage: "أنشطة", shape: "matrix", label: "رضا المستفيدات عن التدريب (النتيجة سنوياً)", source: "الجمعية", status: "available", notes: "استبيان بعد كل دورة موجود؛ تُستخرَج النتيجة سنوياً (الفورم يُرفق كوثيقة أدناه)." },
        { id: "p1_i14", stage: "أنشطة", shape: "document", label: "نموذج استبيان الرضا (الكوسينير) بعد الدورة", source: "الجمعية", status: "available", notes: "يُرفق الفورم كاملاً." },
        { id: "p1_i15", stage: "أنشطة", shape: "matrix", label: "احتمالية التوصية (NPS)", source: "الجمعية", status: "fetch", notes: "يُتحقَّق إن كان السؤال داخل الفورم؛ وإلا يُلتقَط لاحقاً." },
        { id: "p1_i16", stage: "أنشطة", shape: "matrix", label: "عدد طلبات الالتحاق المستلمة", source: "الجمعية", status: "fetch", notes: "مثال: 100 قدّموا، 50 قُبلوا." },
        { id: "p1_i17", stage: "أنشطة", shape: "matrix", label: "معدل القبول (%)", source: "الجمعية", status: "fetch", notes: "بالتبعية من الطلبات / المقبولين." },
        { id: "p1_i18", stage: "أنشطة", shape: "matrix", label: "نسبة المستفيدات من الفئات الأولى بالرعاية (%)", source: "الجمعية", status: "available", notes: "مسجَّلات مستفيدات في الجمعية (دخل محدود + دراسة حالة)." },

        { id: "p1_i19", stage: "مخرجات", shape: "matrix", label: "نسبة التخرج (%)", source: "الجمعية", status: "available", notes: "= نسبة إكمال الدورة (أكّد العميل أنهما نفسهما)." },
        { id: "p1_i20", stage: "مخرجات", shape: "matrix", label: "عدد المتخرجات من الدورات الحرفية (تراكمي)", source: "الجمعية", status: "available", notes: "تراكمي." },

        { id: "p1_i21", stage: "نتائج", shape: "matrix", label: "نسبة زيادة المعرفة الحرفية (%)", source: "الجمعية (استبيان)", status: "available", notes: "self-reported." },
        { id: "p1_i22", stage: "نتائج", shape: "matrix", label: "نسبة اكتساب المهارات الحرفية (%)", source: "الجمعية (استبيان)", status: "available", notes: "self-reported." },
        { id: "p1_i23", stage: "نتائج", shape: "matrix", label: "نسبة المستفيدات اللاتي يشعرن بزيادة الثقة (%)", source: "الجمعية (استبيان)", status: "available", notes: "self-reported." },
        { id: "p1_i24", stage: "نتائج", shape: "matrix", label: "نسبة زيادة الحافزية للعمل المستقل (%)", source: "الجمعية (استبيان)", status: "available", notes: "self-reported." },
        { id: "p1_i25", stage: "نتائج", shape: "matrix", label: "إنتاج منتج قابل للبيع (عدد/نسبة)", source: "الجمعية", status: "available", notes: "سجل." },

        { id: "p1_i26", stage: "أثر", shape: "matrix", label: "التغير في الدخل الشهري بعد التدريب", source: "المتدربات (استبيان)", status: "permission", notes: "يتطلّب كونتاكت المتدربات (القائمة أدناه)." },
        { id: "p1_i27", stage: "أثر", shape: "matrix", label: "متوسط المبيعات الشهرية عبر (سلة)", source: "الجمعية / سلة", status: "available", notes: "مرتبط بمبادرة سلة (سنة واحدة)." },
        { id: "p1_i28", stage: "أثر", shape: "matrix", label: "عدد الحرف التراثية المُدرَّسة + نية الاستمرار + التحسّن المُدرَك في جودة الحياة", source: "الجمعية / المتدربات (استبيان)", status: "available", notes: "الإدراكية self-reported عبر كونتاكت المتدربات." },

        { id: "p1_pii1", stage: "أثر", shape: "pii", label: "قائمة المتدربات (اسم + جوال + بريد + مدينة + جنس)", source: "الجمعية", status: "fetch", notes: "قائمة لكل سنة 2022–2025؛ أساس استبيانات الأثر/النتائج." },
        { id: "p1_pii2", stage: "أثر", shape: "pii", label: "قائمة المدربات (اسم + بيانات)", source: "الجمعية / هيئة التراث", status: "fetch", notes: "المدربات المعتمدات لكل سنة." }
      ]
    },

    /* ===================================================================== *
     * البرنامج 2 — الإسكان
     * ===================================================================== */
    {
      id: "p2_housing",
      name: "الإسكان",
      years: [2022, 2023, 2024, 2025],
      note: "السنوات مفترَضة 2022–2025 (يُؤكَّد مع المالك). الوزارة تملك معظم البيانات؛ كثير من البنود يحتاج إحالة لوزارة الإسكان. التسليم سنوي في أكتوبر.",
      unreviewed: false,
      items: [
        { id: "p2_i01", stage: "مدخلات", shape: "document", label: "جاهزية آلية الاستحقاق ومعايير الأهلية", source: "البنك / الوزارة", status: "available", notes: "الشروط موجودة من بداية البرنامج." },
        { id: "p2_i02", stage: "مدخلات", shape: "matrix", label: "الميزانية السنوية المخصصة", source: "البنك", status: "available", notes: "سنوية ضمن اتفاقية ثلاث سنوات." },
        { id: "p2_i03", stage: "مدخلات", shape: "document", label: "حالة اتفاقية الشراكة مع وزارة الإسكان", source: "البنك / الوزارة", status: "available", notes: "شراكة من أول البرنامج بلا تغيّر." },
        { id: "p2_i04", stage: "مدخلات", shape: "matrix", label: "عدد المستفيدين المحالين من وزارة الإسكان", source: "الوزارة → البنك", status: "available", notes: "كلهم محالون من الوزارة." },

        { id: "p2_i05", stage: "أنشطة", shape: "matrix", label: "نسبة الفئات الأولى بالرعاية من إجمالي المختارين (%)", source: "الوزارة", status: "available", notes: "100% — كلهم فئات أولى (مؤكَّد)." },
        { id: "p2_i06", stage: "أنشطة", shape: "matrix", label: "عدد الوحدات السكنية المسلَّمة سنوياً", source: "الوزارة → البنك", status: "available", notes: "الوزارة تُعطي قائمة المستلِمين ليعتمدها البنك." },
        { id: "p2_i07", stage: "أنشطة", shape: "matrix", label: "عدد الوحدات السكنية المسلَّمة (تراكمي)", source: "الوزارة → البنك", status: "available", notes: "" },

        { id: "p2_i08", stage: "مخرجات", shape: "matrix", label: "عدد الأسر المستفيدة سنوياً", source: "الوزارة → البنك", status: "available", notes: "متوافق مع عدد الوحدات السكنية." },
        { id: "p2_i09", stage: "مخرجات", shape: "matrix", label: "عدد الأسر المستفيدة (تراكمي)", source: "الوزارة → البنك", status: "available", notes: "" },
        { id: "p2_i10", stage: "مخرجات", shape: "matrix", label: "توزيع المستفيدين حسب الفئة", source: "الوزارة", status: "available", notes: "" },

        { id: "p2_i11", stage: "نتائج", shape: "matrix", label: "مؤشرات الإدراك: انخفاض الضغط المالي · رضا عن جودة الوحدة · زيادة الاستقرار الأسري · الشعور بالاستقرار السكني · التغير في الفرص الاقتصادية · التحسّن المُدرَك في جودة الحياة", source: "المستفيدون (استبيان)", status: "permission", notes: "تتطلّب التواصل المباشر بالمستفيدين؛ الكونتاكت بحوزة الوزارة. أُضيف «عدد أفراد الأسرة»." },
        { id: "p2_i12", stage: "نتائج", shape: "matrix", label: "متوسط الإيجار الشهري قبل البرنامج", source: "المستفيدون (استبيان)", status: "permission", notes: "خط أساس self-reported عبر الاستبيان." },

        { id: "p2_pii1", stage: "نتائج", shape: "pii", label: "قائمة الأسر المستفيدة (اسم + جوال + مدينة + عدد أفراد الأسرة)", source: "الوزارة → (بإذن) البنك", status: "permission", notes: "شرط قياس الأثر كله؛ معلّق على إذن الوزارة." }
      ]
    },

    /* ===================================================================== *
     * البرنامج 3 — المبادرات البيئية
     * ===================================================================== */
    {
      id: "p3_environment",
      name: "المبادرات البيئية",
      years: [2022, 2023, 2024, 2025],
      note: "السنوات مفترَضة 2022–2025 (يُؤكَّد). المساجد لا كونتاكت لها؛ الشركاء = وزارة البيئة. الفوت برنت يبدأ من السنة القادمة.",
      unreviewed: false,
      items: [
        { id: "p3_i01", stage: "مدخلات", shape: "matrix", label: "الميزانية السنوية المخصصة", source: "البنك", status: "available", notes: "" },
        { id: "p3_i02", stage: "مدخلات", shape: "matrix", label: "نسبة صرف الميزانية (%)", source: "البنك", status: "available", notes: "" },
        { id: "p3_i03", stage: "مدخلات", shape: "matrix", label: "تكلفة الشجرة الواحدة", source: "البنك", status: "available", notes: "" },
        { id: "p3_i04", stage: "مدخلات", shape: "matrix", label: "عدد الشراكات الفعّالة", source: "البنك", status: "available", notes: "" },
        { id: "p3_i05", stage: "مدخلات", shape: "matrix", label: "عدد الجهات الحكومية المشاركة", source: "البنك", status: "available", notes: "" },

        { id: "p3_i06", stage: "أنشطة", shape: "matrix", label: "عدد حملات الزراعة المنفذة", source: "البنك", status: "available", notes: "" },
        { id: "p3_i07", stage: "أنشطة", shape: "matrix", label: "عدد أنظمة معالجة المياه الرمادية المركَّبة", source: "البنك / الوزارة", status: "available", notes: "= عدد المساجد (نظام واحد لكل مسجد)." },
        { id: "p3_i08", stage: "أنشطة", shape: "matrix", label: "نسبة الأنظمة العاملة بعد التركيب (%)", source: "البنك / الوزارة", status: "available", notes: "عقد صيانة موجود." },
        { id: "p3_i09", stage: "أنشطة", shape: "matrix", label: "عدد المساجد المستهدفة سنوياً", source: "البنك", status: "available", notes: "" },
        { id: "p3_i10", stage: "أنشطة", shape: "matrix", label: "نسبة إكمال أعمال التشجير في المساجد المستهدفة (%)", source: "البنك", status: "available", notes: "" },

        { id: "p3_i11", stage: "مخرجات", shape: "matrix", label: "عدد المواقع المزروعة (تراكمي) + التوزيع الجغرافي", source: "البنك", status: "available", notes: "التوزيع: مثلاً موقعان جيزان + ينبع." },
        { id: "p3_i12", stage: "مخرجات", shape: "matrix", label: "المساحة الإجمالية المزروعة + المساحة المغطاة في المساجد", source: "البنك", status: "available", notes: "" },
        { id: "p3_i13", stage: "مخرجات", shape: "matrix", label: "عدد الأشجار المزروعة سنوياً + (تراكمي)", source: "البنك", status: "available", notes: "" },

        { id: "p3_i14", stage: "نتائج", shape: "matrix", label: "كمية المياه الرمادية المعالجة سنوياً (تراكمي)", source: "البنك / الوزارة", status: "fetch", notes: "أُعيدت صياغته من «نسبة توفير المياه». الهدف معالجة لا توفير." },
        { id: "p3_i15", stage: "نتائج", shape: "matrix", label: "عدد المساجد ذات الأنظمة العاملة", source: "البنك / الوزارة", status: "available", notes: "" },
        { id: "p3_i16", stage: "نتائج", shape: "document", label: "تقييم الشركاء لأثر البرنامج البيئي", source: "وزارة البيئة (الشريك)", status: "permission", notes: "الشركاء = وزارة البيئة؛ البنك يرسل كونتاكتهم." },
        { id: "p3_i17", stage: "نتائج", shape: "matrix", label: "معدل بقاء الأشجار حالياً في المواقع + في المساجد (%)", source: "وزارة البيئة", status: "permission", notes: "program-supplied عبر الوزارة." },

        { id: "p3_i18", stage: "أثر", shape: "matrix", label: "نسبة المساهمة في هدف 10 مليار شجرة (%)", source: "البنك", status: "available", notes: "" },
        { id: "p3_i19", stage: "أثر", shape: "matrix", label: "الفوت برنت / نسبة الخفض الكربوني (مانجروف وغيره)", years: [2026, 2027, 2028, 2029], source: "البنك / الوزارة", status: "fetch", notes: "يبدأ من السنة القادمة؛ لم يُعتمَد بعد لدى الوزارة." }
      ]
    },

    /* ===================================================================== *
     * البرنامج 4 — التطوع الأهلي
     * ===================================================================== */
    {
      id: "p4_volunteering",
      name: "التطوع",
      years: [2022, 2023, 2024, 2025],
      note: "السنوات مفترَضة 2022–2025 (يُؤكَّد). مساران متوازيان: التطوع العام، والتطوع الاحترافي/البروبونو (الشريك = غدا). تقرير سنوي نهائي لكل مسار يحوي كل الأرقام.",
      unreviewed: false,
      items: [
        { id: "p4_i01", stage: "مدخلات", shape: "matrix", label: "عدد أعضاء فريق إدارة البرنامج", source: "البنك", status: "available", notes: "موظفو البنك + champions لكل مدينة." },
        { id: "p4_i02", stage: "مدخلات", shape: "matrix", label: "عدد الشركاء", source: "البنك", status: "available", notes: "أُعيدت صياغته من «نسبة جاهزية الشريك». شريكان (عام + غدا)." },
        { id: "p4_i03", stage: "مدخلات", shape: "document", label: "حالة إدارة حملات التوعية والتحفيز", source: "البنك / غدا", status: "fetch", notes: "ضمن التقارير السنوية." },

        { id: "p4_i04", stage: "أنشطة", shape: "matrix", label: "عدد الأدوات التوعوية المنشورة", source: "البنك / غدا", status: "fetch", notes: "منشورات سوشيال؛ تحتاج تدقيق («8000 منشور»)." },
        { id: "p4_i05", stage: "أنشطة", shape: "matrix", label: "عدد الفرص التطوعية المصمَّمة", source: "البنك / غدا", status: "available", notes: "من التقرير السنوي." },
        { id: "p4_i06", stage: "أنشطة", shape: "matrix", label: "نسبة الفرص الاحترافية من إجمالي الفرص (%)", source: "غدا", status: "available", notes: "من تقارير المسارين." },
        { id: "p4_i07", stage: "أنشطة", shape: "matrix", label: "نسبة الفرص المنفَّذة من المخطَّط لها (%)", source: "البنك / غدا", status: "available", notes: "" },
        { id: "p4_i08", stage: "أنشطة", shape: "matrix", label: "عدد الفرص المنفَّذة + عدد المتطوعين المسجَّلين لكل فرصة", source: "البنك / غدا", status: "available", notes: "" },

        { id: "p4_i09", stage: "مخرجات", shape: "matrix", label: "عدد ساعات العمل التطوعي سنوياً + متوسط الساعات لكل متطوع + القيمة الاقتصادية", source: "البنك / غدا", status: "available", notes: "في التقرير السنوي النهائي." },
        { id: "p4_i10", stage: "مخرجات", shape: "matrix", label: "عدد المتطوعين المشاركين في التطوع الاحترافي سنوياً", source: "غدا", status: "available", notes: "" },
        { id: "p4_i11", stage: "مخرجات", shape: "matrix", label: "عدد الجهات المستفيدة سنوياً + تنوّع قطاعات الجهات", source: "البنك / غدا", status: "available", notes: "" },

        { id: "p4_i12", stage: "نتائج", shape: "matrix", label: "زيادة الشعور بمتعة العطاء · الراغبون في التطوع مجدداً · زيادة الارتباط الوظيفي · الفخر بالانتماء للبنك · اكتساب مهارة جديدة", source: "المتطوعون (استبيان)", status: "permission", notes: "self-reported عبر كونتاكت المتطوعين." },

        { id: "p4_i13", stage: "أثر", shape: "matrix", label: "رفع معدلات ساعات التطوع في المملكة (مساهمة رؤية 2030)", source: "البنك", status: "available", notes: "سجل." },

        { id: "p4_doc1", stage: "مخرجات", shape: "document", label: "التقرير السنوي للتطوع العام (لكل سنة)", source: "البنك", status: "fetch", notes: "يحوي المتطوعين/الساعات/المقابل المالي/الفرص." },
        { id: "p4_doc2", stage: "مخرجات", shape: "document", label: "التقرير السنوي للتطوع الاحترافي — غدا (لكل سنة)", source: "غدا", status: "fetch", notes: "المسار المتوازي؛ تقرير نهائي لكل سنة." },

        { id: "p4_pii1", stage: "نتائج", shape: "pii", label: "قائمة متطوعي التطوع العام (اسم + جوال + بريد + مدينة + جنس + الحملات)", source: "البنك", status: "fetch", notes: "قائمة لكل سنة 2022–2025." },
        { id: "p4_pii2", stage: "نتائج", shape: "pii", label: "قائمة متطوعي التطوع الاحترافي — غدا (اسم + جوال + بريد + مدينة + جنس)", source: "غدا", status: "fetch", notes: "قائمة لكل سنة." }
      ]
    },

    /* ===================================================================== *
     * البرنامج 5 — التمويل المصغر  ⚠ غير مُراجَع
     * ===================================================================== */
    {
      id: "p5_microfinance",
      name: "التمويل المصغر",
      years: [2022, 2023, 2024, 2025],
      note: "⚠ غير مُراجَع في الاجتماع — بُني حرفياً من جدول ن3. تُؤكَّد الصياغة والتوافر والسنوات مع العميل. السنوات مفترَضة 2022–2025.",
      unreviewed: true,
      items: [
        { id: "p5_i01", stage: "مدخلات", shape: "matrix", label: "عدد الموظفين في الفروع", source: "الجمعية / البنك", status: "unreviewed", unreviewed: true, notes: "ن3 سجلات." },
        { id: "p5_i02", stage: "مدخلات", shape: "matrix", label: "نسبة الموظفات ذوات الدخل الشهري المستقل (%)", source: "الجمعية / البنك", status: "unreviewed", unreviewed: true, notes: "ن3 سجلات." },
        { id: "p5_i03", stage: "مدخلات", shape: "matrix", label: "عدد الفروع المخصصة للبرنامج", source: "البنك", status: "unreviewed", unreviewed: true, notes: "" },
        { id: "p5_i04", stage: "مدخلات", shape: "matrix", label: "الميزانية المخصصة", source: "البنك", status: "unreviewed", unreviewed: true, notes: "" },

        { id: "p5_i05", stage: "أنشطة", shape: "matrix", label: "عدد القروض التي تم تقديمها", source: "الجمعية / البنك", status: "unreviewed", unreviewed: true, notes: "" },
        { id: "p5_i06", stage: "أنشطة", shape: "matrix", label: "معدل قبول المتقدمين (%)", source: "الجمعية / البنك", status: "unreviewed", unreviewed: true, notes: "" },
        { id: "p5_i07", stage: "أنشطة", shape: "matrix", label: "عدد طلبات التقديم على القروض", source: "الجمعية / البنك", status: "unreviewed", unreviewed: true, notes: "" },
        { id: "p5_i08", stage: "أنشطة", shape: "matrix", label: "معدل تحصيل القروض (%)", source: "الجمعية / البنك", status: "unreviewed", unreviewed: true, notes: "" },

        { id: "p5_i09", stage: "مخرجات", shape: "matrix", label: "قيمة القروض المقدمة سنوياً", source: "الجمعية / البنك", status: "unreviewed", unreviewed: true, notes: "" },
        { id: "p5_i10", stage: "مخرجات", shape: "matrix", label: "عدد المستفيدات الحاصلات على قروض", source: "الجمعية / البنك", status: "unreviewed", unreviewed: true, notes: "" },

        { id: "p5_i11", stage: "نتائج", shape: "matrix", label: "قيمة الزيادة في الدخل الشهري بسبب القرض", source: "المستفيدات (استبيان)", status: "unreviewed", unreviewed: true, notes: "self-reported؛ ن3 استبيان." },
        { id: "p5_i12", stage: "نتائج", shape: "matrix", label: "نسبة المستفيدات اللاتي أطلقن مشاريع تجارية (%)", source: "المستفيدات (استبيان)", status: "unreviewed", unreviewed: true, notes: "ن3 استبيان." },
        { id: "p5_i13", stage: "نتائج", shape: "matrix", label: "عدد المشاريع التجارية التي تم إطلاقها", source: "المستفيدات (استبيان)", status: "unreviewed", unreviewed: true, notes: "ن3 استبيان." },
        { id: "p5_i14", stage: "نتائج", shape: "matrix", label: "عدد الشهور التي يحقق المشروع أرباح + عدد الشهور التي يحقق مبيعات", source: "المستفيدات (استبيان)", status: "unreviewed", unreviewed: true, notes: "ن3 استبيان." },

        { id: "p5_i15", stage: "أثر", shape: "matrix", label: "نسبة تغطية الدخل الشهري للاحتياجات الأساسية للمستفيد (%)", source: "المستفيدات (استبيان)", status: "unreviewed", unreviewed: true, notes: "ن3 استبيان." },
        { id: "p5_i16", stage: "أثر", shape: "matrix", label: "متوسط نسبة نمو المبيعات السنوية (%)", source: "المستفيدات (استبيان)", status: "unreviewed", unreviewed: true, notes: "ن3 استبيان." },
        { id: "p5_i17", stage: "أثر", shape: "matrix", label: "نسبة رضا المستفيد عن جودة حياته بعد القرض (%)", source: "المستفيدات (استبيان)", status: "unreviewed", unreviewed: true, notes: "ن3 استبيان." }
      ]
    },

    /* ===================================================================== *
     * البرنامج 6 — ريادة الأعمال (الاحتضان)  ⚠ غير مُراجَع
     * ===================================================================== */
    {
      id: "p6_entrepreneurship",
      name: "ريادة الأعمال",
      years: [2022, 2023, 2024, 2025],
      note: "⚠ غير مُراجَع في الاجتماع — بُني حرفياً من جدول ن3. الشريك المذكور: أروقة (احتضان). تُؤكَّد الصياغة والتوافر والسنوات. السنوات مفترَضة 2022–2025.",
      unreviewed: true,
      items: [
        { id: "p6_i01", stage: "مدخلات", shape: "matrix", label: "الميزانية السنوية المخصصة", source: "البنك", status: "unreviewed", unreviewed: true, notes: "" },
        { id: "p6_i02", stage: "مدخلات", shape: "matrix", label: "نسبة صرف الميزانية (%)", source: "البنك", status: "unreviewed", unreviewed: true, notes: "" },
        { id: "p6_i03", stage: "مدخلات", shape: "matrix", label: "عدد اتفاقيات الشراكة الفعّالة", source: "البنك / أروقة", status: "unreviewed", unreviewed: true, notes: "" },
        { id: "p6_i04", stage: "مدخلات", shape: "matrix", label: "جاهزية نظام التشغيل (الحاضنة الخاصة بالبنك)", source: "البنك", status: "unreviewed", unreviewed: true, notes: "" },

        { id: "p6_i05", stage: "أنشطة", shape: "matrix", label: "رضا المستفيدين عن خدمات الاحتضان (%)", source: "المستفيدون (استبيان)", status: "unreviewed", unreviewed: true, notes: "ن3 استبيان." },
        { id: "p6_i06", stage: "أنشطة", shape: "matrix", label: "إجمالي التمويل المقدم للشركات الناشئة", source: "البنك / أروقة", status: "unreviewed", unreviewed: true, notes: "" },
        { id: "p6_i07", stage: "أنشطة", shape: "matrix", label: "عدد ساعات التدريب المقدمة + عدد جلسات الإرشاد الفردية + احتمالية التوصية", source: "البنك / أروقة", status: "unreviewed", unreviewed: true, notes: "" },
        { id: "p6_i08", stage: "أنشطة", shape: "matrix", label: "عدد طلبات الالتحاق المستلمة + معدل القبول", source: "البنك / أروقة", status: "unreviewed", unreviewed: true, notes: "" },
        { id: "p6_i09", stage: "أنشطة", shape: "matrix", label: "عدد فعاليات الربط مع المستثمرين + عدد المستثمرين المشاركين", source: "البنك / أروقة", status: "unreviewed", unreviewed: true, notes: "" },

        { id: "p6_i10", stage: "مخرجات", shape: "matrix", label: "عدد الاتفاقيات الاستثمارية الموقعة + إجمالي قيمتها", source: "البنك / أروقة", status: "unreviewed", unreviewed: true, notes: "" },
        { id: "p6_i11", stage: "مخرجات", shape: "matrix", label: "عدد رواد الأعمال المحتضنين (تراكمي)", source: "البنك / أروقة", status: "unreviewed", unreviewed: true, notes: "" },
        { id: "p6_i12", stage: "مخرجات", shape: "matrix", label: "عدد الشركات المحتضنة سنوياً + (تراكمي)", source: "البنك / أروقة", status: "unreviewed", unreviewed: true, notes: "" },

        { id: "p6_i13", stage: "نتائج", shape: "matrix", label: "معدل البقاء بعد سنتين + بعد خمس سنوات (%)", source: "البنك / أروقة", status: "unreviewed", unreviewed: true, notes: "ن3 سجلات." },
        { id: "p6_i14", stage: "نتائج", shape: "matrix", label: "ثقة المؤسس في استمرارية المشروع", source: "المؤسسون (استبيان)", status: "unreviewed", unreviewed: true, notes: "ن3 استبيان." },
        { id: "p6_i15", stage: "نتائج", shape: "matrix", label: "التحسّن المُدرَك في جودة الحياة للمؤسس", source: "البنك / أروقة", status: "unreviewed", unreviewed: true, notes: "ن3 سجلات." },
        { id: "p6_i16", stage: "نتائج", shape: "matrix", label: "متوسط نسبة نمو الإيرادات + نسبة الشركات المحققة لإيرادات + درجة النضج التنظيمي", source: "المؤسسون (استبيان)", status: "unreviewed", unreviewed: true, notes: "ن3 استبيان." },
        { id: "p6_i17", stage: "نتائج", shape: "matrix", label: "إجمالي الوظائف المولَّدة + نسبة الوظائف للسعوديين", source: "المؤسسون (استبيان)", status: "unreviewed", unreviewed: true, notes: "ن3 استبيان." },

        { id: "p6_i18", stage: "أثر", shape: "matrix", label: "إجمالي إيرادات الشركات المتخرجة", source: "البنك / أروقة", status: "unreviewed", unreviewed: true, notes: "" }
      ]
    },

    /* ===================================================================== *
     * البرنامج 7 — بناء قدرات الجمعيات الخيرية (v4)
     * ===================================================================== */
    {
      id: "p7_capacity",
      name: "بناء قدرات الجمعيات الخيرية",
      years: [2026],
      note: "المصدر: ملفات v4 (خارج ن3). المنفّذ: شركة ركين (منصة RCAT). الفوج: 55 جمعية، مكة، يوليو–ديسمبر 2026 (تمكين 40 + تعظيم أثر 15). هذا التبويب على v4 وقد يُحدَّث لاحقاً بقرار المالك.",
      unreviewed: false,
      items: [
        { id: "p7_i01", stage: "مدخلات", shape: "matrix", label: "الميزانية السنوية المخصصة", source: "البنك", status: "available", notes: "1,414,686 ريال (بدون ضريبة)." },
        { id: "p7_i02", stage: "مدخلات", shape: "matrix", label: "نسبة صرف الميزانية (%)", source: "البنك / ركين", status: "available", notes: "" },
        { id: "p7_i03", stage: "مدخلات", shape: "matrix", label: "عدد مستشاري ركين المشاركين", source: "ركين", status: "available", notes: "" },
        { id: "p7_i04", stage: "مدخلات", shape: "matrix", label: "جاهزية منصة التقييم RCAT وأدوات التأهيل", source: "ركين", status: "available", notes: "" },
        { id: "p7_i05", stage: "مدخلات", shape: "matrix", label: "عدد الشراكات الفعّالة (المركز الوطني والوحدات الإشرافية)", source: "البنك / ركين", status: "available", notes: "" },

        { id: "p7_i06", stage: "أنشطة", shape: "matrix", label: "عدد الجمعيات التي خضعت لتقييم الجاهزية", source: "ركين", status: "available", notes: "" },
        { id: "p7_i07", stage: "أنشطة", shape: "matrix", label: "عدد ورش العمل الحضورية المنفّذة", source: "ركين", status: "available", notes: "6 ورش." },
        { id: "p7_i08", stage: "أنشطة", shape: "matrix", label: "عدد منسوبي الجمعيات المشاركين في الورش", source: "ركين", status: "available", notes: "" },
        { id: "p7_i09", stage: "أنشطة", shape: "matrix", label: "رضا المشاركين عن ورش العمل (%)", source: "ركين (استبيان)", status: "available", notes: "self-reported." },
        { id: "p7_i10", stage: "أنشطة", shape: "matrix", label: "عدد اللقاءات المعرفية المنفّذة", source: "ركين", status: "available", notes: "3 لقاءات." },
        { id: "p7_i11", stage: "أنشطة", shape: "matrix", label: "عدد الزيارات الميدانية والجلسات الاستشارية المنفّذة", source: "ركين", status: "available", notes: "3 جلسات/جمعية، 20 ساعة لمسار التعظيم." },

        { id: "p7_i12", stage: "مخرجات", shape: "matrix", label: "عدد الجمعيات المؤهَّلة في كل مسار (تمكين/تعظيم)", source: "ركين", status: "available", notes: "تمكين 40 + تعظيم 15." },
        { id: "p7_i13", stage: "مخرجات", shape: "matrix", label: "عدد تقارير تقييم الجاهزية الصادرة", source: "ركين", status: "available", notes: "" },
        { id: "p7_i14", stage: "مخرجات", shape: "matrix", label: "عدد خطط تفعيل المنافسات الحكومية المُعدّة", source: "ركين", status: "available", notes: "" },

        { id: "p7_i15", stage: "نتائج", shape: "matrix", label: "درجة جاهزية الإسناد (RCAT دخول/خروج)", source: "ركين", status: "available", notes: "سجل (لا استبيان) — ناتج RCAT موثَّق." },
        { id: "p7_i16", stage: "نتائج", shape: "matrix", label: "التقييم الذاتي لتحسّن الجاهزية + القدرة المُدرَكة على إعداد العروض + فهم معايير المنافسات", source: "منسوبو الجمعيات (استبيان)", status: "available", notes: "self-reported." },

        { id: "p7_i17", stage: "أثر", shape: "matrix", label: "عدد الجمعيات التي تقدّمت على فرص إسناد حكومية", source: "ركين", status: "fetch", notes: "يُؤكَّد مع المالك أن ركين تتعقّب التقدّم كسجل." },
        { id: "p7_i18", stage: "أثر", shape: "matrix", label: "عدد الجمعيات التي فازت بعقود إسناد حكومية", source: "ركين", status: "fetch", notes: "مقياس النجاح الجوهري؛ متابعة أثر طويل المدى." }
      ]
    }
  ]
};

// Expose globals for app.js and the xlsx export ------------------------------
if (typeof window !== "undefined") {
  window.REGISTER = REGISTER;
  window.AVAILABILITY = AVAILABILITY;
  window.DOC_STATUS_OPTIONS = DOC_STATUS_OPTIONS;
  window.PII_STATUS_OPTIONS = PII_STATUS_OPTIONS;
  window.DEFAULT_YEARS = DEFAULT_YEARS;
}
