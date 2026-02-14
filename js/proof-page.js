/**
 * Job Notification Tracker — Proof page: steps, artifact inputs, validation, copy submission
 */

(function () {
  function renderSteps() {
    var listEl = document.getElementById('proof-steps');
    if (!listEl || typeof getStepCompletion !== 'function') return;
    var steps = getStepCompletion();
    listEl.innerHTML = '';
    steps.forEach(function (s) {
      var li = document.createElement('li');
      li.className = 'kn-proof-step';
      li.innerHTML = '<span class="kn-proof-step__status">' + (s.completed ? 'Completed' : 'Pending') + '</span> ' + (s.label || '');
      listEl.appendChild(li);
    });
  }

  function updateStatusBadge() {
    var badge = document.getElementById('proof-status-badge');
    if (!badge || typeof getShipStatus !== 'function') return;
    var status = getShipStatus();
    badge.textContent = status;
    badge.className = 'kn-proof-status-badge';
    if (status === 'Shipped') badge.classList.add('kn-proof-status--shipped');
    else if (status === 'In Progress') badge.classList.add('kn-proof-status--progress');
    else badge.classList.add('kn-proof-status--not-started');
  }

  function run() {
    var form = document.getElementById('proof-form');
    var lovableInput = document.getElementById('proof-lovable');
    var githubInput = document.getElementById('proof-github');
    var deployedInput = document.getElementById('proof-deployed');
    var copyBtn = document.getElementById('proof-copy-submission');

    if (typeof getProof === 'function') {
      var p = getProof();
      if (lovableInput) lovableInput.value = p.lovableLink || '';
      if (githubInput) githubInput.value = p.githubLink || '';
      if (deployedInput) deployedInput.value = p.deployedUrl || '';
    }

    function validateAndSave(inputId, errorId, key) {
      var input = document.getElementById(inputId);
      var err = document.getElementById(errorId);
      if (!input || !err) return;
      var val = input.value.trim();
      if (val && !(typeof isValidUrl === 'function' && isValidUrl(val))) {
        err.hidden = false;
        return false;
      }
      err.hidden = true;
      if (typeof setProof === 'function') {
        var o = {};
        o[key] = val;
        setProof(o);
      }
      return true;
    }

    function blurHandler(inputId, errorId, key) {
      validateAndSave(inputId, errorId, key);
      updateStatusBadge();
    }

    function saveAllInputs() {
      if (typeof setProof !== 'function') return;
      setProof({
        lovableLink: lovableInput ? lovableInput.value.trim() : '',
        githubLink: githubInput ? githubInput.value.trim() : '',
        deployedUrl: deployedInput ? deployedInput.value.trim() : ''
      });
      updateStatusBadge();
    }

    if (lovableInput) {
      lovableInput.addEventListener('blur', function () { blurHandler('proof-lovable', 'proof-lovable-error', 'lovableLink'); });
      lovableInput.addEventListener('input', saveAllInputs);
    }
    if (githubInput) {
      githubInput.addEventListener('blur', function () { blurHandler('proof-github', 'proof-github-error', 'githubLink'); });
      githubInput.addEventListener('input', saveAllInputs);
    }
    if (deployedInput) {
      deployedInput.addEventListener('blur', function () { blurHandler('proof-deployed', 'proof-deployed-error', 'deployedUrl'); });
      deployedInput.addEventListener('input', saveAllInputs);
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = true;
        if (lovableInput && lovableInput.value.trim()) ok = validateAndSave('proof-lovable', 'proof-lovable-error', 'lovableLink') && ok;
        if (githubInput && githubInput.value.trim()) ok = validateAndSave('proof-github', 'proof-github-error', 'githubLink') && ok;
        if (deployedInput && deployedInput.value.trim()) ok = validateAndSave('proof-deployed', 'proof-deployed-error', 'deployedUrl') && ok;
        if (ok && typeof setProof === 'function') {
          setProof({
            lovableLink: lovableInput ? lovableInput.value.trim() : '',
            githubLink: githubInput ? githubInput.value.trim() : '',
            deployedUrl: deployedInput ? deployedInput.value.trim() : ''
          });
        }
        updateStatusBadge();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var lovableVal = lovableInput ? lovableInput.value.trim() : '';
        var githubVal = githubInput ? githubInput.value.trim() : '';
        var deployedVal = deployedInput ? deployedInput.value.trim() : '';
        if (typeof setProof === 'function') {
          setProof({
            lovableLink: lovableVal,
            githubLink: githubVal,
            deployedUrl: deployedVal
          });
        }
        var text = typeof buildSubmissionText === 'function' ? buildSubmissionText() : '';
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = 'Copied';
          setTimeout(function () { copyBtn.textContent = 'Copy Final Submission'; }, 1500);
        }).catch(function () {});
      });
    }

    renderSteps();
    updateStatusBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
