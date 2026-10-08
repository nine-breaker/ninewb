function attachHoverInfo(selector, infoBoxId, defaultText) {
  const items = document.querySelectorAll(selector);
  const infoBox = document.getElementById(infoBoxId);
  if (!items.length || !infoBox) return;

  items.forEach(el => {
    el.addEventListener('mouseenter', () => {
      infoBox.textContent = el.dataset.hoverText || el.dataset.title || 'Unknown';
    });
    el.addEventListener('mouseleave', () => {
      infoBox.textContent = defaultText;
    });
  });
}

// library
function attachHoverInfoDelegated(selector, infoBoxId, defaultText) {
  const infoBox = document.getElementById(infoBoxId);
  if (!infoBox) return;

  function restore() {
    const active = document.querySelector(`${selector}.active`);
    infoBox.textContent =
      active?.dataset.hoverText || active?.dataset.title || defaultText || "";
  }

  document.addEventListener('mouseover', e => {
    const el = e.target.closest(selector);
    if (!el) return;
    infoBox.textContent = el.dataset.hoverText || el.dataset.title || 'Unknown';
  });

  document.addEventListener('mouseout', e => {
    const el = e.target.closest(selector);
    if (!el || el.contains(e.relatedTarget)) return;
    restore();
  });
}

attachHoverInfo('.music-h', 'mh-info');
attachHoverInfo('.game-h', 'gh-info');
attachHoverInfo('.misc-h', 'msch-info');