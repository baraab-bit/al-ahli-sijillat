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
 *             shape,             // "matrix" | "document" | "select" | "pii"
 *             years,             // override program years for this item (optional)
 *             source,            // المصدر / الجهة المالكة
 *             status,            // availability status (register)
 *             unreviewed,        // silent internal flag (optional, item-level) — renders nothing
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
 *   select   → partnership/agreement status dropdown + notes (doc emailed separately)
 *   pii      → instruction card: NO personal data entered; only "ready to send" status + count
 * ========================================================================== */

const AVAILABILITY = {
  available:  { key: "available",  label: "متوفر الآن ✓",        tone: "green"  },
  fetch:      { key: "fetch",      label: "يحتاج جلب",            tone: "amber"  },
  permission: { key: "permission", label: "يحتاج إذن / إحالة",    tone: "red"    }
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

// Partnership/agreement status — used by `select`-shape status items ----------
const PARTNERSHIP_STATUS_OPTIONS = [
  { value: "",         label: "— اختر الحالة —" },
  { value: "active",   label: "نشطة" },
  { value: "inactive", label: "غير نشطة" },
  { value: "expired",  label: "منتهية" },
  { value: "renewing", label: "قيد التجديد" }
];

const DEFAULT_YEARS = [2022, 2023, 2024, 2025];

const REGISTER = {
  meta: {
    client: "البنك الأهلي السعودي (SNB) — إدارة المسؤولية المجتمعية · برامج «أهالينا»",
    project: "قياس أثر برامج خدمة المجتمع — سجل جمع البيانات (السجلات)",
    preparedBy: "قرارات (Qararat AI)",
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
      note: "السنوات مؤكَّدة 2022–2025. السجلات لدى الجمعيات (الفيصلية + حرفة) وهيئة التراث؛ الميزانية والاختيار من البنك.",
      unreviewed: false,
      items: [
        { id: "p1_i01", stage: "مدخلات", shape: "matrix", label: "عدد المدربين المعتمدين (لكل سنة)", source: "الجمعية / هيئة التراث", status: "fetch", notes: "المدربات اللاتي يقدّمن التدريب." },
        { id: "p1_i02", stage: "مدخلات", shape: "select", label: "حالة الشراكة مع وزارة الثقافة / هيئة التراث", source: "البنك / هيئة التراث", status: "fetch", notes: "حالة مذكرة التفاهم بين البنك وهيئة التراث؛ هيئة التراث = إشراف، الميزانية من البنك. المذكرة تُرسَل بالبريد بشكل منفصل." },
        { id: "p1_i03", stage: "مدخلات", shape: "matrix", label: "عدد المسارات الحرفية المتاحة", source: "الجمعية", status: "fetch", notes: "" },
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
        { id: "p1_i16", stage: "أنشطة", shape: "matrix", label: "عدد طلبات الالتحاق المستلمة", source: "الجمعية", status: "fetch", notes: "مثال: 100 قدّموا، 50 قُبلوا." },
        { id: "p1_i29", stage: "أنشطة", shape: "matrix", label: "عدد المقبولات (لكل سنة)", source: "الجمعية", status: "fetch", notes: "العدد الخام للمقبولات؛ يحسب فريق قرارات معدل القبول من الطلبات والمقبولات." },
        { id: "p1_i30", stage: "أنشطة", shape: "matrix", label: "عدد المستفيدات من الفئات الأولى بالرعاية (لكل سنة)", source: "الجمعية", status: "available", notes: "العدد الخام؛ مسجَّلات مستفيدات في الجمعية (دخل محدود + دراسة حالة). الإجمالي محسوب من عدد المتدربات." },

        { id: "p1_i31", stage: "مخرجات", shape: "matrix", label: "عدد المتخرجات (لكل سنة)", source: "الجمعية", status: "available", notes: "العدد الخام لكل سنة (لا تراكمي)؛ يحسب فريق قرارات التراكمي والنسب." },

        { id: "p1_i25", stage: "نتائج", shape: "matrix", label: "عدد المستفيدات اللاتي أنتجن منتجاً قابلاً للبيع (لكل سنة)", source: "الجمعية", status: "available", notes: "سجل — العدد الخام (لا النسبة)." },

        { id: "p1_i27", stage: "أثر", shape: "matrix", label: "متوسط المبيعات الشهرية عبر (سلة)", source: "الجمعية / سلة", status: "available", notes: "مرتبط بمبادرة سلة (سنة واحدة)." },
        { id: "p1_i28", stage: "أثر", shape: "matrix", label: "عدد الحرف التراثية المُدرَّسة (لكل سنة)", source: "الجمعية", status: "available", notes: "سجل — عدد الحرف التراثية التي دُرِّست." },

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
        { id: "p2_i03", stage: "مدخلات", shape: "select", label: "حالة اتفاقية الشراكة مع وزارة الإسكان", source: "البنك / الوزارة", status: "available", notes: "حالة الاتفاقية؛ شراكة من أول البرنامج. المستند يُرسَل بالبريد بشكل منفصل." },
        { id: "p2_i04", stage: "مدخلات", shape: "matrix", label: "عدد المستفيدين المحالين من وزارة الإسكان", source: "الوزارة → البنك", status: "available", notes: "كلهم محالون من الوزارة." },

        { id: "p2_i06", stage: "أنشطة", shape: "matrix", label: "عدد الوحدات السكنية المسلَّمة سنوياً", source: "الوزارة → البنك", status: "available", notes: "العدد الخام لكل سنة؛ يحسب فريق قرارات التراكمي." },

        { id: "p2_i08", stage: "مخرجات", shape: "matrix", label: "عدد الأسر المستفيدة سنوياً", source: "الوزارة → البنك", status: "available", notes: "العدد الخام لكل سنة؛ يحسب فريق قرارات التراكمي. متوافق مع عدد الوحدات السكنية." },
        { id: "p2_i13", stage: "مخرجات", shape: "matrix", label: "عدد المستفيدين (ذكور) (لكل سنة)", source: "الوزارة", status: "available", notes: "التوزيع حسب الجنس — العدد الخام للذكور لكل سنة." },
        { id: "p2_i14", stage: "مخرجات", shape: "matrix", label: "عدد المستفيدات (إناث) (لكل سنة)", source: "الوزارة", status: "available", notes: "التوزيع حسب الجنس — العدد الخام للإناث لكل سنة." },

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
        { id: "p3_i20", stage: "مدخلات", shape: "matrix", label: "المبلغ المصروف من الميزانية (لكل سنة)", source: "البنك", status: "available", notes: "المبلغ الخام المصروف؛ يحسب فريق قرارات نسبة الصرف من المخصص." },
        { id: "p3_i03", stage: "مدخلات", shape: "matrix", label: "تكلفة الشجرة الواحدة", source: "البنك", status: "available", notes: "" },
        { id: "p3_i04", stage: "مدخلات", shape: "matrix", label: "عدد الشراكات الفعّالة", source: "البنك", status: "available", notes: "" },
        { id: "p3_i05", stage: "مدخلات", shape: "matrix", label: "عدد الجهات الحكومية المشاركة", source: "البنك", status: "available", notes: "" },

        { id: "p3_i06", stage: "أنشطة", shape: "matrix", label: "عدد حملات الزراعة المنفذة", source: "البنك", status: "available", notes: "" },
        { id: "p3_i07", stage: "أنشطة", shape: "matrix", label: "عدد أنظمة معالجة المياه الرمادية المركَّبة", source: "البنك / الوزارة", status: "available", notes: "= عدد المساجد (نظام واحد لكل مسجد)." },
        { id: "p3_i21", stage: "أنشطة", shape: "matrix", label: "عدد الأنظمة العاملة بعد التركيب (لكل سنة)", source: "البنك / الوزارة", status: "available", notes: "العدد الخام؛ يحسب فريق قرارات النسبة من المركَّبة. عقد صيانة موجود." },
        { id: "p3_i09", stage: "أنشطة", shape: "matrix", label: "عدد المساجد المستهدفة سنوياً", source: "البنك", status: "available", notes: "" },
        { id: "p3_i22", stage: "أنشطة", shape: "matrix", label: "عدد المساجد المكتمل تشجيرها (لكل سنة)", source: "البنك", status: "available", notes: "العدد الخام؛ يحسب فريق قرارات نسبة الإكمال من المستهدفة." },

        { id: "p3_i11", stage: "مخرجات", shape: "matrix", label: "عدد المواقع المزروعة (لكل سنة)", source: "البنك", status: "available", notes: "العدد الخام لكل سنة؛ يحسب فريق قرارات التراكمي." },
        { id: "p3_i23", stage: "مخرجات", shape: "matrix", label: "التوزيع الجغرافي للمواقع (المدن لكل سنة)", source: "البنك", status: "available", notes: "مثلاً موقعان جيزان + ينبع — المدن المغطّاة لكل سنة." },
        { id: "p3_i24", stage: "مخرجات", shape: "matrix", label: "المساحة المزروعة الإجمالية (م²، لكل سنة)", source: "البنك", status: "available", notes: "" },
        { id: "p3_i25", stage: "مخرجات", shape: "matrix", label: "المساحة المغطاة بالتشجير في المساجد (م²، لكل سنة)", source: "البنك", status: "available", notes: "" },
        { id: "p3_i13", stage: "مخرجات", shape: "matrix", label: "عدد الأشجار المزروعة (لكل سنة)", source: "البنك", status: "available", notes: "العدد الخام لكل سنة؛ يحسب فريق قرارات التراكمي." },

        { id: "p3_i14", stage: "نتائج", shape: "matrix", label: "كمية المياه الرمادية المعالجة (لكل سنة)", source: "البنك / الوزارة", status: "fetch", notes: "أُعيدت صياغته من «نسبة توفير المياه». الكمية الخام لكل سنة؛ يحسب فريق قرارات التراكمي. الهدف معالجة لا توفير." },
        { id: "p3_i15", stage: "نتائج", shape: "matrix", label: "عدد المساجد ذات الأنظمة العاملة", source: "البنك / الوزارة", status: "available", notes: "" },
        { id: "p3_i16", stage: "نتائج", shape: "document", label: "تقييم الشركاء لأثر البرنامج البيئي", source: "وزارة البيئة (الشريك)", status: "permission", notes: "الشركاء = وزارة البيئة؛ البنك يرسل كونتاكتهم." },
        { id: "p3_i17", stage: "نتائج", shape: "matrix", label: "معدل بقاء الأشجار في المواقع (%)", source: "وزارة البيئة", status: "permission", notes: "program-supplied عبر الوزارة (سجل مُقدَّم من الوزارة)." },
        { id: "p3_i26", stage: "نتائج", shape: "matrix", label: "معدل بقاء الأشجار في المساجد (%)", source: "وزارة البيئة", status: "permission", notes: "program-supplied عبر الوزارة (سجل مُقدَّم من الوزارة)." },

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
        { id: "p4_i03", stage: "مدخلات", shape: "select", label: "حالة إدارة حملات التوعية والتحفيز", source: "البنك / غدا", status: "fetch", notes: "حالة إدارة الحملات؛ ضمن التقارير السنوية. التفاصيل تُرسَل بالبريد بشكل منفصل." },

        { id: "p4_i04", stage: "أنشطة", shape: "matrix", label: "عدد الأدوات التوعوية المنشورة", source: "البنك / غدا", status: "fetch", notes: "منشورات سوشيال؛ تحتاج تدقيق («8000 منشور»)." },
        { id: "p4_i05", stage: "أنشطة", shape: "matrix", label: "عدد الفرص التطوعية المصمَّمة", source: "البنك / غدا", status: "available", notes: "من التقرير السنوي." },
        { id: "p4_i14", stage: "أنشطة", shape: "matrix", label: "عدد الفرص الاحترافية المصمَّمة (لكل سنة)", source: "غدا", status: "available", notes: "العدد الخام؛ يحسب فريق قرارات نسبة الفرص الاحترافية من إجمالي الفرص المصمَّمة." },
        { id: "p4_i15", stage: "أنشطة", shape: "matrix", label: "عدد الفرص المخطَّط لها (لكل سنة)", source: "البنك / غدا", status: "available", notes: "العدد الخام؛ يحسب فريق قرارات نسبة المنفَّذ من المخطَّط (المنفَّذة أدناه)." },
        { id: "p4_i16", stage: "أنشطة", shape: "matrix", label: "عدد الفرص المنفَّذة (لكل سنة)", source: "البنك / غدا", status: "available", notes: "" },
        { id: "p4_i17", stage: "أنشطة", shape: "matrix", label: "عدد المتطوعين المسجَّلين (لكل سنة)", source: "البنك / غدا", status: "available", notes: "" },

        { id: "p4_i09", stage: "مخرجات", shape: "matrix", label: "عدد ساعات العمل التطوعي (لكل سنة)", source: "البنك / غدا", status: "available", notes: "العدد الخام؛ يحسب فريق قرارات متوسط الساعات لكل متطوع. في التقرير السنوي النهائي." },
        { id: "p4_i18", stage: "مخرجات", shape: "matrix", label: "القيمة الاقتصادية للساعات التطوعية (لكل سنة)", source: "البنك / غدا", status: "fetch", notes: "يُؤكَّد مع المالك: هل يكتب العميل رقماً فعلياً أم يحسبه فريق قرارات؟" },
        { id: "p4_i10", stage: "مخرجات", shape: "matrix", label: "عدد المتطوعين المشاركين في التطوع الاحترافي سنوياً", source: "غدا", status: "available", notes: "" },
        { id: "p4_i19", stage: "مخرجات", shape: "matrix", label: "عدد الجهات المستفيدة (لكل سنة)", source: "البنك / غدا", status: "available", notes: "" },
        { id: "p4_i20", stage: "مخرجات", shape: "matrix", label: "عدد قطاعات الجهات المستفيدة / قائمة القطاعات (لكل سنة)", source: "البنك / غدا", status: "available", notes: "عدد القطاعات أو قائمتها — تنوّع قطاعات الجهات المستفيدة." },

        { id: "p4_i13", stage: "أثر", shape: "matrix", label: "رفع معدلات ساعات التطوع في المملكة (مساهمة رؤية 2030)", source: "البنك", status: "available", notes: "سجل." },

        { id: "p4_doc1", stage: "مخرجات", shape: "document", label: "التقرير السنوي للتطوع العام (لكل سنة)", source: "البنك", status: "fetch", notes: "يحوي المتطوعين/الساعات/المقابل المالي/الفرص." },
        { id: "p4_doc2", stage: "مخرجات", shape: "document", label: "التقرير السنوي للتطوع الاحترافي — غدا (لكل سنة)", source: "غدا", status: "fetch", notes: "المسار المتوازي؛ تقرير نهائي لكل سنة." },

        { id: "p4_pii1", stage: "نتائج", shape: "pii", label: "قائمة متطوعي التطوع العام (اسم + جوال + بريد + مدينة + جنس + الحملات)", source: "البنك", status: "fetch", notes: "قائمة لكل سنة 2022–2025." },
        { id: "p4_pii2", stage: "نتائج", shape: "pii", label: "قائمة متطوعي التطوع الاحترافي — غدا (اسم + جوال + بريد + مدينة + جنس)", source: "غدا", status: "fetch", notes: "قائمة لكل سنة." }
      ]
    },

    /* ===================================================================== *
     * البرنامج 5 — التمويل المصغر
     * ===================================================================== */
    {
      id: "p5_microfinance",
      name: "التمويل المصغر",
      years: [2022, 2023, 2024, 2025],
      note: "السنوات مفترَضة 2022–2025 (تُؤكَّد مع المالك).",
      unreviewed: true,
      items: [
        { id: "p5_i01", stage: "مدخلات", shape: "matrix", label: "عدد الموظفين في الفروع", source: "الجمعية / البنك", status: "fetch", unreviewed: true, notes: "ن3 سجلات." },
        { id: "p5_i18", stage: "مدخلات", shape: "matrix", label: "عدد الموظفات ذوات الدخل المستقل (لكل سنة)", source: "الجمعية / البنك", status: "fetch", unreviewed: true, notes: "العدد الخام؛ يحسب فريق قرارات النسبة من إجمالي الموظفين." },
        { id: "p5_i03", stage: "مدخلات", shape: "matrix", label: "عدد الفروع المخصصة للبرنامج", source: "البنك", status: "fetch", unreviewed: true, notes: "" },
        { id: "p5_i04", stage: "مدخلات", shape: "matrix", label: "الميزانية المخصصة", source: "البنك", status: "fetch", unreviewed: true, notes: "" },

        { id: "p5_i05", stage: "أنشطة", shape: "matrix", label: "عدد القروض التي تم تقديمها", source: "الجمعية / البنك", status: "fetch", unreviewed: true, notes: "" },
        { id: "p5_i19", stage: "أنشطة", shape: "matrix", label: "عدد القروض المقبولة (لكل سنة)", source: "الجمعية / البنك", status: "fetch", unreviewed: true, notes: "العدد الخام؛ يحسب فريق قرارات معدل القبول من الطلبات." },
        { id: "p5_i07", stage: "أنشطة", shape: "matrix", label: "عدد طلبات التقديم على القروض", source: "الجمعية / البنك", status: "fetch", unreviewed: true, notes: "" },
        { id: "p5_i20", stage: "أنشطة", shape: "matrix", label: "قيمة القروض المحصَّلة (لكل سنة)", source: "الجمعية / البنك", status: "fetch", unreviewed: true, notes: "القيمة الخام؛ يحسب فريق قرارات معدل التحصيل من القيمة المقدمة." },

        { id: "p5_i09", stage: "مخرجات", shape: "matrix", label: "قيمة القروض المقدمة سنوياً", source: "الجمعية / البنك", status: "fetch", unreviewed: true, notes: "" },
        { id: "p5_i10", stage: "مخرجات", shape: "matrix", label: "عدد المستفيدات الحاصلات على قروض", source: "الجمعية / البنك", status: "fetch", unreviewed: true, notes: "" },

        { id: "p5_i13", stage: "نتائج", shape: "matrix", label: "عدد المشاريع التجارية التي تم إطلاقها", source: "المستفيدات (سجل الجمعية إن وُجد)", status: "fetch", unreviewed: true, notes: "يُبقى إن كان لدى الجمعية/البنك سجل بالمشاريع المُطلَقة؛ إن كان معروفاً عبر الاستبيان فقط فيُحذَف. مرشّح للمراجعة." }
      ]
    },

    /* ===================================================================== *
     * البرنامج 6 — ريادة الأعمال (الاحتضان)
     * ===================================================================== */
    {
      id: "p6_entrepreneurship",
      name: "ريادة الأعمال",
      years: [2022, 2023, 2024, 2025],
      note: "الشريك المذكور: أروقة (احتضان). السنوات مفترَضة 2022–2025 (تُؤكَّد مع المالك).",
      unreviewed: true,
      items: [
        { id: "p6_i01", stage: "مدخلات", shape: "matrix", label: "الميزانية السنوية المخصصة", source: "البنك", status: "fetch", unreviewed: true, notes: "" },
        { id: "p6_i19", stage: "مدخلات", shape: "matrix", label: "المبلغ المصروف من الميزانية (لكل سنة)", source: "البنك", status: "fetch", unreviewed: true, notes: "المبلغ الخام؛ يحسب فريق قرارات نسبة الصرف من المخصص." },
        { id: "p6_i03", stage: "مدخلات", shape: "select", label: "حالة اتفاقيات الشراكة الفعّالة", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "حالة الشراكة مع أروقة؛ المستند يُرسَل بالبريد بشكل منفصل." },

        { id: "p6_i06", stage: "أنشطة", shape: "matrix", label: "إجمالي التمويل المقدم للشركات الناشئة", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "" },
        { id: "p6_i20", stage: "أنشطة", shape: "matrix", label: "عدد ساعات التدريب (لكل سنة)", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "" },
        { id: "p6_i21", stage: "أنشطة", shape: "matrix", label: "عدد جلسات الإرشاد الفردية (لكل سنة)", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "" },
        { id: "p6_i22", stage: "أنشطة", shape: "matrix", label: "عدد طلبات الالتحاق (لكل سنة)", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "" },
        { id: "p6_i23", stage: "أنشطة", shape: "matrix", label: "عدد المقبولين (لكل سنة)", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "العدد الخام؛ يحسب فريق قرارات معدل القبول من الطلبات." },
        { id: "p6_i24", stage: "أنشطة", shape: "matrix", label: "عدد فعاليات الربط (لكل سنة)", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "" },
        { id: "p6_i25", stage: "أنشطة", shape: "matrix", label: "عدد المستثمرين المشاركين (لكل سنة)", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "" },

        { id: "p6_i26", stage: "مخرجات", shape: "matrix", label: "عدد الاتفاقيات الاستثمارية الموقعة (لكل سنة)", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "" },
        { id: "p6_i27", stage: "مخرجات", shape: "matrix", label: "إجمالي قيمة الاتفاقيات الاستثمارية (لكل سنة)", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "" },
        { id: "p6_i28", stage: "مخرجات", shape: "matrix", label: "عدد رواد الأعمال المحتضنين (لكل سنة)", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "العدد الخام لكل سنة؛ يحسب فريق قرارات التراكمي." },
        { id: "p6_i12", stage: "مخرجات", shape: "matrix", label: "عدد الشركات المحتضنة (لكل سنة)", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "العدد الخام لكل سنة؛ يحسب فريق قرارات التراكمي." },

        { id: "p6_i29", stage: "نتائج", shape: "matrix", label: "عدد الشركات الباقية بعد سنتين (لكل سنة)", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "العدد الخام؛ يحسب فريق قرارات معدل البقاء." },
        { id: "p6_i30", stage: "نتائج", shape: "matrix", label: "عدد الشركات الباقية بعد 5 سنوات (لكل سنة)", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "العدد الخام؛ يحسب فريق قرارات معدل البقاء." },
        { id: "p6_i31", stage: "نتائج", shape: "matrix", label: "عدد الشركات المحققة لإيرادات (لكل سنة)", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "العدد الخام؛ تُحذَف المتوسطات والنسب والمؤشرات المسحية." },
        { id: "p6_i32", stage: "نتائج", shape: "matrix", label: "إجمالي الوظائف المولَّدة (لكل سنة)", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "" },
        { id: "p6_i33", stage: "نتائج", shape: "matrix", label: "عدد الوظائف للسعوديين (لكل سنة)", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "العدد الخام؛ يحسب فريق قرارات نسبة التوطين." },

        { id: "p6_i18", stage: "أثر", shape: "matrix", label: "إجمالي إيرادات الشركات المتخرجة", source: "البنك / أروقة", status: "fetch", unreviewed: true, notes: "" }
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
        { id: "p7_i19", stage: "مدخلات", shape: "matrix", label: "المبلغ المصروف من الميزانية (2026)", source: "البنك / ركين", status: "available", notes: "المبلغ الخام المصروف؛ يحسب فريق قرارات نسبة الصرف من المخصص." },
        { id: "p7_i03", stage: "مدخلات", shape: "matrix", label: "عدد مستشاري ركين المشاركين", source: "ركين", status: "available", notes: "" },
        { id: "p7_i05", stage: "مدخلات", shape: "matrix", label: "عدد الشراكات الفعّالة (المركز الوطني والوحدات الإشرافية)", source: "البنك / ركين", status: "available", notes: "" },

        { id: "p7_i06", stage: "أنشطة", shape: "matrix", label: "عدد الجمعيات التي خضعت لتقييم الجاهزية", source: "ركين", status: "available", notes: "" },
        { id: "p7_i07", stage: "أنشطة", shape: "matrix", label: "عدد ورش العمل الحضورية المنفّذة", source: "ركين", status: "available", notes: "6 ورش." },
        { id: "p7_i08", stage: "أنشطة", shape: "matrix", label: "عدد منسوبي الجمعيات المشاركين في الورش", source: "ركين", status: "available", notes: "" },
        { id: "p7_i09", stage: "أنشطة", shape: "matrix", label: "رضا المشاركين عن ورش العمل (%)", source: "ركين (استبيان)", status: "available", notes: "self-reported." },
        { id: "p7_i10", stage: "أنشطة", shape: "matrix", label: "عدد اللقاءات المعرفية المنفّذة", source: "ركين", status: "available", notes: "3 لقاءات." },
        { id: "p7_i11", stage: "أنشطة", shape: "matrix", label: "عدد الزيارات الميدانية والجلسات الاستشارية المنفّذة", source: "ركين", status: "available", notes: "3 جلسات/جمعية، 20 ساعة لمسار التعظيم." },

        { id: "p7_i20", stage: "مخرجات", shape: "matrix", label: "عدد الجمعيات المؤهَّلة — مسار تمكين (2026)", source: "ركين", status: "available", notes: "تمكين 40." },
        { id: "p7_i21", stage: "مخرجات", shape: "matrix", label: "عدد الجمعيات المؤهَّلة — مسار تعظيم أثر (2026)", source: "ركين", status: "available", notes: "تعظيم 15." },
        { id: "p7_i13", stage: "مخرجات", shape: "matrix", label: "عدد تقارير تقييم الجاهزية الصادرة", source: "ركين", status: "available", notes: "" },
        { id: "p7_i14", stage: "مخرجات", shape: "matrix", label: "عدد خطط تفعيل المنافسات الحكومية المُعدّة", source: "ركين", status: "available", notes: "" },

        { id: "p7_i15", stage: "نتائج", shape: "matrix", label: "درجة جاهزية الإسناد (RCAT دخول/خروج)", source: "ركين", status: "available", notes: "سجل (لا استبيان) — ناتج RCAT موثَّق." },
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
  window.PARTNERSHIP_STATUS_OPTIONS = PARTNERSHIP_STATUS_OPTIONS;
  window.PII_STATUS_OPTIONS = PII_STATUS_OPTIONS;
  window.DEFAULT_YEARS = DEFAULT_YEARS;
}
