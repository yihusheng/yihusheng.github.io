// ── 基础 UI 立即初始化（不等待音乐列表）──
updateTime(); setInterval(updateTime, 1e3);
fetchWeather(); setInterval(fetchWeather, 6e5);
loadBingWallpaper(); window.addEventListener('resize', function(){ if (window.innerWidth >= 768) loadBingWallpaper(); });
updateThemeColor();

// ── 灵动岛点击（防 touchstart+click 双击）──
var _islandFromTouch = false;
island.addEventListener('touchstart', function(e) {
  if (e.touches.length === 1) {
    _islandFromTouch = true;
    toggleIsland();
  }
});
island.addEventListener('click', function() {
  if (_islandFromTouch) { _islandFromTouch = false; return; }
  toggleIsland();
});

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

// ── 音乐列表后台加载（不阻塞 UI）──
loadMusicList();
