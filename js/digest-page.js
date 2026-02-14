/**
 * Job Notification Tracker — Digest page: state handling, generate, render, copy, mailto
 */

(function () {
  function escapeHtml(s) {
    if (s == null) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function formatDateKey(dateKey) {
    if (!dateKey) return new Date().toDateString();
    var parts = dateKey.split('-');
    if (parts.length !== 3) return dateKey;
    var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return isNaN(d.getTime()) ? dateKey : d.toDateString();
  }

  function formatStatusDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getStatusClass(status) {
    if (status === 'Applied') return 'kn-status--applied';
    if (status === 'Rejected') return 'kn-status--rejected';
    if (status === 'Selected') return 'kn-status--selected';
    return 'kn-status--not-applied';
  }

  function renderStatusUpdates() {
    var section = document.getElementById('status-updates-section');
    var listEl = document.getElementById('status-updates-list');
    if (!section || !listEl) return;
    var updates = typeof getStatusUpdates === 'function' ? getStatusUpdates() : [];
    listEl.innerHTML = '';
    if (!updates.length) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    updates.forEach(function (u) {
      var li = document.createElement('li');
      li.className = 'kn-status-updates__item';
      li.innerHTML =
        '<span class="kn-status-updates__job">' + escapeHtml(u.title) + ' — ' + escapeHtml(u.company) + '</span>' +
        ' <span class="kn-status-badge ' + getStatusClass(u.status) + '">' + escapeHtml(u.status) + '</span>' +
        ' <span class="kn-status-updates__date">' + escapeHtml(formatStatusDate(u.dateChanged)) + '</span>';
      listEl.appendChild(li);
    });
  }

  function renderDigest(digest, dateKey) {
    var wrap = document.getElementById('digest-card-wrap');
    var listEl = document.getElementById('digest-list');
    var dateEl = document.getElementById('digest-date');
    var copyBtn = document.getElementById('digest-copy');
    var mailtoLink = document.getElementById('digest-mailto');

    if (!digest || !digest.length) {
      document.getElementById('digest-no-matches').hidden = false;
      wrap.hidden = true;
      return;
    }

    document.getElementById('digest-no-matches').hidden = true;
    wrap.hidden = false;

    dateEl.textContent = formatDateKey(dateKey);
    listEl.innerHTML = '';

    digest.forEach(function (job) {
      var li = document.createElement('li');
      li.className = 'kn-digest-item';
      li.innerHTML =
        '<div class="kn-digest-item__main">' +
          '<span class="kn-digest-item__title">' + escapeHtml(job.title) + '</span>' +
          '<span class="kn-digest-item__company">' + escapeHtml(job.company) + '</span>' +
        '</div>' +
        '<p class="kn-digest-item__meta">' +
          escapeHtml(job.location || '') + ' · ' + escapeHtml(job.experience || '') +
          ' · <strong>' + (job._matchScore != null ? job._matchScore : 0) + '% match</strong>' +
        '</p>' +
        '<a href="#" class="kn-btn kn-btn--primary kn-digest-item__apply" target="_blank" rel="noopener">Apply</a>';
      var applyLink = li.querySelector('.kn-digest-item__apply');
      applyLink.href = job.applyUrl || '#';
      listEl.appendChild(li);
    });

    var dateLabel = formatDateKey(dateKey);
    var plainText = formatDigestPlainText(digest, dateLabel);

    copyBtn.onclick = function () {
      navigator.clipboard.writeText(plainText).then(function () {
        copyBtn.textContent = 'Copied';
        setTimeout(function () { copyBtn.textContent = 'Copy Digest to Clipboard'; }, 1500);
      }).catch(function () {});
    };

    mailtoLink.href = getMailtoLink(digest, dateLabel);
    renderStatusUpdates();
  }

  function run() {
    var blockEl = document.getElementById('digest-block');
    var zoneEl = document.getElementById('digest-zone');
    var generateBtn = document.getElementById('digest-generate');

    var prefs = typeof getPreferences === 'function' ? getPreferences() : null;
    if (!prefs) {
      blockEl.hidden = false;
      zoneEl.hidden = true;
      return;
    }

    blockEl.hidden = true;
    zoneEl.hidden = false;
    renderStatusUpdates();

    generateBtn.addEventListener('click', function () {
      var todayKey = getTodayKey();
      var existing = getDigestForToday();

      if (existing && Array.isArray(existing) && existing.length > 0) {
        renderDigest(existing, todayKey);
        return;
      }

      var jobs = window.JOBS;
      if (!jobs || !jobs.length) {
        document.getElementById('digest-no-matches').hidden = false;
        document.getElementById('digest-card-wrap').hidden = true;
        return;
      }

      var digest = generateDigest(jobs, prefs);
      saveDigest(todayKey, digest);
      renderDigest(digest, todayKey);
    });

    var existing = getDigestForToday();
    if (existing && Array.isArray(existing)) {
      renderDigest(existing, getTodayKey());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
