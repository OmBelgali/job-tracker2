/**
 * Job Notification Tracker — Test checklist: persist state, summary, reset
 */

(function () {
  var STORAGE_KEY = 'jobTrackerTestChecklist';
  var TOTAL = 10;

  function getChecklist() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Array(TOTAL).fill(false);
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length !== TOTAL) return new Array(TOTAL).fill(false);
      return arr.map(function (v) { return !!v; });
    } catch (e) {
      return new Array(TOTAL).fill(false);
    }
  }

  function setChecklist(arr) {
    try {
      var out = arr.slice(0, TOTAL);
      while (out.length < TOTAL) out.push(false);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(out.slice(0, TOTAL)));
    } catch (e) {}
  }

  function allTestsPassed() {
    var arr = getChecklist();
    return arr.length === TOTAL && arr.every(Boolean);
  }

  if (typeof window !== 'undefined') window.allTestsPassed = allTestsPassed;

  function updateSummary() {
    var arr = getChecklist();
    var passed = arr.filter(Boolean).length;
    var countEl = document.getElementById('test-passed-count');
    var warningEl = document.getElementById('test-ship-warning');
    if (countEl) countEl.textContent = String(passed);
    if (warningEl) warningEl.hidden = passed >= TOTAL;
  }

  function run() {
    var listEl = document.getElementById('test-list');
    var resetBtn = document.getElementById('test-reset');
    if (!listEl) return;

    var arr = getChecklist();
    listEl.querySelectorAll('.kn-test-item__cb').forEach(function (cb) {
      var i = parseInt(cb.getAttribute('data-index'), 10);
      if (!isNaN(i) && i >= 0 && i < TOTAL) cb.checked = arr[i];
      cb.addEventListener('change', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        if (isNaN(idx) || idx < 0 || idx >= TOTAL) return;
        var next = getChecklist();
        next[idx] = this.checked;
        setChecklist(next);
        updateSummary();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        setChecklist(new Array(TOTAL).fill(false));
        listEl.querySelectorAll('.kn-test-item__cb').forEach(function (cb) { cb.checked = false; });
        updateSummary();
      });
    }

    updateSummary();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
