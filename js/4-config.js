/* إعدادات المشروع / Project settings */
(function () {
  const q = new URLSearchParams(location.search);
  const level = ['desktop', 'touch', 'vr'].includes(q.get('level')) ? q.get('level') : 'desktop';
  window.CONFIG = {
    level,                       // desktop (low) | touch (medium) | vr (high) -- only desktop is built in v1
    lessonMs: 9000,              // time of normal lesson before the incident
    outageMs: 3800,              // how long the power is off
    interactDistance: 4.6,       // meters: max distance to talk to the teacher
    // Calibration order as seen by the student facing the board:
    // tl = top-left, tr = top-right, br = bottom-right, bl = bottom-left.
    // NOTE: the thesis documents say "the four points in the correct order" without naming the order.
    // Confirm it against the real board model, then edit here.
    calibrationOrder: ['tl', 'tr', 'br', 'bl'],
    hintAfterFailedCalibrations: 2,
    masteryRuns: 1               // number of fully-correct calibration runs required
  };
})();
