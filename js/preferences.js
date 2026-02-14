/**
 * Job Notification Tracker — Preferences storage and match score engine
 * Deterministic scoring per specification.
 */

(function (global) {
  var PREF_KEY = 'jobTrackerPreferences';

  function parseList(str) {
    if (!str || typeof str !== 'string') return [];
    return str.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function parseKeywords(str) {
    return parseList(str).map(function (s) { return s.toLowerCase(); });
  }

  /**
   * Get saved preferences from localStorage.
   * Returns null if not set or invalid.
   */
  function getPreferences() {
    try {
      var raw = localStorage.getItem(PREF_KEY);
      if (!raw) return null;
      var p = JSON.parse(raw);
      return {
        roleKeywords: (p.roleKeywords != null) ? String(p.roleKeywords).trim() : '',
        preferredLocations: Array.isArray(p.preferredLocations) ? p.preferredLocations : [],
        preferredMode: Array.isArray(p.preferredMode) ? p.preferredMode : [],
        experienceLevel: (p.experienceLevel != null) ? String(p.experienceLevel).trim() : '',
        skills: (p.skills != null) ? String(p.skills).trim() : '',
        minMatchScore: typeof p.minMatchScore === 'number' ? Math.max(0, Math.min(100, p.minMatchScore)) : 40
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Compute match score for a job given user preferences.
   * Exact rules:
   * +25 if any roleKeyword in job.title (case-insensitive)
   * +15 if any roleKeyword in job.description
   * +15 if job.location in preferredLocations
   * +10 if job.mode in preferredMode
   * +10 if job.experience === experienceLevel
   * +15 if overlap job.skills and user skills (any match)
   * +5 if postedDaysAgo <= 2
   * +5 if source === LinkedIn
   * Cap at 100.
   */
  function computeMatchScore(job, prefs) {
    if (!prefs) return 0;
    var score = 0;

    var roleKws = parseKeywords(prefs.roleKeywords);
    var title = (job.title || '').toLowerCase();
    var desc = (job.description || '').toLowerCase();

    if (roleKws.length) {
      for (var i = 0; i < roleKws.length; i++) {
        if (title.indexOf(roleKws[i]) !== -1) {
          score += 25;
          break;
        }
      }
    }
    if (roleKws.length) {
      for (var j = 0; j < roleKws.length; j++) {
        if (desc.indexOf(roleKws[j]) !== -1) {
          score += 15;
          break;
        }
      }
    }

    if (prefs.preferredLocations.length && job.location) {
      if (prefs.preferredLocations.indexOf(job.location) !== -1) score += 15;
    }
    if (prefs.preferredMode.length && job.mode) {
      if (prefs.preferredMode.indexOf(job.mode) !== -1) score += 10;
    }
    if (prefs.experienceLevel && job.experience === prefs.experienceLevel) score += 10;

    var userSkills = parseKeywords(prefs.skills);
    if (userSkills.length && job.skills && job.skills.length) {
      for (var k = 0; k < userSkills.length; k++) {
        for (var m = 0; m < job.skills.length; m++) {
          if (job.skills[m] && job.skills[m].toLowerCase() === userSkills[k]) {
            score += 15;
            k = userSkills.length;
            break;
          }
        }
      }
    }

    if (job.postedDaysAgo != null && job.postedDaysAgo <= 2) score += 5;
    if (job.source === 'LinkedIn') score += 5;

    return Math.min(100, score);
  }

  function getMatchBadgeClass(score) {
    if (score >= 80) return 'kn-match--high';
    if (score >= 60) return 'kn-match--medium';
    if (score >= 40) return 'kn-match--neutral';
    return 'kn-match--low';
  }

  global.getPreferences = getPreferences;
  global.computeMatchScore = computeMatchScore;
  global.getMatchBadgeClass = getMatchBadgeClass;
  global.PREF_KEY = PREF_KEY;
})(typeof window !== 'undefined' ? window : this);
