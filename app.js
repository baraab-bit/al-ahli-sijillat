/* ============================================================================
 * app.js — render the form from REGISTER, autosave to localStorage,
 *          export to xlsx. No backend; fully static.
 * ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "snb_sijillat_v1";
  var $ = function (s, r) { return (r || document).querySelector(s); };

  // ---- state ---------------------------------------------------------------
  // answers[itemId] = { cells:{year:val}, status:"", count:"", notes:"" }
  var answers = loadState();
  var saveTimer = null;

  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch (e) {}
  }
  function ans(id) { return answers[id] || (answers[id] = { cells: {}, status: "", count: "", notes: "" }); }

  function itemYears(item, program) { return item.years || program.years || window.DEFAULT_YEARS; }

  // ---- save indicator ------------------------------------------------------
  function markDirty() {
    var dot = $("#saveDot"), txt = $("#saveText");
    dot.className = "dot dirty"; txt.textContent = "جارٍ الحفظ…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      persist();
      dot.className = "dot saved";
      txt.textContent = "تم الحفظ تلقائيًا";
      refreshAllProgress();
    }, 500);
  }

  // ---- header meta ---------------------------------------------------------
  function fillMeta() {
    var m = window.REGISTER.meta;
    $("#docTitle").textContent = m.project;
    $("#docSub").textContent = m.statusNote;
    $("#metaBar").innerHTML =
      '<span><b>العميل:</b> ' + m.client + '</span>' +
      '<span><b>الإعداد:</b> ' + m.preparedBy + '</span>' +
      '<span><b>التاريخ:</b> <span class="lat">' + m.date + '</span></span>';
    $("#footMeta").textContent = "آخر تحديث للنموذج: " + m.date;
  }

  // ---- nav tabs ------------------------------------------------------------
  function buildTabs() {
    var nav = $("#tabNav");
    window.REGISTER.programs.forEach(function (p, i) {
      var t = document.createElement("button");
      t.className = "tab" + (i === 0 ? " active" : "");
      t.dataset.target = p.id;
      t.innerHTML =
        '<span class="num lat">' + (i + 1) + '</span>' +
        '<span>' + p.name + '</span>' +
        (p.unreviewed ? '<span class="warn" title="غير مُراجَع">⚠</span>' : '') +
        '<span class="prog" id="tabprog_' + p.id + '">0%</span>';
      t.addEventListener("click", function () { showProgram(p.id); });
      nav.appendChild(t);
    });
  }

  function showProgram(id) {
    document.querySelectorAll(".program").forEach(function (el) { el.classList.toggle("active", el.id === "prog_" + id); });
    document.querySelectorAll(".tab").forEach(function (el) { el.classList.toggle("active", el.dataset.target === id); });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---- escape --------------------------------------------------------------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var SHAPE_LABEL = { matrix: "مصفوفة سنوات", document: "وثيقة مرفقة", pii: "قائمة مستفيدين (PII)", select: "حالة (اختيار)" };

  // ---- render one item -----------------------------------------------------
  function renderItem(item, program) {
    var a = ans(item.id);
    var avail = window.AVAILABILITY[item.status] || window.AVAILABILITY.fetch;
    var html = '<div class="item" data-item="' + item.id + '">';
    html += '<div class="item-top">';
    html += '<div class="item-label">' + esc(item.label) + '</div>';
    html += '<div class="item-meta">';
    html += '<span class="tag shape">' + SHAPE_LABEL[item.shape] + '</span>';
    html += '<span class="pill ' + avail.tone + '">' + esc(avail.label) + '</span>';
    if (item.unreviewed) html += '<span class="unrev-flag">⚠ غير مُراجَع</span>';
    html += '</div></div>';
    if (item.source) html += '<div class="item-hint">المصدر / المالك: ' + esc(item.source) + (item.notes ? ' — ' + esc(item.notes) : '') + '</div>';
    else if (item.notes) html += '<div class="item-hint">' + esc(item.notes) + '</div>';

    if (item.shape === "matrix") html += renderMatrix(item, program, a);
    else if (item.shape === "document") html += renderDocument(item, a);
    else if (item.shape === "select") html += renderSelect(item, a);
    else if (item.shape === "pii") html += renderPii(item, a);

    html += '</div>';
    return html;
  }

  function renderMatrix(item, program, a) {
    var years = itemYears(item, program);
    var h = '<div class="matrix"><table><thead><tr><th class="ylabel">القيمة لكل سنة</th>';
    years.forEach(function (y) { h += '<th class="lat">' + y + '</th>'; });
    h += '</tr></thead><tbody><tr><td style="background:var(--sand-050);font-size:12px;color:var(--ink-500)">أدخِل القيمة</td>';
    years.forEach(function (y) {
      var v = (a.cells && a.cells[y] != null) ? a.cells[y] : "";
      h += '<td><input type="text" inputmode="decimal" data-cell="' + y + '" value="' + esc(v) + '" placeholder="—" /></td>';
    });
    h += '</tr></tbody></table></div>';
    return h;
  }

  function optionsHtml(opts, selected) {
    return opts.map(function (o) {
      return '<option value="' + esc(o.value) + '"' + (o.value === selected ? " selected" : "") + '>' + esc(o.label) + '</option>';
    }).join("");
  }

  function renderDocument(item, a) {
    return '<div class="doc-row"><div class="doc-grid">' +
      '<div class="field"><label>حالة المستند</label>' +
      '<select data-field="status">' + optionsHtml(window.DOC_STATUS_OPTIONS, a.status) + '</select></div>' +
      '<div class="field"><label>ملاحظات (اسم الملف / تفاصيل الإرسال)</label>' +
      '<input class="txtin" data-field="notes" value="' + esc(a.notes) + '" placeholder="مثال: سيُرسَل بالبريد بصيغة PDF" /></div>' +
      '</div></div>';
  }

  function renderSelect(item, a) {
    return '<div class="doc-row"><div class="doc-grid">' +
      '<div class="field"><label>حالة الشراكة / الاتفاقية</label>' +
      '<select data-field="status">' + optionsHtml(window.PARTNERSHIP_STATUS_OPTIONS, a.status) + '</select></div>' +
      '<div class="field"><label>ملاحظات (المستند المرفق / تفاصيل)</label>' +
      '<input class="txtin" data-field="notes" value="' + esc(a.notes) + '" placeholder="مثال: مذكرة التفاهم تُرسَل بالبريد" /></div>' +
      '</div></div>';
  }

  function renderPii(item, a) {
    return '<div class="pii-row">' +
      '<div class="notice pii" style="margin-top:0"><span class="ic">🔒</span><div>هذه قائمة تحتوي بيانات شخصية — ' +
      '<b>تُرسَل بشكل منفصل وآمن، ولا تُدخَل هنا.</b> أدخِل الحالة والعدد فقط.</div></div>' +
      '<div class="pii-grid" style="margin-top:10px">' +
      '<div class="field"><label>حالة القائمة</label>' +
      '<select data-field="status">' + optionsHtml(window.PII_STATUS_OPTIONS, a.status) + '</select></div>' +
      '<div class="field"><label>عدد الأشخاص (تقريبي)</label>' +
      '<input class="txtin count-in" data-field="count" inputmode="numeric" value="' + esc(a.count) + '" placeholder="—" /></div>' +
      '<div class="field"><label>ملاحظات</label>' +
      '<input class="txtin" data-field="notes" value="' + esc(a.notes) + '" placeholder="مثال: قائمة منفصلة لكل سنة" /></div>' +
      '</div></div>';
  }

  // ---- render programs -----------------------------------------------------
  function buildPrograms() {
    var root = $("#programs");
    window.REGISTER.programs.forEach(function (p, i) {
      var sec = document.createElement("section");
      sec.className = "program" + (i === 0 ? " active" : "");
      sec.id = "prog_" + p.id;

      var h = '<div class="prog-head">';
      h += '<h2><span class="idx lat">' + (i + 1) + '</span>' + esc(p.name) +
           ' <span style="font-size:13px;color:var(--ink-500);font-weight:400">(' +
           p.years.map(function (y) { return '<span class="lat">' + y + '</span>'; }).join("–") + ')</span></h2>';
      h += '<div class="prog-progress"><div class="lbl"><span>نسبة الإكمال</span>' +
           '<span id="pct_' + p.id + '" class="lat">0%</span></div>' +
           '<div class="barwrap"><div class="bar" id="bar_' + p.id + '"></div></div></div>';
      h += '</div>';

      if (p.unreviewed)
        h += '<div class="prog-banner"><span>⚠</span><div>هذا البرنامج <b>لم يُراجَع مع العميل بعد</b> — البنود مبنية من المنهجية (ن3). ' +
             'يمكنك تعبئتها، وستُراجَع الصياغة والتوافر لاحقاً.</div></div>';

      h += '<div class="prog-note">' + esc(p.note) + '</div>';

      // group by stage in canonical order
      window.REGISTER.stages.forEach(function (stage) {
        var items = p.items.filter(function (it) { return it.stage === stage; });
        if (!items.length) return;
        h += '<div class="stage"><div class="stage-head"><span class="chip">' + esc(stage) + '</span><span class="rule"></span></div>';
        items.forEach(function (it) { h += renderItem(it, p); });
        h += '</div>';
      });

      sec.innerHTML = h;
      root.appendChild(sec);
    });
    wireInputs();
    refreshAllProgress();
  }

  // ---- input wiring --------------------------------------------------------
  function wireInputs() {
    $("#programs").addEventListener("input", onChange);
    $("#programs").addEventListener("change", onChange);
  }
  function onChange(e) {
    var el = e.target;
    var card = el.closest(".item");
    if (!card) return;
    var id = card.dataset.item;
    var a = ans(id);
    if (el.dataset.cell != null) { a.cells[el.dataset.cell] = el.value; }
    else if (el.dataset.field) { a[el.dataset.field] = el.value; }
    markDirty();
  }

  // ---- progress ------------------------------------------------------------
  function itemFilled(item, program) {
    var a = answers[item.id];
    if (!a) return false;
    if (item.shape === "matrix") {
      return itemYears(item, program).some(function (y) { return a.cells[y] != null && String(a.cells[y]).trim() !== ""; });
    }
    return (a.status && a.status !== "") || (a.count && String(a.count).trim() !== "");
  }
  function programProgress(p) {
    var total = p.items.length, done = 0;
    p.items.forEach(function (it) { if (itemFilled(it, p)) done++; });
    return total ? Math.round((done / total) * 100) : 0;
  }
  function refreshAllProgress() {
    window.REGISTER.programs.forEach(function (p) {
      var pct = programProgress(p);
      var bar = $("#bar_" + p.id), lbl = $("#pct_" + p.id), tab = $("#tabprog_" + p.id);
      if (bar) bar.style.width = pct + "%";
      if (lbl) lbl.textContent = pct + "%";
      if (tab) tab.textContent = pct + "%";
    });
  }

  // ---- toast ---------------------------------------------------------------
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    setTimeout(function () { t.classList.remove("show"); }, 2400);
  }

  // ---- xlsx export ---------------------------------------------------------
  function buildSheetForProgram(p) {
    // Header rows
    var rows = [];
    rows.push(["البرنامج:", p.name]);
    rows.push(["السنوات:", p.years.join(" – ")]);
    if (p.unreviewed) rows.push(["تنبيه:", "غير مُراجَع مع العميل — مبني من المنهجية (ن3)"]);
    rows.push([]);

    var maxYears = p.years.slice();
    // ensure any item-specific years present in columns
    p.items.forEach(function (it) {
      if (it.shape === "matrix") (it.years || []).forEach(function (y) { if (maxYears.indexOf(y) < 0) maxYears.push(y); });
    });
    maxYears.sort(function (a, b) { return a - b; });

    var header = ["المرحلة", "البند / المؤشر", "شكل البيان", "الحالة (التوافر)", "المصدر / المالك"];
    maxYears.forEach(function (y) { header.push(String(y)); });
    header.push("حالة المستند/القائمة", "العدد", "ملاحظات");
    rows.push(header);

    window.REGISTER.stages.forEach(function (stage) {
      p.items.filter(function (it) { return it.stage === stage; }).forEach(function (it) {
        var a = answers[it.id] || { cells: {}, status: "", count: "", notes: "" };
        var avail = (window.AVAILABILITY[it.status] || {}).label || "";
        var row = [it.stage, it.label, SHAPE_LABEL[it.shape], avail, it.source || ""];
        var yrs = itemYears(it, p);
        maxYears.forEach(function (y) {
          row.push((it.shape === "matrix" && yrs.indexOf(y) >= 0 && a.cells[y] != null) ? a.cells[y] : "");
        });
        // status/count/notes columns
        var statusText = "";
        if (it.shape === "document") statusText = labelFor(window.DOC_STATUS_OPTIONS, a.status);
        else if (it.shape === "select") statusText = labelFor(window.PARTNERSHIP_STATUS_OPTIONS, a.status);
        else if (it.shape === "pii") statusText = labelFor(window.PII_STATUS_OPTIONS, a.status);
        row.push(statusText, a.count || "", a.notes || "");
        rows.push(row);
      });
    });

    var ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 9 }, { wch: 46 }, { wch: 16 }, { wch: 16 }, { wch: 22 }]
      .concat(maxYears.map(function () { return { wch: 9 }; }))
      .concat([{ wch: 26 }, { wch: 8 }, { wch: 30 }]);
    ws["!sheetViews"] = [{ rightToLeft: true }];
    return ws;
  }
  function labelFor(opts, v) { var o = opts.filter(function (x) { return x.value === v; })[0]; return o && o.value ? o.label : ""; }

  function sheetName(p, i) {
    // Excel sheet names max 31 chars, no special chars
    var n = (i + 1) + "-" + p.name;
    return n.replace(/[\\\/\?\*\[\]:]/g, "").slice(0, 31);
  }

  function exportXlsx() {
    var wb = XLSX.utils.book_new();
    wb.Workbook = { Views: [{ RTL: true }] };
    window.REGISTER.programs.forEach(function (p, i) {
      XLSX.utils.book_append_sheet(wb, buildSheetForProgram(p), sheetName(p, i));
    });
    var stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, "سجل-البنك-الأهلي-" + stamp + ".xlsx");
    toast("تم تصدير ملف Excel ✓");
  }

  function rerenderValues() {
    // Re-sync DOM inputs from answers without full rebuild
    document.querySelectorAll(".item").forEach(function (card) {
      var a = answers[card.dataset.item]; if (!a) return;
      card.querySelectorAll("[data-cell]").forEach(function (inp) {
        inp.value = (a.cells && a.cells[inp.dataset.cell] != null) ? a.cells[inp.dataset.cell] : "";
      });
      card.querySelectorAll("[data-field]").forEach(function (inp) {
        inp.value = a[inp.dataset.field] != null ? a[inp.dataset.field] : "";
      });
    });
    refreshAllProgress();
    $("#saveDot").className = "dot saved"; $("#saveText").textContent = "تم الحفظ تلقائيًا";
  }

  function clearAll() {
    if (!confirm("سيُمسح كل ما أدخلته في هذا الجهاز نهائياً. هل أنت متأكد؟")) return;
    answers = {}; persist();
    document.querySelectorAll("#programs input").forEach(function (i) { i.value = ""; });
    document.querySelectorAll("#programs select").forEach(function (s) { s.selectedIndex = 0; });
    refreshAllProgress();
    $("#saveDot").className = "dot"; $("#saveText").textContent = "تم المسح";
    toast("تم مسح جميع البيانات");
  }

  // ---- boot ----------------------------------------------------------------
  function init() {
    fillMeta();
    buildTabs();
    buildPrograms();
    rerenderValues();

    $("#btnExport").addEventListener("click", exportXlsx);
    $("#btnClear").addEventListener("click", clearAll);

    if (Object.keys(answers).length) { $("#saveDot").className = "dot saved"; $("#saveText").textContent = "تم استرجاع عملك المحفوظ"; }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
