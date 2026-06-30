// ── 播放器模块（player）──
import { state } from './state.js';
import { wPost, bench, CoverDB, LyricsDB, preloadAudio, preloadAdjacent, ColorUtils, CookieUtils } from './utils.js';
import { updateThemeColor } from './weather.js';

const app = document.getElementById('app');

// ── Cookie 持久化播放状态 ──
function savePlayerState() {
  // 只在用户交互后保存状态
  if (state.currentSongIndex == null || isNaN(state.currentSongIndex)) return;
  var val = JSON.stringify({
    i: state.currentSongIndex,
    s: state.isShuffle ? 1 : 0,
    r: state.isRepeat ? 1 : 0
  });
  CookieUtils.set('player', val, 365);
  console.log('[Save]', val);
}

// ── Cookie 持久化播放状态 ──

// ── 播放器内部函数 ──

function getRandomIndex() {
  if (state.songs.length <= 1) return 0;
  var idx;
  do { idx = Math.floor(Math.random() * state.songs.length); }
  while (idx === state.currentSongIndex);
  return idx;
}

export async function loadMusicList() {
  // 读取单 Cookie 恢复状态
  try {
    var saved = JSON.parse(CookieUtils.get('player') || '{}');
    if (typeof saved.i === 'number' && !isNaN(saved.i)) {
      state.currentSongIndex = saved.i;
      state.isShuffle = saved.s === 1;
      state.isRepeat = saved.r === 1;
    }
  } catch(e) {}

  // 立即同步按钮状态，不等歌单加载
  document.getElementById('shuffleBtn').classList.toggle('active', state.isShuffle);

  var loadFromR2 = function() {
    return fetch('/public/music/music_list.json?' + Date.now(), { signal: AbortSignal.timeout(5000) })
      .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function(data) {
        if (data && data.length > 0) { state.songs = data; return true; }
        return false;
      });
  };

  var loadFromPages = function() {
    return fetch('/scripts/music_list.js?' + Date.now())
      .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function(text) {
        var start = text.indexOf('[');
        var end = text.lastIndexOf(']');
        state.songs = (start !== -1 && end !== -1 && end > start) ? JSON.parse(text.substring(start, end + 1)) : [];
        return state.songs.length > 0;
      });
  };

  try {
    // Try R2 first (fast, no deploy needed)
    var ok = await loadFromR2();
    if (!ok) await loadFromPages();
    console.log('🎵 已加载 ' + state.songs.length + ' 首歌曲' + (ok ? ' (R2)' : ' (Pages)'));
  } catch (e) {
    console.error('❌ 加载音乐列表失败:', e);
    try { await loadFromPages(); } catch(e2) {
      state.songs = [];
      showToast('音乐列表加载失败，请刷新重试');
    }
  }
  if (state.songs.length === 0) {
    state.songs = [{ title: '暂无歌曲', artist: '请添加 .mp3 文件到 public/music 目录', cover: '', src: '' }];
  }
  // 恢复歌曲
  if (state.songs[state.currentSongIndex]) {
    loadSong(state.songs[state.currentSongIndex]);
  } else {
    state.currentSongIndex = Math.floor(Math.random() * state.songs.length);
    loadSong(state.songs[state.currentSongIndex]);
  }
}

function loadEmbeddedCover(mp3Url, callback) {
  if (typeof jsmediatags === 'undefined') { callback(null); return; }
  CoverDB.get(mp3Url).then(function(cached) {
    if (cached) { callback(cached); return; }
    fetch(mp3Url, { method: 'HEAD' }).then(function(r) {
      var size = parseInt(r.headers.get('Content-Length') || '0', 10);
      if (size > 3 * 1024 * 1024) { callback(null); return; }
      readEmbeddedCover(mp3Url, callback);
    }).catch(function() { readEmbeddedCover(mp3Url, callback); });
  });
}
function readEmbeddedCover(mp3Url, callback) {
  try {
    jsmediatags.read(mp3Url, {
      onSuccess: function(tag) {
        var pic = tag.tags && tag.tags.picture;
        if (pic && pic.data) {
          var data = pic.data;
          var bytes = new Uint8Array(data);
          var binary = '';
          for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
          var url = 'data:' + (pic.format || 'image/jpeg') + ';base64,' + btoa(binary);
          CoverDB.set(mp3Url, url);
          callback(url);
        } else { callback(null); }
      },
      onError: function() { callback(null); }
    });
  } catch(e) { callback(null); }
}

function loadEmbeddedLyrics(audioUrl, callback) {
  if (typeof jsmediatags === 'undefined') { callback(null); return; }
  LyricsDB.get(audioUrl).then(function(cached) {
    if (cached) { callback(cached); return; }
    fetch(audioUrl, { method: 'HEAD' }).then(function(r) {
      var size = parseInt(r.headers.get('Content-Length') || '0', 10);
      if (size > 10 * 1024 * 1024) { callback(null, true); return; }
      readEmbeddedLyrics(audioUrl, callback);
    }).catch(function() { readEmbeddedLyrics(audioUrl, callback); });
  });
}
function readEmbeddedLyrics(audioUrl, callback) {
  try {
    jsmediatags.read(audioUrl, {
      onSuccess: function(tag) {
        var tags = tag.tags || {};
        var lrcText = tags.lyrics || tags.USLT || null;
        if (lrcText && typeof lrcText === 'string' && lrcText.trim()) {
          LyricsDB.set(audioUrl, lrcText); callback(lrcText);
        } else if (tags.lyrics) {
          var joined = '';
          for (var i = 0; i < tags.lyrics.length; i++) {
            var l = tags.lyrics[i];
            joined += (typeof l === 'string' ? l : l.text || '') + '\n';
          }
          if (joined.trim()) { LyricsDB.set(audioUrl, joined); callback(joined); }
          else callback(null);
        } else { callback(null); }
      },
      onError: function() { callback(null); }
    });
  } catch(e) { callback(null); }
}

export function playSong(){ if (!state.currentHowl) return; state.currentHowl.play(); savePlayerState(); }
export function pauseSong(){ if (!state.currentHowl) return; state.currentHowl.pause(); savePlayerState(); }
document.getElementById('playBtn').addEventListener('click',function(){ if (!state.currentHowl) return; state.currentHowl.playing() ? pauseSong() : playSong(); });

export function toggleShuffle() {
  state.isShuffle = !state.isShuffle;
  document.getElementById('shuffleBtn').classList.toggle('active', state.isShuffle);
  savePlayerState();
}
document.getElementById('shuffleBtn').addEventListener('click', toggleShuffle);
document.getElementById('playlistBtn').addEventListener('click', openPlaylist);

function getNextIndex() { if (state.isRepeat) return state.currentSongIndex; return state.isShuffle ? getRandomIndex() : (state.currentSongIndex + 1) % state.songs.length; }
function getPrevIndex() { if (state.isRepeat) return state.currentSongIndex; if (state.isShuffle) return getRandomIndex(); return (state.currentSongIndex - 1 + state.songs.length) % state.songs.length; }

document.getElementById('nextBtn').addEventListener('click', function(){ if(!state.songs.length) return; state.currentSongIndex = getNextIndex(); loadSong(state.songs[state.currentSongIndex]); playSong(); savePlayerState(); });
document.getElementById('prevBtn').addEventListener('click', function(){ if(!state.songs.length) return; state.currentSongIndex = getPrevIndex(); loadSong(state.songs[state.currentSongIndex]); playSong(); savePlayerState(); });

function parseLRC(lrcText) {
  var lines = lrcText.split('\n');
  var result = [];
  var timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var match;
    timeRegex.lastIndex = 0;
    var times = [];
    while ((match = timeRegex.exec(line)) !== null) {
      var mins = parseInt(match[1], 10);
      var secs = parseInt(match[2], 10);
      var ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
      times.push(mins * 60 + secs + ms / 1000);
    }
    var text = line.replace(/\[.*?\]/g, '').trim();
    if (text) { for (var j = 0; j < times.length; j++) result.push({ time: times[j], text: text }); }
  }
  result.sort(function(a, b) { return a.time - b.time; });
  return result;
}

function loadLyrics(lrcUrl, callback) {
  if (!lrcUrl) { callback(null); return; }
  console.log('📝 加载歌词:', lrcUrl);
  fetch(lrcUrl, { cache: 'no-cache' })
    .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(function(text) {
      console.log('✅ 歌词加载成功 (' + text.length + ' 字符)');
      var t0 = performance.now();
      wPost('parseLRC', { text: text }, function(m) {
        bench('worker-lrc', performance.now() - t0);
        if (m.data) callback(m.data); else callback(null);
      });
    })
    .catch(function(err) { console.error('❌ 歌词加载失败:', lrcUrl, err.message || err); callback(null); });
}

function renderLyrics() {
  var container = document.getElementById('lyricsContent');
  if (!state.lyricsData || state.lyricsData.length === 0) { container.innerHTML = '<div class="lyrics-empty">暂无歌词</div>'; return; }
  var html = '';
  for (var i = 0; i < state.lyricsData.length; i++) {
    html += '<div class="lyric-line" data-index="' + i + '"><span class="lyric-text">' + state.lyricsData[i].text + '</span></div>';
  }
  container.innerHTML = html;
  var lines = container.querySelectorAll('.lyric-line');
  for (var i = 0; i < lines.length; i++) {
    lines[i].addEventListener('click', function(e) {
      if (e.target.classList.contains('lyric-text')) {
        var idx = parseInt(this.dataset.index, 10);
        if (state.currentHowl && state.lyricsData[idx] && !isNaN(state.lyricsData[idx].time)) {
          state.currentHowl.seek(state.lyricsData[idx].time);
          if (!state.currentHowl.playing()) state.currentHowl.play();
        }
        e.stopPropagation();
      }
    });
  }
}

// ── 更新灵动岛音乐信息 ──
function updateIslandMusic() {
  var song = state.songs[state.currentSongIndex];
  if (!song) return;
  document.getElementById('islandMusicTitle').innerText = song.title || '';
  document.getElementById('islandMusicArtist').innerText = song.artist || '';
  var cover = document.getElementById('mainCover');
  document.getElementById('islandMusicCover').src = cover && cover.src ? cover.src : '';
}
// ── 主封面变更时同步到灵动岛 ──
function syncIslandCover() {
  var island = document.getElementById('island');
  if (!island.classList.contains('music-mode')) return;
  var mc = document.getElementById('mainCover');
  document.getElementById('islandMusicCover').src = mc && mc.src ? mc.src : '';
}

export function toggleLyrics() {
  state.lyricsVisible = !state.lyricsVisible;
  var lv = document.getElementById('lyricsView');
  var pb = document.querySelector('.player-background');
  var pc = document.querySelector('.player-content');
  var island = document.getElementById('island');
  if (state.lyricsVisible) {
    lv.classList.add('open');
    pb.style.opacity = '0';
    pc.style.background = 'var(--phone-screen-bg)';
    island.classList.add('music-mode');
    island.classList.remove('active');
    island.classList.remove('weather-detailed');
    updateIslandMusic();
    if (state.lyricsData.length > 0) {
      renderLyrics();
      updateLyricHighlight();
    } else if (state.currentSongLrcUrl) {
      document.getElementById('lyricsContent').innerHTML = '<div class="lyrics-empty">歌词加载中...</div>';
      var lid = ++state.lrcLoadId;
      loadLyrics(state.currentSongLrcUrl, function(data) {
        if (lid !== state.lrcLoadId) return;
        if (data && data.length > 0) { state.lyricsData = data; renderLyrics(); updateLyricHighlight(); }
        else { document.getElementById('lyricsContent').innerHTML = '<div class="lyrics-empty">暂无歌词</div>'; }
      });
    } else {
      document.getElementById('lyricsContent').innerHTML = '<div class="lyrics-empty">歌词加载中...</div>';
      var lid3 = ++state.lrcLoadId;
      loadEmbeddedLyrics(state.songs[state.currentSongIndex] && state.songs[state.currentSongIndex].src, function(lrcText, skipped) {
        if (lid3 !== state.lrcLoadId) return;
        if (lrcText) {
          wPost('parseLRC', { text: lrcText }, function(m) {
            if (lid3 !== state.lrcLoadId) return;
            if (m.data && m.data.length > 0) {
              state.lyricsData = m.data;
              renderLyrics();
              updateLyricHighlight();
            } else { document.getElementById('lyricsContent').innerHTML = '<div class="lyrics-empty">暂无歌词</div>'; }
          });
        } else if (skipped) {
          document.getElementById('lyricsContent').innerHTML = '<div class="lyrics-empty">音频文件较大，未读取内嵌歌词</div>';
        } else { document.getElementById('lyricsContent').innerHTML = '<div class="lyrics-empty">暂无歌词</div>'; }
      });
    }
  } else {
    lv.classList.remove('open');
    pb.style.opacity = '';
    pc.style.background = '';
    island.classList.remove('music-mode');
  }
}

function updateLyricHighlight() {
  if (!state.currentHowl || !state.lyricsVisible || !state.lyricsData || state.lyricsData.length === 0) return;
  var seek = state.currentHowl.seek() || 0;
  var newIndex = -1;
  for (var i = 0; i < state.lyricsData.length; i++) {
    if (state.lyricsData[i].time < 0) continue;
    if (state.lyricsData[i].time <= seek) newIndex = i; else break;
  }
  if (newIndex !== state.currentLyricIndex) {
    var items = document.querySelectorAll('.lyric-line');
    for (var i = 0; i < items.length; i++) items[i].classList.remove('active');
    if (newIndex >= 0 && items[newIndex]) { items[newIndex].classList.add('active'); items[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    state.currentLyricIndex = newIndex;
  }
}

export function loadSong(song){
  if (!song || !song.src) { console.warn('loadSong: 无效歌曲'); return; }
  if (!state.songs || state.songs.length === 0) { console.warn('loadSong: 歌曲列表为空'); return; }
  if (state.currentHowl) { state.currentHowl.unload(); state.currentHowl = null; }

  var songId = Date.now(); state.currentSongId = songId;
  document.getElementById('mainTitle').innerText = song.title;
  document.getElementById('mainArtist').innerText = song.artist;
  var mc = document.getElementById('mainCover');

  if (state.lyricsVisible) toggleLyrics();

  updateUI(0);
  app.classList.remove('playing');
  document.getElementById('playIcon').innerText = 'play_arrow';
  state.lyricsData = []; state.currentLyricIndex = -1;
  state.currentSongLrcUrl = song.lrc || null; state.lrcLoadId = 0;

  var fallback = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280"><rect fill="#e8ebe6" width="280" height="280"/><text x="140" y="155" font-size="64" text-anchor="middle" fill="#868685">\u266a</text></svg>');
  var _cv=song.cover;if(_cv&&_cv.indexOf('./')===0)_cv='/'+_cv.slice(2);mc.src=_cv||fallback;
  updateMediaSession(song.title, song.artist, mc.src, song.cover);

  CoverDB.get(song.src).then(function(cached) {
    if (songId !== state.currentSongId || !cached) return;
    if (mc.src !== cached) { mc.src = cached; updateMediaSession(song.title, song.artist, mc.src, song.cover); syncIslandCover(); }
    var t0 = performance.now();
    wPost('extractColor', { url: mc.src }, function(m) {
      bench('worker-color', performance.now() - t0);
      if (m.rgb) { var t = ColorUtils.generateTheme(m.rgb); for (var k in t) document.documentElement.style.setProperty(k, t[k]); updateThemeColor(); }
    });
  });

  loadEmbeddedCover(song.src, function(coverDataUrl) {
    if (songId !== state.currentSongId) return;
    if (coverDataUrl) {
      CoverDB.set(song.src, coverDataUrl);
      if (mc.src !== coverDataUrl) {
        mc.src = coverDataUrl;
        updateMediaSession(song.title, song.artist, mc.src, song.cover);
        syncIslandCover();
        var t0 = performance.now();
        wPost('extractColor', { url: coverDataUrl }, function(m) {
          bench('worker-color', performance.now() - t0);
          if (m.rgb) { var t = ColorUtils.generateTheme(m.rgb); for (var k in t) document.documentElement.style.setProperty(k, t[k]); updateThemeColor(); }
        });
      }
    } else if (song.cover && mc.src !== song.cover) {
      var _cv2=song.cover;if(_cv2&&_cv2.indexOf('./')===0)_cv2='/'+_cv2.slice(2);mc.src=_cv2;
      updateMediaSession(song.title, song.artist, mc.src, song.cover);
      syncIslandCover();
    }
  });

  document.getElementById('playIcon').innerText = 'hourglass_empty';
  document.getElementById('playBtn').style.opacity = '0.6';

  state.currentHowl = new Howl({
    src: [song.src], html5: true, preload: 'metadata',
    onload: function() {
      if (songId !== state.currentSongId) return;
      var dur = state.currentHowl.duration();
      document.getElementById('durTime').innerText = isNaN(dur) ? '0:00' : Math.floor(dur/60)+':'+String(Math.floor(dur%60)).padStart(2,'0');
      document.getElementById('playIcon').innerText = 'play_arrow';
      document.getElementById('playBtn').style.opacity = '';
      preloadAudio(state.currentSongIndex);
    },
    onplay: function() {
      if (songId !== state.currentSongId) return;
      app.classList.add('playing');
      document.getElementById('playIcon').innerText = 'pause';
      document.getElementById('playBtn').style.opacity = '';
      setPlaybackState('playing');
    },
    onpause: function() {
      if (songId !== state.currentSongId) return;
      app.classList.remove('playing');
      document.getElementById('playIcon').innerText = 'play_arrow';
      setPlaybackState('paused');
    },
    onend: function() {
      if (songId !== state.currentSongId) return;
      document.getElementById('nextBtn').click();
    },
    onloaderror: function(id, err) {
      console.error('加载失败:', song.src, err);
      if (songId !== state.currentSongId) return;
      document.getElementById('playIcon').innerText = 'play_arrow';
      document.getElementById('playBtn').style.opacity = '';
      showToast('歌曲加载失败，请检查文件或网络');
    }
  });

  if (song.lrc) {
    var lid = ++state.lrcLoadId;
    loadLyrics(song.lrc, function(data) {
      if (lid !== state.lrcLoadId) return;
      if (data && data.length > 0) { state.lyricsData = data; if (state.lyricsVisible) { renderLyrics(); updateLyricHighlight(); } }
    });
  }

  if (!song.lrc) {
    var lid2 = ++state.lrcLoadId;
    loadEmbeddedLyrics(song.src, function(lrcText) {
      if (lid2 !== state.lrcLoadId) return;
      if (lrcText) {
        wPost('parseLRC', { text: lrcText }, function(m) {
          if (lid2 !== state.lrcLoadId) return;
          if (m.data && m.data.length > 0) {
            state.lyricsData = m.data;
            if (state.lyricsVisible) { renderLyrics(); updateLyricHighlight(); }
          }
        });
      }
    });
  }

  mc.onload = function() { updateMediaSession(song.title, song.artist, mc.src, song.cover); syncIslandCover(); };
  if (mc.complete) mc.onload();
  updateMediaSession(song.title, song.artist, mc.src, song.cover);

  preloadAdjacent(state.currentSongIndex);
  savePlayerState();
}

var isDragging = false;
var audioSlider = document.getElementById('audioSlider'), activeTrack = document.getElementById('activeTrack'), inactiveTrack = document.getElementById('inactiveTrack'), sliderThumb = document.getElementById('sliderThumb');

function updateUI(p) {
  p = isNaN(p) ? 0 : Math.max(0, Math.min(100, p));
  audioSlider.value = p; activeTrack.style.width = p + '%'; inactiveTrack.style.left = p + '%'; inactiveTrack.style.width = (100 - p) + '%'; sliderThumb.style.left = p + '%';
  var cur = isDragging ? p / 100 * (state.currentHowl ? state.currentHowl.duration() : 0) : (state.currentHowl ? state.currentHowl.seek() : 0);
  document.getElementById('currTime').innerText = (isNaN(cur) || cur === null) ? '0:00' : Math.floor(cur/60)+':'+String(Math.floor(cur%60)).padStart(2,'0');
  var dur = state.currentHowl ? state.currentHowl.duration() : NaN;
  document.getElementById('durTime').innerText = (isNaN(dur) || dur === null) ? '0:00' : Math.floor(dur/60)+':'+String(Math.floor(dur%60)).padStart(2,'0');
}

function progressLoop() {
  if (state.currentHowl && state.currentHowl.playing() && !isDragging) {
    var seek = state.currentHowl.seek() || 0; var dur = state.currentHowl.duration() || 0;
    if (dur > 0) updateUI(seek / dur * 100);
  }
  if (state.lyricsVisible) updateLyricHighlight();
  requestAnimationFrame(progressLoop);
}
requestAnimationFrame(progressLoop);

// setPositionState 单独用 1s 定时器，避免 60fps 无效调用
setInterval(function() {
  if (state.currentHowl && state.currentHowl.playing()) {
    var seek = Math.floor(state.currentHowl.seek() || 0);
    if (seek !== setPositionState._lastSeek) {
      setPositionState._lastSeek = seek;
      setPositionState(state.currentHowl.duration() || 0, seek);
    }
  }
}, 1000);

audioSlider.addEventListener('input', function() { isDragging = true; updateUI(audioSlider.value); });
audioSlider.addEventListener('change', function() { isDragging = false; if (state.currentHowl) { var d = state.currentHowl.duration() || 0; state.currentHowl.seek(audioSlider.value / 100 * d); setPositionState(d, state.currentHowl.seek() || 0); } });

function updateMediaSession(title, artist, coverUrl, songCover) {
  if (!('mediaSession' in navigator)) return;
  try {
    var artSrc = '';
    if (songCover && songCover.indexOf('data:') !== 0) { artSrc = songCover; }
    else if (coverUrl && coverUrl.indexOf('data:') !== 0) { artSrc = coverUrl; }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title || '', artist: artist || '', album: '',
      artwork: artSrc ? [{ src: artSrc, sizes: '256x256', type: 'image/jpeg' }, { src: artSrc, sizes: '512x512', type: 'image/jpeg' }] : []
    });
  } catch(e) {}
}
function setPlaybackState(state) { if ('mediaSession' in navigator) try { navigator.mediaSession.playbackState = state; } catch(e) {} }
function setPositionState(dur, pos) {
  if ('mediaSession' in navigator && navigator.mediaSession.setPositionState) {
    try { navigator.mediaSession.setPositionState({ duration: dur || 0, playbackRate: 1, position: pos || 0 }); } catch(e) {}
  }
}
if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', playSong);
  navigator.mediaSession.setActionHandler('pause', pauseSong);
  navigator.mediaSession.setActionHandler('previoustrack', function(){ document.getElementById('prevBtn').click(); });
  navigator.mediaSession.setActionHandler('nexttrack', function(){ document.getElementById('nextBtn').click(); });
  navigator.mediaSession.setActionHandler('seekto', function(details) { if (state.currentHowl && details.seekTime != null) state.currentHowl.seek(details.seekTime); });
  navigator.mediaSession.setActionHandler('seekbackward', function() { if (state.currentHowl) state.currentHowl.seek(Math.max(0, (state.currentHowl.seek() || 0) - 10)); });
  navigator.mediaSession.setActionHandler('seekforward', function() { if (state.currentHowl) state.currentHowl.seek(Math.min(state.currentHowl.duration() || 0, (state.currentHowl.seek() || 0) + 10)); });
}

// ── Toast 提示 ──
function showToast(msg) {
  var el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = '1';
  if (showToast._timer) clearTimeout(showToast._timer);
  showToast._timer = setTimeout(function() { el.style.opacity = '0'; }, 3000);
}

document.addEventListener('keydown', function(e){
  if (e.key === ' ') { e.preventDefault(); if (state.currentHowl) state.currentHowl.playing() ? pauseSong() : playSong(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); document.getElementById('prevBtn').click(); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); document.getElementById('nextBtn').click(); }
});

export async function loadBingWallpaper(){
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
    if (d.copyright) { showWallpaperInfo(d.copyright, d.copyright_link || 'https://www.bing.com'); }
  } catch(e) {}
}

function showWallpaperInfo(text, linkUrl) {
  var el = document.getElementById('wallpaperInfo');
  if (!el) {
    el = document.createElement('div');
    el.id = 'wallpaperInfo'; el.className = 'wallpaper-info';
    document.body.appendChild(el);
  }
  var desc = text.replace(/\s*\(.*?\)\s*$/, '').trim() || text;
  var credit = text.match(/\(([^)]+)\)/);
  var creditText = credit ? credit[0] : '';
  el.innerHTML = '<span class="wallpaper-desc">' + desc + '</span> <span class="wallpaper-credit">' + creditText + '</span>';
  el.onclick = function() { window.open(linkUrl, '_blank'); };
  el.style.cursor = 'pointer';
}

document.querySelector('.player-content').addEventListener('click', function(e) {
  if (e.target.closest('.m3-slider-root, .time-labels, .controls')) return;
  toggleLyrics();
});

export function openPlaylist() {
  var overlay = document.getElementById('playlistOverlay');
  if (!state.songs || state.songs.length === 0) return;
  renderPlaylist();
  overlay.classList.add('open');
}
export function closePlaylist() { document.getElementById('playlistOverlay').classList.remove('open'); }
export function renderPlaylist() {
  var body = document.getElementById('playlistBody');
  var repeatBtn = document.getElementById('playlistRepeatBtn');
  repeatBtn.classList.toggle('active', state.isRepeat);
  document.getElementById('playlistCount').textContent = state.songs.length + ' 首';
  var html = '';
  for (var i = 0; i < state.songs.length; i++) {
    var song = state.songs[i];
    var isActive = i === state.currentSongIndex;
    var thumbSrc = song.cover || '';
    html += '<div class="playlist-item' + (isActive ? ' active' : '') + '" data-index="' + i + '">' +
      '<img class="playlist-item-thumb" src="' + (thumbSrc || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><rect fill="#e8ebe6" width="44" height="44"/><text x="22" y="28" font-size="20" text-anchor="middle" fill="#868685">\u266a</text></svg>')) + '" alt="" loading="lazy">' +
      '<div class="playlist-item-info"><div class="playlist-item-title">' + song.title + '</div><div class="playlist-item-artist">' + song.artist + '</div></div>' +
      '<div class="playlist-item-indicator"></div><span class="playlist-item-index">' + (i + 1) + '</span></div>';
  }
  body.innerHTML = html;
  var items = body.querySelectorAll('.playlist-item');
  for (var i = 0; i < items.length; i++) {
    items[i].addEventListener('click', function() {
      var idx = parseInt(this.dataset.index, 10);
      if (idx === state.currentSongIndex) { closePlaylist(); return; }
      state.currentSongIndex = idx;
      loadSong(state.songs[idx]);
      playSong();
      renderPlaylist();
    });
  }
}
document.getElementById('playlistBackdrop').addEventListener('click', closePlaylist);
document.getElementById('playlistHandle').addEventListener('click', closePlaylist);
document.getElementById('playlistRepeatBtn').addEventListener('click', function() {
  state.isRepeat = !state.isRepeat;
  this.classList.toggle('active', state.isRepeat);
  savePlayerState();
});
