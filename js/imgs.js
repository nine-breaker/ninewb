(() => {
  document.addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img) return;
    if (img.closest('a, button, [data-panel], .no-open')) return; 
    window.open(img.currentSrc || img.src, '_blank', 'noopener');
  });
})();