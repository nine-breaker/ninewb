(() => {
  const panel = document.getElementById('panel');
  const frame = document.getElementById('panel-frame');
  const isOpen = (src) => panel.classList.contains('open') && frame.getAttribute('src') === src;

  function openPanel(src, title, height) {
    if (frame.getAttribute('src') !== src) frame.src = src;
    frame.title = title;
    if (height) panel.style.setProperty('--panel-h', height);
    else panel.style.removeProperty('--panel-h');
    panel.classList.add('open');
  }
  function closePanel() { panel.classList.remove('open'); }

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const btn = e.target.closest('[data-panel]');
    if (!btn) return;
    const src = btn.dataset.panel || btn.getAttribute('href');
    if (!src) return;
    e.preventDefault();
    if (isOpen(src)) closePanel();
    else openPanel(src, btn.dataset.title || btn.title || btn.textContent.trim() || 'panel', btn.dataset.height);
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
})();