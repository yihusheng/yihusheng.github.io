// ── 灵动岛模块（island）──
// 所有灵动岛相关的 UI 控制、事件绑定和初始化
import { state } from './state.js';
import { toggleLyrics } from './player.js';

// ── 状态 ──
var _islandFromTouch = false;

// ── 切换天气详情抽屉 ──
export function toggleWeatherDetail() {
  var island = document.getElementById('island');
  island.classList.toggle('weather-detailed');
  var icon = document.getElementById('weatherMoreIcon');
  if (icon) icon.textContent = island.classList.contains('weather-detailed') ? 'expand_less' : 'expand_more';
}

// ── 展开/折叠灵动岛 ──
export function toggleIsland() {
  var island = document.getElementById('island');
  if (island.classList.contains('music-mode')) {
    toggleLyrics();
    island.classList.remove('weather-detailed');
    island.classList.remove('active');
    var wi = document.getElementById('weatherMoreIcon');
    if (wi) wi.textContent = 'expand_more';
    return;
  }
  island.classList.toggle('active');
  if (!island.classList.contains('active')) island.classList.remove('weather-detailed');
  var icon = document.getElementById('weatherMoreIcon');
  if (icon) icon.textContent = 'expand_more';
}

// ── 初始化灵动岛事件绑定 ──
export function initIsland() {
  var island = document.getElementById('island');
  if (!island) return;

  island.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1 && !island.classList.contains('active') && !island.classList.contains('music-mode')) {
      _islandFromTouch = true;
      toggleIsland();
    }
  });

  island.addEventListener('click', function() {
    if (_islandFromTouch) { _islandFromTouch = false; return; }
    if (!island.classList.contains('active') && !island.classList.contains('music-mode')) toggleIsland();
  });

  var weatherMoreBtn = document.getElementById('weatherMoreBtn');
  if (weatherMoreBtn) {
    weatherMoreBtn.addEventListener('click', function(e) { e.stopPropagation(); toggleWeatherDetail(); });
    weatherMoreBtn.addEventListener('touchstart', function(e) { e.stopPropagation(); });
  }
  var weatherMoreHint = document.getElementById('weatherMoreHint');
  if (weatherMoreHint) {
    weatherMoreHint.addEventListener('click', function(e) { e.stopPropagation(); toggleWeatherDetail(); });
  }

  // 天气详情内部所有点击不冒泡（防止穿透到外部收起逻辑）
  var weatherDetail = document.querySelector('.island-weather-detail');
  if (weatherDetail) {
    weatherDetail.addEventListener('click', function(e) { e.stopPropagation(); });
    weatherDetail.addEventListener('touchstart', function(e) { e.stopPropagation(); });
  }

  document.getElementById('app').addEventListener('click', function(e) {
    if (island.contains(e.target)) return;
    if (e.target.closest('.player-content')) return;
    if (island.classList.contains('music-mode')) {
      if (state.lyricsVisible) toggleLyrics();
    } else if (island.classList.contains('weather-detailed') || island.classList.contains('active')) {
      island.classList.remove('weather-detailed');
      var wi = document.getElementById('weatherMoreIcon');
      if (wi) wi.textContent = 'expand_more';
      island.classList.remove('active');
    }
  });
}
