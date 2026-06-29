function init(){
  updateTime(); setInterval(updateTime, 1e3);
  fetchWeather(); setInterval(fetchWeather, 6e5);
  island.addEventListener('click', toggleIsland); island.addEventListener('touchstart', function(e){if(e.touches.length===1){e.preventDefault();toggleIsland();}});
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
