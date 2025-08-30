function updateVariantOverlayLines() {
  document.querySelectorAll('.variant-out-of-stock-overlay').forEach(function(overlay) {
    if (overlay.dataset.processed === 'true') return;

    overlay.querySelectorAll('svg').forEach(svg => svg.remove());

    const width = overlay.offsetWidth;
    const height = overlay.offsetHeight;
    if (width === 0 || height === 0) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;');
    const offset = 1; // px
    const length = Math.sqrt(width * width + height * height);
    const dx = offset * (height / length);
    const dy = offset * (width / length);
    svg.innerHTML = `
      <line x1="${offset}" y1="${offset}" x2="${width - offset}" y2="${height - offset}" stroke="rgba(0,0,0,0.20)" stroke-width="1px" />
      <line x1="${dx}" y1="${-dy}" x2="${width + dx}" y2="${height - dy}" stroke="#F9F5F4" stroke-width="1px" />
    `;

    overlay.appendChild(svg);
    overlay.dataset.processed = 'true';
  });
}

window.addEventListener('DOMContentLoaded', () => {
  updateVariantOverlayLines();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        setTimeout(updateVariantOverlayLines, 100);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

window.addEventListener('resize', updateVariantOverlayLines);
