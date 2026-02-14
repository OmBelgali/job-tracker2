/**
 * Job Notification Tracker — Proof artifacts: links storage, validation, submission text, ship status
 */

(function (global) {
  var PROOF_KEY = 'jobTrackerProof';

  function isValidUrl(s) {
    if (!s || typeof s !== 'string') return false;
    var t = s.trim();
    return /^https?:\/\/[^\s]+$/i.test(t);
  }

  function getProof() {
    try {
      var raw = localStorage.getItem(PROOF_KEY);
      if (!raw) return { lovableLink: '', githubLink: '', deployedUrl: '' };
      var p = JSON.parse(raw);
      return {
        lovableLink: (p.lovableLink != null) ? String(p.lovableLink).trim() : '',
        githubLink: (p.githubLink != null) ? String(p.githubLink).trim() : '',
        deployedUrl: (p.deployedUrl != null) ? String(p.deployedUrl).trim() : ''
      };
    } catch (e) {
      return { lovableLink: '', githubLink: '', deployedUrl: '' };
    }
  }

  function setProof(obj) {
    try {
      var p = getProof();
      if (obj.lovableLink != null) p.lovableLink = String(obj.lovableLink).trim();
      if (obj.githubLink != null) p.githubLink = String(obj.githubLink).trim();
      if (obj.deployedUrl != null) p.deployedUrl = String(obj.deployedUrl).trim();
      localStorage.setItem(PROOF_KEY, JSON.stringify(p));
    } catch (e) {}
  }

  function allProofLinksProvided() {
    var p = getProof();
    return isValidUrl(p.lovableLink) && isValidUrl(p.githubLink) && isValidUrl(p.deployedUrl);
  }

  function getShipStatus() {
    var testsOk = typeof allTestsPassed === 'function' && allTestsPassed();
    var linksOk = allProofLinksProvided();
    if (testsOk && linksOk) return 'Shipped';
    if (testsOk || linksOk || typeof getProof === 'function') {
      var p = getProof();
      if (p.lovableLink || p.githubLink || p.deployedUrl) return 'In Progress';
      if (testsOk) return 'In Progress';
    }
    return 'Not Started';
  }

  function getStepCompletion() {
    var steps = [
      { label: 'Design system', completed: true },
      { label: 'Routes & navigation', completed: true },
      { label: 'Landing & settings', completed: false },
      { label: 'Dashboard & job data', completed: true },
      { label: 'Match scoring & preferences', completed: false },
      { label: 'Daily digest', completed: false },
      { label: 'Status tracking', completed: false },
      { label: 'Test checklist', completed: false }
    ];
    try {
      if (localStorage.getItem('jobTrackerPreferences')) {
        steps[2].completed = true;
        steps[4].completed = true;
      }
      var today = new Date();
      var key = 'jobTrackerDigest_' + today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
      if (localStorage.getItem(key)) steps[5].completed = true;
      if (localStorage.getItem('jobTrackerStatus')) {
        var s = JSON.parse(localStorage.getItem('jobTrackerStatus') || '{}');
        if (Object.keys(s).length > 0) steps[6].completed = true;
      }
      if (typeof allTestsPassed === 'function' && allTestsPassed()) steps[7].completed = true;
    } catch (e) {}
    return steps;
  }

  function buildSubmissionText() {
    var p = getProof();
    return [
      '------------------------------------------',
      'Job Notification Tracker — Final Submission',
      '------------------------------------------',
      '',
      'Lovable Project:',
      p.lovableLink || '(not provided)',
      '',
      'GitHub Repository:',
      p.githubLink || '(not provided)',
      '',
      'Live Deployment:',
      p.deployedUrl || '(not provided)',
      '',
      'Core Features:',
      '- Intelligent match scoring',
      '- Daily digest simulation',
      '- Status tracking',
      '- Test checklist enforced',
      '------------------------------------------'
    ].join('\n');
  }

  global.isValidUrl = isValidUrl;
  global.getProof = getProof;
  global.setProof = setProof;
  global.allProofLinksProvided = allProofLinksProvided;
  global.getShipStatus = getShipStatus;
  global.getStepCompletion = getStepCompletion;
  global.buildSubmissionText = buildSubmissionText;
})(typeof window !== 'undefined' ? window : this);
