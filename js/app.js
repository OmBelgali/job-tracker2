/**
 * Job Notification Tracker — App shell
 * Hamburger menu toggle only.
 */

(function () {
  var header = document.querySelector('.kn-app-header');
  var toggle = document.querySelector('.kn-app-nav-toggle');
  if (!header || !toggle) return;

  toggle.addEventListener('click', function () {
    var open = header.getAttribute('data-nav-open');
    var isOpen = !open;
    header.setAttribute('data-nav-open', isOpen ? 'true' : '');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });
})();
