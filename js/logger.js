/* تسجيل التفاعل / Interaction logger (criterion 51: record student performance) */
const Logger = (function () {
  let sid = '', level = '', t0 = 0, seq = 0, events = [];
  const COLS = ['session_id', 'seq', 't_ms', 'timestamp', 'level', 'state', 'event', 'target', 'expected', 'correct', 'attempt', 'step', 'detail'];

  function persist() {
    try { localStorage.setItem('immersive_log_' + sid, JSON.stringify(events)); } catch (e) {}
  }
  function start(id, lvl) {
    sid = id; level = lvl; t0 = performance.now(); seq = 0; events = [];
    log('session_start', { detail: navigator.userAgent });
  }
  function log(event, o) {
    o = o || {};
    const e = {
      session_id: sid, seq: ++seq, t_ms: Math.round(performance.now() - t0),
      timestamp: new Date().toISOString(), level: level,
      state: o.state || '', event: event, target: o.target || '', expected: o.expected || '',
      correct: o.correct === undefined ? '' : (o.correct ? 1 : 0),
      attempt: o.attempt === undefined ? '' : o.attempt, step: o.step || '', detail: o.detail || ''
    };
    events.push(e); persist();
    return e;
  }
  function summary() {
    const errs = events.filter(e => e.event === 'error');
    const calAttempts = events.filter(e => e.event === 'calibration_attempt_end');
    const end = events.filter(e => e.event === 'session_end')[0];
    const steps = {};
    events.filter(e => e.event === 'step_complete').forEach(e => { steps[e.step] = e.t_ms; });
    return {
      session_id: sid, level: level,
      total_time_s: Math.round(((end ? end.t_ms : (performance.now() - t0))) / 100) / 10,
      error_count: errs.length,
      errors_by_type: errs.reduce((m, e) => (m[e.detail] = (m[e.detail] || 0) + 1, m), {}),
      calibration_attempts: calAttempts.length,
      calibration_failed_attempts: calAttempts.filter(e => e.correct === 0).length,
      step_completion_t_ms: steps
    };
  }
  function toCSV() {
    const esc = v => '"' + String(v === undefined ? '' : v).replace(/"/g, '""') + '"';
    return '\ufeff' + COLS.join(',') + '\n' + events.map(e => COLS.map(c => esc(e[c])).join(',')).join('\n');
  }
  function toJSON() { return JSON.stringify({ summary: summary(), events: events }, null, 2); }
  function download(name, text, mime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: mime + ';charset=utf-8' }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function exportCSV() { download('session_' + sid + '.csv', toCSV(), 'text/csv'); }
  function exportJSON() { download('session_' + sid + '.json', toJSON(), 'application/json'); }
  return { start, log, summary, exportCSV, exportJSON, toCSV, toJSON, events: () => events };
})();
