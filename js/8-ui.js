/* واجهة عربية RTL / Arabic RTL overlay (first person) */
const UI = (function () {
  const $ = id => document.getElementById(id);
  let sayTimer = null;
  function say(speaker, text, ms) {
    const box = $('subtitle'); $('sub-speaker').textContent = speaker || '';
    $('sub-speaker').style.display = speaker ? 'block' : 'none';
    $('sub-text').textContent = text; box.classList.add('show');
    box.className = 'show ' + (speaker ? 'dialogue' : 'narration');
    clearTimeout(sayTimer);
    if (ms) sayTimer = setTimeout(() => box.classList.remove('show'), ms);
  }
  function clearSay() { $('subtitle').classList.remove('show'); }
  function objective(text) { const o = $('objective'); if (!text) { o.classList.remove('show'); return; } $('obj-text').textContent = text; o.classList.add('show'); }
  function hint(text) { const h = $('hint'); h.textContent = text || ''; h.classList.toggle('show', !!text); }
  function choices(prompt, list, cb) {
    const c = $('choices'); $('choices-prompt').textContent = prompt || ''; const box = $('choices-list'); box.innerHTML = '';
    list.forEach(it => {
      const b = document.createElement('button'); b.textContent = it.text; b.className = 'choice';
      b.onclick = () => { c.classList.remove('show'); cb(it); }; box.appendChild(b);
    });
    c.classList.add('show');
  }
  function hideChoices() { $('choices').classList.remove('show'); }
  function show(id) { $(id).classList.add('show'); }
  function hide(id) { $(id).classList.remove('show'); }
  function flash(cls) { const f = $('flash'); f.className = ''; void f.offsetWidth; f.className = cls; }
  function summary(sum) {
    const tbl = $('sum-table'); tbl.innerHTML = '';
    const rows = [['رقم الجلسة', sum.session_id], ['المستوى', ({ desktop: 'منخفض (شاشة + فأرة)', touch: 'متوسط (لمس)', vr: 'مرتفع (VR)' })[sum.level]],
      ['الزمن الكلي (ثانية)', sum.total_time_s], ['عدد الأخطاء', sum.error_count], ['محاولات المعايرة', sum.calibration_attempts]];
    rows.forEach(r => { const tr = document.createElement('tr'); tr.innerHTML = '<th></th><td></td>'; tr.children[0].textContent = r[0]; tr.children[1].textContent = r[1]; tbl.appendChild(tr); });
  }
  return { say, clearSay, objective, hint, choices, hideChoices, show, hide, flash, summary, $ };
})();
