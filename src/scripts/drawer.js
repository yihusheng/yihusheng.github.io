// ── 抽屉模块（drawer）──
// 底部导航抽屉渲染、打开/关闭控制

// ── 渲染抽屉导航列表 ──
(function renderDrawer() {
  var container = document.getElementById('drawerSections');
  if (!container) return;
  var items = window.WiseNavbarData || [];
  var seen = {};
  var filtered = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    if (item.href === '/' || item.href === '/index.html') continue;
    if (seen[item.href]) continue;
    seen[item.href] = true;
    filtered.push(item);
  }
  var html = '';
  for (var i = 0; i < filtered.length; i++) {
    var it = filtered[i];
    html += '<a class="drawer-row" href="' + it.href + '">' +
      '<div class="drawer-row-icon"><span class="material-symbols-rounded">' + it.icon + '</span></div>' +
      '<div class="drawer-row-info">' +
        '<div class="drawer-row-label">' + it.label + '</div>' +
        '<div class="drawer-row-hint">' + it.href + '</div>' +
      '</div>' +
      '<div class="drawer-row-arrow"><span class="material-symbols-rounded">chevron_right</span></div>' +
    '</a>';
  }
  container.innerHTML = html;
})();

// ── 切换抽屉打开/关闭 ──
export function toggleDrawer() {
  document.getElementById('drawer').classList.toggle('open');
}

// ── 顶部把手点击 ──
document.querySelector('.nav-handle-area').addEventListener('click', toggleDrawer);

// ── 点击非抽屉区域关闭抽屉 ──
document.getElementById('app').addEventListener('click', function(e) {
  var drawer = document.getElementById('drawer');
  if (drawer.classList.contains('open') && !drawer.contains(e.target)) {
    drawer.classList.remove('open');
  }
});
