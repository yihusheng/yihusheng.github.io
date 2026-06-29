(function renderDrawer() {
  const container = document.getElementById('drawerSections');
  if (!container) return;
  const items = window.WiseNavbarData || [];
  const seen = new Set();
  const filtered = items.filter(item => {
    if (item.href === '/' || item.href === '/index.html') return false;
    const key = item.href;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  container.innerHTML = filtered.map((item, i) => `
    <a class="drawer-row" href="${item.href}">
      <div class="drawer-row-icon"><span class="material-symbols-rounded">${item.icon}</span></div>
      <div class="drawer-row-info">
        <div class="drawer-row-label">${item.label}</div>
        <div class="drawer-row-hint">${item.href}</div>
      </div>
      <div class="drawer-row-arrow"><span class="material-symbols-rounded">chevron_right</span></div>
    </a>
  `).join('');
})();

