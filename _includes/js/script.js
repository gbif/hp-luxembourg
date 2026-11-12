// Add an external-link icon to anchors that lead to another domain.
// The navbar marks its external entries during the Jekyll build (see _includes/navbar.html);
// this script covers the remaining generated content (footer, markdown, feature cards).
// Links inside the GBIF widgets (.gbif) and links that are already icon/image-only are skipped.
(function () {
  function isExternal(el) {
    return el.protocol === 'http:' || el.protocol === 'https:';
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href^="http"]').forEach(function (el) {
      if (!el.hostname || el.hostname === window.location.hostname) return; // internal or javascript-built
      if (el.closest('.gbif')) return; // widget-managed UI
      if (el.closest('#language-selector-menu')) return; // language menu
      if (el.querySelector('.navbar-external-icon')) return; // already marked (navbar)
      if (el.querySelector('img, .fa-stack, svg')) return; // logo / social / icon-only links
      if (!el.textContent.trim()) return; // icon-only links without text

      var icon = document.createElement('i');
      icon.className = 'fa fa-external-link navbar-external-icon';
      icon.setAttribute('aria-hidden', 'true');
      el.appendChild(icon);

      var srText = document.createElement('span');
      srText.className = 'is-sr-only';
      srText.textContent = ' (external link)';
      el.appendChild(srText);
    });
  });
})();
