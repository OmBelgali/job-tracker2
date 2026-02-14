/**
 * Job Notification Tracker — Dashboard: filter, match score, threshold, sort, render
 */

(function () {
  var SAVED_KEY = 'job-tracker-saved';
  var KEYWORD_DEBOUNCE_MS = 300;
  var keywordDebounceTimer = null;

  function getSavedIds() {
    try {
      var raw = localStorage.getItem(SAVED_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveJobId(id) {
    var ids = getSavedIds();
    if (ids.indexOf(id) === -1) {
      ids.push(id);
      localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
    }
  }

  function formatPosted(days) {
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return days + ' days ago';
  }

  function getUniqueLocations(jobs) {
    var set = {};
    jobs.forEach(function (j) {
      if (j.location) set[j.location] = true;
    });
    return Object.keys(set).sort();
  }

  function extractSalaryNumber(salaryRange) {
    if (!salaryRange || typeof salaryRange !== 'string') return 0;
    var m = salaryRange.match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }

  function filterAndSortJobs(jobs, filters, prefs, withScores) {
    var list = jobs.slice();

    if (filters.keyword) {
      var q = filters.keyword.toLowerCase().trim();
      list = list.filter(function (j) {
        return (j.title && j.title.toLowerCase().indexOf(q) !== -1) ||
               (j.company && j.company.toLowerCase().indexOf(q) !== -1);
      });
    }
    if (filters.location) {
      list = list.filter(function (j) { return j.location === filters.location; });
    }
    if (filters.mode) {
      list = list.filter(function (j) { return j.mode === filters.mode; });
    }
    if (filters.experience) {
      list = list.filter(function (j) { return j.experience === filters.experience; });
    }
    if (filters.source) {
      list = list.filter(function (j) { return j.source === filters.source; });
    }

    if (typeof computeMatchScore === 'function' && prefs) {
      list.forEach(function (j) {
        j._matchScore = computeMatchScore(j, prefs);
      });
    } else {
      list.forEach(function (j) { j._matchScore = 0; });
    }

    if (filters.aboveThreshold && prefs && typeof prefs.minMatchScore === 'number') {
      list = list.filter(function (j) { return j._matchScore >= prefs.minMatchScore; });
    }

    if (filters.sort === 'oldest') {
      list.sort(function (a, b) { return (b.postedDaysAgo || 0) - (a.postedDaysAgo || 0); });
    } else if (filters.sort === 'match') {
      list.sort(function (a, b) { return (b._matchScore || 0) - (a._matchScore || 0); });
    } else if (filters.sort === 'salary') {
      list.sort(function (a, b) {
        return extractSalaryNumber(b.salaryRange) - extractSalaryNumber(a.salaryRange);
      });
    } else {
      list.sort(function (a, b) { return (a.postedDaysAgo || 0) - (b.postedDaysAgo || 0); });
    }
    return list;
  }

  function renderCard(job, savedIds, onView, onSave) {
    var card = document.createElement('article');
    card.className = 'kn-job-card';
    card.setAttribute('data-job-id', job.id);
    card.setAttribute('role', 'listitem');

    var isSaved = savedIds.indexOf(job.id) !== -1;
    var score = job._matchScore != null ? job._matchScore : 0;
    var badgeClass = typeof getMatchBadgeClass === 'function' ? getMatchBadgeClass(score) : 'kn-match--neutral';

    card.innerHTML =
      '<h3 class="kn-job-card__title">' + escapeHtml(job.title) + '</h3>' +
      '<p class="kn-job-card__company">' + escapeHtml(job.company) + '</p>' +
      '<p class="kn-job-card__meta">' + escapeHtml(job.location || '') + ' · ' + escapeHtml(job.mode || '') + ' · ' + escapeHtml(job.experience || '') + '</p>' +
      '<p class="kn-job-card__salary">' + escapeHtml(job.salaryRange || '') + '</p>' +
      '<p class="kn-job-card__meta">' +
        '<span class="kn-job-card__match ' + badgeClass + '">' + score + '% match</span> ' +
        escapeHtml(formatPosted(job.postedDaysAgo != null ? job.postedDaysAgo : 0)) + ' <span class="kn-job-card__badge">' + escapeHtml(job.source || '') + '</span></p>' +
      '<div class="kn-job-card__footer">' +
        '<button type="button" class="kn-btn kn-btn--secondary kn-job-view">View</button>' +
        '<button type="button" class="kn-btn kn-btn--secondary kn-job-save" data-saved="' + (isSaved ? '1' : '0') + '">' + (isSaved ? 'Saved' : 'Save') + '</button>' +
        '<a href="' + escapeAttr(job.applyUrl || '#') + '" class="kn-btn kn-btn--primary" target="_blank" rel="noopener">Apply</a>' +
      '</div>';

    var viewBtn = card.querySelector('.kn-job-view');
    var saveBtn = card.querySelector('.kn-job-save');

    viewBtn.addEventListener('click', function () { onView(job); });
    saveBtn.addEventListener('click', function () {
      if (saveBtn.getAttribute('data-saved') === '1') return;
      saveJobId(job.id);
      saveBtn.textContent = 'Saved';
      saveBtn.setAttribute('data-saved', '1');
    });

    return card;
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

  function run() {
    var jobs = window.JOBS;
    if (!jobs || !jobs.length) return;

    var gridEl = document.getElementById('job-grid');
    var emptyEl = document.getElementById('empty-state');
    var bannerEl = document.getElementById('prefs-banner');
    var locationSelect = document.getElementById('filter-location');
    var keywordInput = document.getElementById('filter-keyword');
    var modeSelect = document.getElementById('filter-mode');
    var experienceSelect = document.getElementById('filter-experience');
    var sourceSelect = document.getElementById('filter-source');
    var sortSelect = document.getElementById('filter-sort');
    var thresholdCheck = document.getElementById('filter-threshold');

    var locations = getUniqueLocations(jobs);
    locations.forEach(function (loc) {
      var opt = document.createElement('option');
      opt.value = loc;
      opt.textContent = loc;
      locationSelect.appendChild(opt);
    });

    function applyFilters() {
      var prefs = typeof getPreferences === 'function' ? getPreferences() : null;
      if (bannerEl) {
        bannerEl.hidden = !!prefs;
      }

      var filters = {
        keyword: keywordInput ? keywordInput.value : '',
        location: locationSelect ? locationSelect.value : '',
        mode: modeSelect ? modeSelect.value : '',
        experience: experienceSelect ? experienceSelect.value : '',
        source: sourceSelect ? sourceSelect.value : '',
        sort: sortSelect ? sortSelect.value : 'latest',
        aboveThreshold: thresholdCheck ? thresholdCheck.checked : false
      };

      var list = filterAndSortJobs(jobs, filters, prefs, true);
      var savedIds = getSavedIds();

      gridEl.innerHTML = '';
      if (list.length === 0) {
        emptyEl.hidden = false;
      } else {
        emptyEl.hidden = true;
        list.forEach(function (job) {
          gridEl.appendChild(renderCard(job, savedIds, openModal, saveJobId));
        });
      }
    }

    function debouncedApply() {
      if (keywordDebounceTimer) clearTimeout(keywordDebounceTimer);
      keywordDebounceTimer = setTimeout(applyFilters, KEYWORD_DEBOUNCE_MS);
    }

    if (keywordInput) {
      keywordInput.addEventListener('input', debouncedApply);
    }
    if (locationSelect) locationSelect.addEventListener('change', applyFilters);
    if (modeSelect) modeSelect.addEventListener('change', applyFilters);
    if (experienceSelect) experienceSelect.addEventListener('change', applyFilters);
    if (sourceSelect) sourceSelect.addEventListener('change', applyFilters);
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
    if (thresholdCheck) thresholdCheck.addEventListener('change', applyFilters);

    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('job-modal').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.getElementById('job-modal').getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });

    applyFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
