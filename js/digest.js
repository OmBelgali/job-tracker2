/**
 * Job Notification Tracker — Daily Digest Engine
 * Top 10 by matchScore desc, then postedDaysAgo asc. Persist per day.
 */

(function (global) {
  var PREFIX = 'jobTrackerDigest_';

  function getTodayKey() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function getDigestKey(date) {
    return PREFIX + date;
  }

  function getDigestForToday() {
    try {
      var key = getDigestKey(getTodayKey());
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Generate digest: top 10 jobs sorted by matchScore desc, then postedDaysAgo asc.
   * Returns array of job objects with _matchScore attached.
   */
  function generateDigest(jobs, prefs) {
    if (!jobs || !jobs.length || !prefs) return [];

    var list = jobs.slice();
    list.forEach(function (j) {
      j._matchScore = typeof computeMatchScore === 'function' ? computeMatchScore(j, prefs) : 0;
    });
    list.sort(function (a, b) {
      var s = (b._matchScore || 0) - (a._matchScore || 0);
      if (s !== 0) return s;
      return (a.postedDaysAgo != null ? a.postedDaysAgo : 999) - (b.postedDaysAgo != null ? b.postedDaysAgo : 999);
    });
    return list.slice(0, 10);
  }

  function saveDigest(date, digest) {
    try {
      localStorage.setItem(getDigestKey(date), JSON.stringify(digest));
    } catch (e) {}
  }

  function formatDigestPlainText(digest, dateLabel) {
    var lines = [
      'Top 10 Jobs For You — 9AM Digest',
      dateLabel || new Date().toDateString(),
      ''
    ];
    if (!digest || !digest.length) {
      lines.push('No matching roles today.');
      return lines.join('\n');
    }
    digest.forEach(function (job, i) {
      lines.push((i + 1) + '. ' + (job.title || '') + ' — ' + (job.company || ''));
      lines.push('   Location: ' + (job.location || '') + ' | Experience: ' + (job.experience || '') + ' | Match: ' + (job._matchScore != null ? job._matchScore : 0) + '%');
      lines.push('   Apply: ' + (job.applyUrl || ''));
      lines.push('');
    });
    lines.push('This digest was generated based on your preferences.');
    return lines.join('\n');
  }

  function getMailtoLink(digest, dateLabel) {
    var body = formatDigestPlainText(digest, dateLabel);
    var subject = 'My 9AM Job Digest';
    return 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  global.getTodayKey = getTodayKey;
  global.getDigestForToday = getDigestForToday;
  global.generateDigest = generateDigest;
  global.saveDigest = saveDigest;
  global.formatDigestPlainText = formatDigestPlainText;
  global.getMailtoLink = getMailtoLink;
})(typeof window !== 'undefined' ? window : this);
