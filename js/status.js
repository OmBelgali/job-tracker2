/**
 * Job Notification Tracker — Job status tracking (localStorage)
 * jobTrackerStatus = { jobId: status }
 * jobTrackerStatusUpdates = [ { jobId, title, company, status, dateChanged }, ... ]
 */

(function (global) {
  var STATUS_KEY = 'jobTrackerStatus';
  var UPDATES_KEY = 'jobTrackerStatusUpdates';
  var UPDATES_MAX = 50;
  var TOAST_DURATION_MS = 2500;

  function getStatusMap() {
    try {
      var raw = localStorage.getItem(STATUS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function getJobStatus(jobId) {
    var map = getStatusMap();
    var s = map[jobId];
    return s === 'Applied' || s === 'Rejected' || s === 'Selected' ? s : 'Not Applied';
  }

  function setJobStatus(jobId, status) {
    var map = getStatusMap();
    map[jobId] = status;
    try {
      localStorage.setItem(STATUS_KEY, JSON.stringify(map));
    } catch (e) {}
  }

  function getStatusUpdates() {
    try {
      var raw = localStorage.getItem(UPDATES_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function pushStatusUpdate(jobId, title, company, status) {
    var list = getStatusUpdates();
    list.unshift({
      jobId: jobId,
      title: title || '',
      company: company || '',
      status: status,
      dateChanged: new Date().toISOString()
    });
    if (list.length > UPDATES_MAX) list.length = UPDATES_MAX;
    try {
      localStorage.setItem(UPDATES_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function showToast(message) {
    var existing = document.getElementById('kn-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'kn-toast';
    toast.className = 'kn-toast';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('kn-toast--visible');
    });

    setTimeout(function () {
      toast.classList.remove('kn-toast--visible');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 200);
    }, TOAST_DURATION_MS);
  }

  global.getJobStatus = getJobStatus;
  global.setJobStatus = setJobStatus;
  global.getStatusUpdates = getStatusUpdates;
  global.pushStatusUpdate = pushStatusUpdate;
  global.showToast = showToast;
})(typeof window !== 'undefined' ? window : this);
