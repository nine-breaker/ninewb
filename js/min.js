(() => {
  const panel = document.getElementById('panel');
  const frame = document.getElementById('panel-frame');
  const HOME  = '/coffin/panels/dex.html';
  const FADE  = 250;

  function show(src, title, height) {
    if (height) panel.style.setProperty('--panel-h', height);
    else panel.style.removeProperty('--panel-h');
    if (frame.getAttribute('src') === src) return;
    frame.classList.add('swap');                       // fade out
    setTimeout(() => { frame.src = src; frame.title = title; }, FADE);
  }

  // fade back in
  frame.addEventListener('load', () => frame.classList.remove('swap'));

  window.addEventListener('message', (e) => {
  if (e.source === frame.contentWindow && e.data === 'panel-fade') frame.classList.add('swap');
  });

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const btn = e.target.closest('[data-panel]');
    if (!btn) return;
    const src = btn.dataset.panel || btn.getAttribute('href');
    if (!src) return;
    e.preventDefault();
    const abs = new URL(src, location.href).pathname;
    // clicking the active button again returns to home
    if (frame.getAttribute('src') === abs) show(HOME, 'panel');
    else show(abs, btn.dataset.title || btn.title || btn.textContent.trim() || 'panel', btn.dataset.height);
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') show(HOME, 'panel'); });

  window.panelShow = show; // for terminal commands
})();