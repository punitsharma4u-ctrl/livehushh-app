/* ───────────────────────────────────────────────────
   LiveHushh Theme Toggle  — Light (default) ↔ Dark
   Preference stored in localStorage as 'lh_theme'.
   Light = body.theme-light class present (default)
   Dark  = body.theme-light class absent  (CSS :root)
─────────────────────────────────────────────────── */
(function () {
  var KEY = 'lh_theme';
  var LABELS = { light: '🌙 Dark Mode', dark: '☀️ Light Mode' };

  function applyTheme(t) {
    document.body.classList.toggle('theme-light', t !== 'dark');
    localStorage.setItem(KEY, t);
    var btn = document.getElementById('lh-theme-btn');
    if (btn) btn.textContent = LABELS[t] || LABELS.light;
  }

  /* Apply as early as possible — before first paint */
  var saved = localStorage.getItem(KEY) || 'light';
  if (document.body) {
    applyTheme(saved);
  }
  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(localStorage.getItem(KEY) || 'light');
    injectButton();
  });

  function injectButton() {
    var current = localStorage.getItem(KEY) || 'light';
    var btn = document.createElement('button');
    btn.id = 'lh-theme-btn';
    btn.textContent = LABELS[current] || LABELS.light;
    btn.title = 'Switch colour theme';
    btn.style.cssText = [
      'position:fixed',
      'bottom:24px',
      'right:24px',
      'z-index:99999',
      'background:rgba(124,58,237,0.1)',
      'border:1.5px solid rgba(124,58,237,0.25)',
      'color:#7C3AED',
      'padding:9px 20px',
      'border-radius:99px',
      'font-size:.78rem',
      'font-weight:600',
      'cursor:pointer',
      'transition:background .18s,transform .15s,box-shadow .18s',
      'font-family:Inter,system-ui,sans-serif',
      'letter-spacing:.03em',
      'box-shadow:0 2px 12px rgba(124,58,237,0.15)',
      'user-select:none',
      'white-space:nowrap'
    ].join(';');

    btn.addEventListener('mouseenter', function () {
      this.style.background = 'rgba(124,58,237,0.18)';
      this.style.transform   = 'translateY(-2px)';
      this.style.boxShadow   = '0 6px 20px rgba(124,58,237,0.25)';
    });
    btn.addEventListener('mouseleave', function () {
      this.style.background = 'rgba(124,58,237,0.1)';
      this.style.transform   = '';
      this.style.boxShadow   = '0 2px 12px rgba(124,58,237,0.15)';
    });
    btn.addEventListener('click', function () {
      var cur = localStorage.getItem(KEY) || 'light';
      applyTheme(cur === 'light' ? 'dark' : 'light');
    });

    document.body.appendChild(btn);
  }
})();
