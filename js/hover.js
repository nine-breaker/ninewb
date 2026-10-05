function attachHoverInfo(selector, infoBoxId, defaultText) {
  const items = document.querySelectorAll(selector);
  const infoBox = document.getElementById(infoBoxId);
  if (!items.length || !infoBox) return;

  items.forEach(el => {
    el.addEventListener('mouseenter', () => {
      // reads any data-* attribute present on the element
      const text = el.dataset.hoverText || el.dataset.title || 'Unknown';
      infoBox.textContent = text;
    });

    el.addEventListener('mouseleave', () => {
      infoBox.textContent = defaultText;
    });
  });
}

attachHoverInfo('.music-h', 'mh-info');
attachHoverInfo('.game-h', 'gh-info');
attachHoverInfo('.misc-h', 'msch-info');