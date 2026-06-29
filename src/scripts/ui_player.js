// ── 切换天气详情抽屉 ──
function toggleWeatherDetail() {
  var island = document.getElementById('island');
  island.classList.toggle('weather-detailed');
  var icon = document.getElementById('weatherMoreIcon');
  if (icon) icon.textContent = island.classList.contains('weather-detailed') ? 'expand_less' : 'expand_more';
}

function toggleIsland(){
  if(island.classList.contains('music-mode')){
    toggleLyrics();
    island.classList.remove('weather-detailed');
    island.classList.remove('active');
    var wi=document.getElementById('weatherMoreIcon');
    if(wi) wi.textContent='expand_more';
    return;
  }
  island.classList.toggle('active');
  if(!island.classList.contains('active')) island.classList.remove('weather-detailed');
  var icon=document.getElementById('weatherMoreIcon');
  if(icon) icon.textContent='expand_more';
}

function playSong(){ if (!currentHowl) return; currentHowl.play(); }
function pauseSong(){ if (!currentHowl) return; currentHowl.pause(); }
document.getElementById('playBtn').addEventListener('click',function(){ if (!currentHowl) return; currentHowl.playing() ? pauseSong() : playSong(); });

function toggleShuffle() { isShuffle = !isShuffle; document.getElementById('shuffleBtn').classList.toggle('active', isShuffle); }
document.getElementById('shuffleBtn').addEventListener('click', toggleShuffle);
document.getElementById('playlistBtn').addEventListener('click', openPlaylist);

function getNextIndex() { if (isRepeat) return currentSongIndex; return isShuffle ? getRandomIndex() : (currentSongIndex + 1) % songs.length; }
function getPrevIndex() { if (isRepeat) return currentSongIndex; if (isShuffle) return getRandomIndex(); return (currentSongIndex - 1 + songs.length) % songs.length; }

document.getElementById('nextBtn').addEventListener('click', function(){ if(!songs.length) return; currentSongIndex = getNextIndex(); loadSong(songs[currentSongIndex]); playSong(); });
document.getElementById('prevBtn').addEventListener('click', function(){ if(!songs.length) return; currentSongIndex = getPrevIndex(); loadSong(songs[currentSongIndex]); playSong(); });

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

// ── 渲染歌词 + 绑定点击（开源方案：文本 span 精准命中）──
function renderLyrics() {
  var container = document.getElementById('lyricsContent');
  if (!lyricsData || lyricsData.length === 0) { container.innerHTML = '<div class="lyrics-empty">暂无歌词</div>'; return; }
  var html = '';
  for (var i = 0; i < lyricsData.length; i++) {
    html += '<div class="lyric-line" data-index="' + i + '"><span class="lyric-text">' + lyricsData[i].text + '</span></div>';
  }
  container.innerHTML = html;
  // 每行歌词：点击文本 → 跳转 + 阻止冒泡（不关闭）；点击 padding → 不阻止 → 冒泡到父级关闭
  var lines = container.querySelectorAll('.lyric-line');
  for (var i = 0; i < lines.length; i++) {
    lines[i].addEventListener('click', function(e) {
      if (e.target.classList.contains('lyric-text')) {
        var idx = parseInt(this.dataset.index, 10);
        if (currentHowl && lyricsData[idx] && !isNaN(lyricsData[idx].time)) {
          currentHowl.seek(lyricsData[idx].time);
          if (!currentHowl.playing()) currentHowl.play();
        }
        e.stopPropagation();
      }
      // 点击 padding → 不阻止 → 冒泡到 lyricsView → 关闭
    });
  }
}

function updateIslandMusic() {
  var song = songs[currentSongIndex];
  if (!song) return;
  document.getElementById('islandMusicTitle').innerText = song.title || '';
  document.getElementById('islandMusicArtist').innerText = song.artist || '';
  var cover = document.getElementById('mainCover');
  document.getElementById('islandMusicCover').src = cover && cover.src ? cover.src : '';
}

function toggleLyrics() {
  lyricsVisible = !lyricsVisible;
  var lv = document.getElementById('lyricsView');
  var pb = document.querySelector('.player-background');
  var pc = document.querySelector('.player-content');
  var island = document.getElementById('island');
  if (lyricsVisible) {
    lv.classList.add('open');
    pb.style.opacity = '0';
    pc.style.background = 'var(--phone-screen-bg)';
    island.classList.add('music-mode');
    island.classList.remove('active');
    island.classList.remove('weather-detailed');
    updateIslandMusic();
    if (lyricsData.length > 0) {
      renderLyrics();
      updateLyricHighlight();
    } else if (currentSongLrcUrl) {
      document.getElementById('lyricsContent').innerHTML = '<div class="lyrics-empty">歌词加载中...</div>';
      var lid = ++lrcLoadId;
      loadLyrics(currentSongLrcUrl, function(data) {
        if (lid !== lrcLoadId) return;
        if (data && data.length > 0) { lyricsData = data; renderLyrics(); updateLyricHighlight(); }
        else { document.getElementById('lyricsContent').innerHTML = '<div class="lyrics-empty">暂无歌词</div>'; }
      });
    } else {
      // 无外部歌词 → 尝试从音频文件读内嵌歌词兜底
      document.getElementById('lyricsContent').innerHTML = '<div class="lyrics-empty">歌词加载中...</div>';
      var lid3 = ++lrcLoadId;
      loadEmbeddedLyrics(songs[currentSongIndex] && songs[currentSongIndex].src, function(lrcText) {
        if (lid3 !== lrcLoadId) return;
        if (lrcText) {
          wPost('parseLRC', { text: lrcText }, function(m) {
            if (lid3 !== lrcLoadId) return;
            if (m.data && m.data.length > 0) {
              lyricsData = m.data;
              renderLyrics();
              updateLyricHighlight();
            } else {
              document.getElementById('lyricsContent').innerHTML = '<div class="lyrics-empty">暂无歌词</div>';
            }
          });
        } else {
          document.getElementById('lyricsContent').innerHTML = '<div class="lyrics-empty">暂无歌词</div>';
        }
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
  if (!currentHowl || !lyricsVisible || !lyricsData || lyricsData.length === 0) return;
  var seek = currentHowl.seek() || 0;
  var newIndex = -1;
  for (var i = 0; i < lyricsData.length; i++) {
    if (lyricsData[i].time < 0) continue; // 纯文本歌词跳过高亮
    if (lyricsData[i].time <= seek) newIndex = i; else break;
  }
  if (newIndex !== currentLyricIndex) {
    var items = document.querySelectorAll('.lyric-line');
    for (var i = 0; i < items.length; i++) items[i].classList.remove('active');
    if (newIndex >= 0 && items[newIndex]) { items[newIndex].classList.add('active'); items[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    currentLyricIndex = newIndex;
  }
}

function loadSong(song){
  if (!song || !song.src) return;
  if (currentHowl) { currentHowl.unload(); currentHowl = null; }

  var songId = Date.now(); currentSongId = songId;
  document.getElementById('mainTitle').innerText = song.title;
  document.getElementById('mainArtist').innerText = song.artist;
  var mc = document.getElementById('mainCover');

  if (lyricsVisible) toggleLyrics();

  updateUI(0);
  app.classList.remove('playing');
  document.getElementById('playIcon').innerText = 'play_arrow';
  lyricsData = []; currentLyricIndex = -1;
  currentSongLrcUrl = song.lrc || null; lrcLoadId = 0;

  // 立即显示封面（song.cover 或占位图），不等嵌入式
  var fallback = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280"><rect fill="#e8ebe6" width="280" height="280"/><text x="140" y="155" font-size="64" text-anchor="middle" fill="#868685">\u266a</text></svg>');
  mc.src = song.cover || fallback;
  updateMediaSession(song.title, song.artist, mc.src, song.cover);

  // 并行 1: IndexedDB 缓存 → 立即升级封面
  CoverDB.get(song.src).then(function(cached) {
    if (songId !== currentSongId || !cached) return;
    if (mc.src !== cached) { mc.src = cached; updateMediaSession(song.title, song.artist, mc.src, song.cover); }
    var t0 = performance.now();
    wPost('extractColor', { url: mc.src }, function(m) {
      bench('worker-color', performance.now() - t0);
      if (m.rgb) { var t = ColorUtils.generateTheme(m.rgb); for (var k in t) document.documentElement.style.setProperty(k, t[k]); updateThemeColor(); }
    });
  });

  // 并行 2: 后台提取嵌入式封面（不阻塞播放）
  loadEmbeddedCover(song.src, function(coverDataUrl) {
    if (songId !== currentSongId) return;
    if (coverDataUrl) {
      CoverDB.set(song.src, coverDataUrl);
      if (mc.src !== coverDataUrl) {
        mc.src = coverDataUrl;
        updateMediaSession(song.title, song.artist, mc.src, song.cover);
        var t0 = performance.now();
        wPost('extractColor', { url: coverDataUrl }, function(m) {
          bench('worker-color', performance.now() - t0);
          if (m.rgb) { var t = ColorUtils.generateTheme(m.rgb); for (var k in t) document.documentElement.style.setProperty(k, t[k]); updateThemeColor(); }
        });
      }
    } else if (song.cover && mc.src !== song.cover) {
      mc.src = song.cover;
      updateMediaSession(song.title, song.artist, mc.src, song.cover);
    }
  });

  // 加载状态：播放按钮显示缓冲图标
  document.getElementById('playIcon').innerText = 'hourglass_empty';
  document.getElementById('playBtn').style.opacity = '0.6';

  currentHowl = new Howl({
    src: [song.src], html5: true, preload: 'metadata',
    onload: function() {
      if (songId !== currentSongId) return;
      var dur = currentHowl.duration();
      document.getElementById('durTime').innerText = isNaN(dur) ? '0:00' : Math.floor(dur/60)+':'+String(Math.floor(dur%60)).padStart(2,'0');
      // 恢复播放按钮
      document.getElementById('playIcon').innerText = 'play_arrow';
      document.getElementById('playBtn').style.opacity = '';
      // 当前曲已就绪 → 预热相邻歌曲
      preloadAudio(currentSongIndex);
    },
    onplay: function() {
      if (songId !== currentSongId) return;
      app.classList.add('playing');
      document.getElementById('playIcon').innerText = 'pause';
      document.getElementById('playBtn').style.opacity = '';
      setPlaybackState('playing');
    },
    onpause: function() {
      if (songId !== currentSongId) return;
      app.classList.remove('playing');
      document.getElementById('playIcon').innerText = 'play_arrow';
      setPlaybackState('paused');
    },
    onend: function() {
      if (songId !== currentSongId) return;
      document.getElementById('nextBtn').click();
    },
    onloaderror: function(id, err) {
      console.error('加载失败:', song.src, err);
      if (songId !== currentSongId) return;
      document.getElementById('playIcon').innerText = 'play_arrow';
      document.getElementById('playBtn').style.opacity = '';
    }
  });

  if (song.lrc) {
    var lid = ++lrcLoadId;
    loadLyrics(song.lrc, function(data) {
      if (lid !== lrcLoadId) return;
      if (data && data.length > 0) { lyricsData = data; if (lyricsVisible) { renderLyrics(); updateLyricHighlight(); } }
    });
  }

  // 前端兜底：无外部歌词时尝试从音频文件读取内嵌歌词
  if (!song.lrc) {
    var lid2 = ++lrcLoadId;
    loadEmbeddedLyrics(song.src, function(lrcText) {
      if (lid2 !== lrcLoadId) return;
      if (lrcText) {
        wPost('parseLRC', { text: lrcText }, function(m) {
          if (lid2 !== lrcLoadId) return;
          if (m.data && m.data.length > 0) {
            lyricsData = m.data;
            if (lyricsVisible) { renderLyrics(); updateLyricHighlight(); }
          }
        });
      }
    });
  }

  mc.onload = function() { updateMediaSession(song.title, song.artist, mc.src, song.cover); };
  updateMediaSession(song.title, song.artist, mc.src, song.cover);

  // 预热相邻歌曲
  preloadAdjacent(currentSongIndex);
}

var isDragging = false;
var audioSlider = document.getElementById('audioSlider'), activeTrack = document.getElementById('activeTrack'), inactiveTrack = document.getElementById('inactiveTrack'), sliderThumb = document.getElementById('sliderThumb');

function updateUI(p) {
  p = isNaN(p) ? 0 : Math.max(0, Math.min(100, p));
  audioSlider.value = p; activeTrack.style.width = p + '%'; inactiveTrack.style.left = p + '%'; inactiveTrack.style.width = (100 - p) + '%'; sliderThumb.style.left = p + '%';
  var cur = isDragging ? p / 100 * (currentHowl ? currentHowl.duration() : 0) : (currentHowl ? currentHowl.seek() : 0);
  document.getElementById('currTime').innerText = (isNaN(cur) || cur === null) ? '0:00' : Math.floor(cur/60)+':'+String(Math.floor(cur%60)).padStart(2,'0');
  var dur = currentHowl ? currentHowl.duration() : NaN;
  document.getElementById('durTime').innerText = (isNaN(dur) || dur === null) ? '0:00' : Math.floor(dur/60)+':'+String(Math.floor(dur%60)).padStart(2,'0');
}

function progressLoop() {
  if (currentHowl && currentHowl.playing() && !isDragging) {
    var seek = currentHowl.seek() || 0; var dur = currentHowl.duration() || 0;
    if (dur > 0) updateUI(seek / dur * 100);
    if (Math.floor(seek) !== progressLoop._lastSeek) { progressLoop._lastSeek = Math.floor(seek); setPositionState(dur, seek); }
  }
  if (lyricsVisible) updateLyricHighlight();
  requestAnimationFrame(progressLoop);
}
requestAnimationFrame(progressLoop);

audioSlider.addEventListener('input', function() { isDragging = true; updateUI(audioSlider.value); });
audioSlider.addEventListener('change', function() { isDragging = false; if (currentHowl) { var d = currentHowl.duration() || 0; currentHowl.seek(audioSlider.value / 100 * d); setPositionState(d, currentHowl.seek() || 0); } });

// 系统媒体控件 — 封面变化时自动更新
function updateMediaSession(title, artist, coverUrl, songCover) {
  if (!('mediaSession' in navigator)) return;
  try {
    var artSrc = '';
    if (songCover && songCover.indexOf('data:') !== 0) {
      artSrc = songCover;
    } else if (coverUrl && coverUrl.indexOf('data:') !== 0) {
      artSrc = coverUrl;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title || '',
      artist: artist || '',
      album: '',
      artwork: artSrc ? [
        { src: artSrc, sizes: '256x256', type: 'image/jpeg' },
        { src: artSrc, sizes: '512x512', type: 'image/jpeg' }
      ] : []
    });
  } catch(e) {}
}
function setPlaybackState(state) {
  if ('mediaSession' in navigator) try { navigator.mediaSession.playbackState = state; } catch(e) {}
}
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
  // Android: 锁屏进度条拖拽
  navigator.mediaSession.setActionHandler('seekto', function(details) {
    if (currentHowl && details.seekTime != null) currentHowl.seek(details.seekTime);
  });
  navigator.mediaSession.setActionHandler('seekbackward', function() {
    if (currentHowl) currentHowl.seek(Math.max(0, (currentHowl.seek() || 0) - 10));
  });
  navigator.mediaSession.setActionHandler('seekforward', function() {
    if (currentHowl) currentHowl.seek(Math.min(currentHowl.duration() || 0, (currentHowl.seek() || 0) + 10));
  });
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

function openPlaylist() { var overlay = document.getElementById('playlistOverlay'); if (!songs || songs.length === 0) return; renderPlaylist(); overlay.classList.add('open'); }
function closePlaylist() { document.getElementById('playlistOverlay').classList.remove('open'); }

function renderPlaylist() {
  var body = document.getElementById('playlistBody'); var repeatBtn = document.getElementById('playlistRepeatBtn');
  repeatBtn.classList.toggle('active', isRepeat); document.getElementById('playlistCount').textContent = songs.length + ' 首';
  var html = '';
  for (var i = 0; i < songs.length; i++) {
    var song = songs[i]; var isActive = i === currentSongIndex; var thumbSrc = song.cover || '';
    html += '<div class="playlist-item' + (isActive ? ' active' : '') + '" data-index="' + i + '">' +
      '<img class="playlist-item-thumb" src="' + thumbSrc + '" alt="" loading="lazy" onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 44 44%22><rect fill=%22%23e8ebe6%22 width=%2244%22 height=%2244%22/><text x=%2222%22 y=%2228%22 font-size=%2220%22 text-anchor=%22middle%22 fill=%22%23868685%22>\u266a</text></svg>\'">' +
      '<div class="playlist-item-info"><div class="playlist-item-title">' + song.title + '</div><div class="playlist-item-artist">' + song.artist + '</div></div>' +
      '<div class="playlist-item-indicator"></div><span class="playlist-item-index">' + (i + 1) + '</span></div>';
  }
  body.innerHTML = html;
  var items = body.querySelectorAll('.playlist-item');
  for (var i = 0; i < items.length; i++) items[i].addEventListener('click', function() { var idx = parseInt(this.dataset.index, 10); if (idx === currentSongIndex) { closePlaylist(); return; } currentSongIndex = idx; loadSong(songs[idx]); playSong(); renderPlaylist(); });
}

document.getElementById('playlistBackdrop').addEventListener('click', closePlaylist);
document.getElementById('playlistHandle').addEventListener('click', closePlaylist);
document.getElementById('playlistRepeatBtn').addEventListener('click', function() { isRepeat = !isRepeat; this.classList.toggle('active', isRepeat); });
document.querySelector('.player-content').addEventListener('click', function(e) {
  // 仅当点击在进度条以下区域（播放控件）时不触发切换
  if (e.target.closest('.m3-slider-root, .time-labels, .controls')) return;
  toggleLyrics();
});

function init(){
