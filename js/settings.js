/**
 * Job Notification Tracker — Settings: load/save jobTrackerPreferences, prefill form
 */

(function () {
  function getFormData() {
    var roleEl = document.getElementById('role-keywords');
    var locEl = document.getElementById('preferred-locations');
    var modeChecks = document.querySelectorAll('input[name="preferredMode"]:checked');
    var expEl = document.getElementById('experience-level');
    var skillsEl = document.getElementById('skills');
    var minEl = document.getElementById('min-match-score');

    var locations = [];
    if (locEl) {
      for (var i = 0; i < locEl.options.length; i++) {
        if (locEl.options[i].selected) locations.push(locEl.options[i].value);
      }
    }
    var mode = [];
    for (var j = 0; j < modeChecks.length; j++) {
      mode.push(modeChecks[j].value);
    }

    return {
      roleKeywords: roleEl ? roleEl.value.trim() : '',
      preferredLocations: locations,
      preferredMode: mode,
      experienceLevel: expEl ? expEl.value : '',
      skills: skillsEl ? skillsEl.value.trim() : '',
      minMatchScore: minEl ? Math.max(0, Math.min(100, parseInt(minEl.value, 10) || 40)) : 40
    };
  }

  function setFormData(p) {
    if (!p) return;
    var roleEl = document.getElementById('role-keywords');
    var locEl = document.getElementById('preferred-locations');
    var modeChecks = document.querySelectorAll('input[name="preferredMode"]');
    var expEl = document.getElementById('experience-level');
    var skillsEl = document.getElementById('skills');
    var minEl = document.getElementById('min-match-score');
    var valueSpan = document.getElementById('min-match-value');

    if (roleEl && p.roleKeywords != null) roleEl.value = p.roleKeywords;
    if (locEl && Array.isArray(p.preferredLocations)) {
      for (var i = 0; i < locEl.options.length; i++) {
        locEl.options[i].selected = p.preferredLocations.indexOf(locEl.options[i].value) !== -1;
      }
    }
    if (modeChecks.length && Array.isArray(p.preferredMode)) {
      for (var k = 0; k < modeChecks.length; k++) {
        modeChecks[k].checked = p.preferredMode.indexOf(modeChecks[k].value) !== -1;
      }
    }
    if (expEl && p.experienceLevel != null) expEl.value = p.experienceLevel;
    if (skillsEl && p.skills != null) skillsEl.value = p.skills;
    if (minEl && typeof p.minMatchScore === 'number') {
      minEl.value = String(p.minMatchScore);
      minEl.setAttribute('aria-valuenow', p.minMatchScore);
    }
    if (valueSpan && typeof p.minMatchScore === 'number') valueSpan.textContent = p.minMatchScore;
  }

  function run() {
    var form = document.getElementById('preferences-form');
    var minEl = document.getElementById('min-match-score');
    var valueSpan = document.getElementById('min-match-value');

    if (typeof getPreferences !== 'undefined') {
      setFormData(getPreferences());
    }

    if (minEl && valueSpan) {
      minEl.addEventListener('input', function () {
        valueSpan.textContent = minEl.value;
        minEl.setAttribute('aria-valuenow', minEl.value);
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var data = getFormData();
        try {
          localStorage.setItem('jobTrackerPreferences', JSON.stringify(data));
          var btn = form.querySelector('button[type="submit"]');
          if (btn) {
            var orig = btn.textContent;
            btn.textContent = 'Saved';
            setTimeout(function () { btn.textContent = orig; }, 1500);
          }
        } catch (err) {}
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
