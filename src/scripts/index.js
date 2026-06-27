// Main Entry

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

// ── Web Worker 并行处理 ──
  console.log('%c╚══════════════════════════════════╝', 'font-weight:bold');
}
setTimeout(logBench, 15000);

var app = document.getElementById('app');
var island = document.getElementById('island');
var themeColorMeta = document.querySelector('meta[name="theme-color"]');


function toggleIsland(){
  if(island.classList.contains('music-mode')){toggleLyrics();return;}
  island.classList.toggle('active');
  if(!island.classList.contains('active')) island.classList.remove('weather-detailed');
  // 收起时重置箭头
  var icon=document.getElementById('weatherMoreIcon');
  if(icon) icon.textContent='expand_more';
}

function toggleDrawer(){ document.getElementById('drawer').classList.toggle('open'); }
document.addEventListener('keydown', function(e){
  if (e.key === ' ') { e.preventDefault(); if (currentHowl) currentHowl.playing() ? pauseSong() : playSong(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); document.getElementById('prevBtn').click(); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); document.getElementById('nextBtn').click(); }
});

async function loadBingWallpaper(){
  if (window.innerWidth < 768) return;
  try {
    var r = await fetch('https://bing.biturl.top/?resolution=1920&format=json&index=0&mkt=zh-CN');
    var d = await r.json();
    if (d.url) {
      var u = d.url;
      var img = new Image();
      img.onload = function() { document.body.style.backgroundImage = 'url(' + u + ')'; };
      img.src = u;
    }
    if (d.copyright) {
      showWallpaperInfo(d.copyright, d.copyright_link || 'https://www.bing.com');
    }
  } catch(e) {}
}

function showWallpaperInfo(text, linkUrl) {
  var el = document.getElementById('wallpaperInfo');
  if (!el) {
    el = document.createElement('div');
    el.id = 'wallpaperInfo';
    el.className = 'wallpaper-info';
    document.body.appendChild(el);
  }
  var desc = text.replace(/\s*\(.*?\)\s*$/, '').trim() || text;
  var credit = text.match(/\(([^)]+)\)/);
  var creditText = credit ? credit[0] : '';
  el.innerHTML = '<span class="wallpaper-desc">' + desc + '</span> <span class="wallpaper-credit">' + creditText + '</span>';
  el.onclick = function() { window.open(linkUrl, '_blank'); };
  el.style.cursor = 'pointer';
}

});

function init(){
  updateTime(); setInterval(updateTime, 1e3);
  fetchWeather(); setInterval(fetchWeather, 6e5);
  island.addEventListener('click', toggleIsland);
  loadBingWallpaper(); window.addEventListener('resize', function(){ if (window.innerWidth >= 768) loadBingWallpaper(); });
  updateThemeColor();

  // ── 点击非抽屉区域关闭抽屉 ──
  document.getElementById('app').addEventListener('click', function(e) {
    var drawer = document.getElementById('drawer');
    if (drawer.classList.contains('open') && !drawer.contains(e.target)) {
      drawer.classList.remove('open');
    }
  });

  // ── 天气详情展开/收起 ──
  document.getElementById('weatherMoreBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    toggleWeatherDetail();
  });

  // ── 点击非灵动岛区域收回灵动岛（含天气详情）──
  // 注意：.player-content 已有自己的 click → toggleLyrics()，不要重复触发
  document.getElementById('app').addEventListener('click', function(e) {
    if (island.contains(e.target)) return;
    if (e.target.closest('.player-content')) return;
    if (island.classList.contains('music-mode')) {
      if (lyricsVisible) toggleLyrics();
    } else if (island.classList.contains('weather-detailed') || island.classList.contains('active')) {
      island.classList.remove('weather-detailed'); var wi=document.getElementById('weatherMoreIcon'); if(wi) wi.textContent='expand_more';
      island.classList.remove('active');
    }
  });
}

loadMusicList().then(init);