/**
 * Job Notification Tracker — Saved: render saved jobs from localStorage
 */

(function () {
  var SAVED_KEY = 'job-tracker-saved';

  function getSavedIds() {
    try {
      var raw = localStorage.getItem(SAVED_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function removeSavedId(id) {
    var ids = getSavedIds().filter(function (x) { return x !== id; });
    localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
  }

  function formatPosted(days) {
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return days + ' days ago';
  }

  function escapeHtml(s) {
    if (s == null) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function escapeAttr(s) {
    if (s == null) return '#';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML.replace(/"/g, '&quot;');
  }

  function openModal(job) {
    var overlay = document.getElementById('job-modal');
    overlay.querySelector('#modal-title').textContent = job.title || '';
    overlay.querySelector('.kn-modal__company').textContent = job.company || '';
    overlay.querySelector('.kn-modal__description').textContent = job.description || '';
    var skillsEl = overlay.querySelector('.kn-modal__skills');
    skillsEl.innerHTML = '';
    if (job.skills && job.skills.length) {
      job.skills.forEach(function (s) {
        var span = document.createElement('span');
        span.textContent = s;
        skillsEl.appendChild(span);
      });
    }
    overlay.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    document.getElementById('job-modal').setAttribute('aria-hidden', 'true');
  }

  function renderCard(job, onView, onRemove) {
    var card = document.createElement('article');
    card.className = 'kn-job-card';
    card.setAttribute('data-job-id', job.id);
    card.setAttribute('role', 'listitem');

    card.innerHTML =
      '<h3 class="kn-job-card__title">' + escapeHtml(job.title) + '</h3>' +
      '<p class="kn-job-card__company">' + escapeHtml(job.company) + '</p>' +
      '<p class="kn-job-card__meta">' + escapeHtml(job.location || '') + ' · ' + escapeHtml(job.mode || '') + ' · ' + escapeHtml(job.experience || '') + '</p>' +
      '<p class="kn-job-card__salary">' + escapeHtml(job.salaryRange || '') + '</p>' +
      '<p class="kn-job-card__meta">' + escapeHtml(formatPosted(job.postedDaysAgo != null ? job.postedDaysAgo : 0)) + ' <span class="kn-job-card__badge">' + escapeHtml(job.source || '') + '</span></p>' +
      '<div class="kn-job-card__footer">' +
        '<button type="button" class="kn-btn kn-btn--secondary kn-job-view">View</button>' +
        '<button type="button" class="kn-btn kn-btn--secondary kn-job-remove">Remove</button>' +
        '<a href="' + escapeAttr(job.applyUrl || '#') + '" class="kn-btn kn-btn--primary" target="_blank" rel="noopener">Apply</a>' +
      '</div>';

    card.querySelector('.kn-job-view').addEventListener('click', function () { onView(job); });
    card.querySelector('.kn-job-remove').addEventListener('click', function () {
      onRemove(job.id, card);
    });

    return card;
  }

  function render() {
    var jobs = window.JOBS;
    if (!jobs || !jobs.length) return;

    var savedIds = getSavedIds();
    var savedJobs = jobs.filter(function (j) { return savedIds.indexOf(j.id) !== -1; });

    var emptyEl = document.getElementById('saved-empty');
    var gridEl = document.getElementById('saved-grid');
    gridEl.innerHTML = '';

    if (savedJobs.length === 0) {
      emptyEl.hidden = false;
      gridEl.hidden = true;
    } else {
      emptyEl.hidden = true;
      gridEl.hidden = false;
      savedJobs.forEach(function (job) {
        var card = renderCard(job, openModal, function (id, cardEl) {
          removeSavedId(id);
          cardEl.remove();
          if (gridEl.children.length === 0) {
            emptyEl.hidden = false;
            gridEl.hidden = true;
          }
        });
        gridEl.appendChild(card);
      });
    }
  }

  function run() {
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('job-modal').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.getElementById('job-modal').getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
