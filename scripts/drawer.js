// ── 抽屉模块（drawer）──
// 底部导航抽屉渲染、打开/关闭控制

import { t, setLang, getLang } from './i18n.js';
import { CookieUtils } from './utils.js';

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
        '<div class="drawer-row-label" data-i18n="' + (it.label === '工具' ? '工具' : it.label) + '">' + it.label + '</div>' +
        '<div class="drawer-row-hint">' + it.href + '</div>' +
      '</div>' +
      '<div class="drawer-row-arrow"><span class="material-symbols-rounded">chevron_right</span></div>' +
    '</a>';
  }
  // 主题 + 语言 + 位置 + 快捷键提示
  html += '<div class="drawer-sections" style="padding:12px 0 8px;border-top:1px solid var(--md-sys-color-outline);opacity:0.7;margin-top:8px;">';

  // 快捷键提示
  html += '<div class="drawer-row" style="cursor:default;opacity:0.6;font-size:0.75rem;">' +
    '<span class="material-symbols-rounded" style="font-size:1rem;opacity:0.5;">keyboard</span>' +
    '<span data-i18n="空格: 播放/暂停  ← → : 切换歌曲">' + t('空格: 播放/暂停  ← → : 切换歌曲') + '</span>' +
  '</div>';

  // 主题切换
  html += '<div class="drawer-row" id="themeToggle" style="cursor:pointer;">' +
    '<div class="drawer-row-icon"><span class="material-symbols-rounded">dark_mode</span></div>' +
    '<div class="drawer-row-info"><div class="drawer-row-label" data-i18n="主题">' + t('主题') + '</div></div>' +
    '<span id="themeLabel" style="font-size:0.75rem;color:var(--md-sys-color-on-surface-variant);">' +
      (document.documentElement.getAttribute('data-theme') === 'dark' ? t('深色') : t('浅色')) + '</span>' +
  '</div>';

  // 语言切换
  html += '<div class="drawer-row" id="langToggle" style="cursor:pointer;">' +
    '<div class="drawer-row-icon"><span class="material-symbols-rounded">language</span></div>' +
    '<div class="drawer-row-info"><div class="drawer-row-label">' + (getLang() === 'en' ? 'Language' : '语言') + '</div></div>' +
    '<span id="langLabel" style="font-size:0.75rem;color:var(--md-sys-color-on-surface-variant);">' + (getLang() === 'en' ? 'English' : '中文') + '</span>' +
  '</div>';

  // 位置设置
  var currentLoc = document.getElementById('locationDisplay')?.textContent || t('定位中...');
  html += '<div class="drawer-row" id="locToggle" style="cursor:pointer;">' +
    '<div class="drawer-row-icon"><span class="material-symbols-rounded">my_location</span></div>' +
    '<div class="drawer-row-info"><div class="drawer-row-label" data-i18n="位置">' + t('位置') + '</div></div>' +
    '<span id="locLabel" style="font-size:0.75rem;color:var(--md-sys-color-on-surface-variant);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + currentLoc + '</span>' +
  '</div>';

  html += '</div>';
  container.innerHTML = html;

  // 主题切换事件
  document.getElementById('themeToggle')?.addEventListener('click', function() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? '' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { CookieUtils.set('theme', next || 'light', 365); } catch(e) {}
    document.getElementById('themeLabel').textContent = next === 'dark' ? t('深色') : t('浅色');
  });

  // 语言切换事件
  document.getElementById('langToggle')?.addEventListener('click', function() {
    var next = getLang() === 'en' ? 'zh' : 'en';
    setLang(next);
    document.getElementById('langLabel').textContent = next === 'en' ? 'English' : '中文';
    document.getElementById('themeLabel').textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? t('深色') : t('浅色');
    // 更新位置行文字
    var locLabel = document.getElementById('locLabel');
    if (locLabel) locLabel.textContent = document.getElementById('locationDisplay')?.textContent || t('定位中...');
  });

  // 位置切换事件：清除缓存 → GPS 重新定位 → 刷新天气
  document.getElementById('locToggle')?.addEventListener('click', async function() {
    var locLabel = document.getElementById('locLabel');
    if (!locLabel) return;
    locLabel.textContent = t('定位中...');
    CookieUtils.remove('weather_lat');
    CookieUtils.remove('weather_lon');
    try {
      var { fetchWeather } = await import('./weather.js');
      await fetchWeather();
    } catch(e) {
      console.error('位置刷新失败', e);
    }
    locLabel.textContent = document.getElementById('locationDisplay')?.textContent || t('位置获取失败');
  });
})();

// ── 切换抽屉打开/关闭 ──
export function toggleDrawer() {
  document.getElementById('drawer').classList.toggle('open');
}

document.querySelector('.nav-handle-area').addEventListener('click', toggleDrawer);

document.getElementById('app').addEventListener('click', function(e) {
  var drawer = document.getElementById('drawer');
  if (drawer.classList.contains('open') && !drawer.contains(e.target)) {
    drawer.classList.remove('open');
  }
});
