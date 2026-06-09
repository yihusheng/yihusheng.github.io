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

const ColorUtils = {
  hexToRgb: function(hex) {
    var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : null;
  },
  rgbToHsl: function(r,g,b) {
    r/=255; g/=255; b/=255;
    var M=Math.max(r,g,b), m=Math.min(r,g,b), h, s, l=(M+m)/2;
    if(M===m){h=s=0;}else{var d=M-m; s=l>0.5?d/(2-M-m):d/(M+m);
      switch(M){case r:h=(g-b)/d+(g<b?6:0);break; case g:h=(b-r)/d+2;break; case b:h=(r-g)/d+4;break;} h/=6;
    } return {h:h*360,s:s*100,l:l*100};
  },
  hslToString: function(h,s,l) { return 'hsl('+h+','+s+'%,'+l+'%)'; },
  extractColorFromUrl: function(url,cb) {
    var c=document.getElementById('colorCanvas'), x=c.getContext('2d'), i=new Image();
    i.crossOrigin='Anonymous'; i.src=url;
    i.onload=function(){
      c.width=50;c.height=50;x.drawImage(i,0,0,50,50);
      try{
        var d=x.getImageData(0,0,50,50).data;
        var r=0,g=0,b=0,t=0;
        for(var j=0;j<d.length;j+=4){
          var br=0.299*d[j]+0.587*d[j+1]+0.114*d[j+2];
          var w=br<50?2:1; r+=d[j]*w; g+=d[j+1]*w; b+=d[j+2]*w; t+=w;
        }
        if(t>0){r=Math.floor(r/t);g=Math.floor(g/t);b=Math.floor(b/t);}
        cb({r:r,g:g,b:b});
      }catch(e){cb({r:100,g:145,b:65});}
    };
    i.onerror=function(){cb({r:100,g:145,b:65});};
  },
  generateTheme: function(src) {
    var h=ColorUtils.rgbToHsl(src.r,src.g,src.b), hue=h.h, s=Math.max(20,Math.min(100,h.s)), l=h.l;
    var aL=Math.max(55,Math.min(78,l+20)), aS=Math.max(50,Math.min(95,s+10));
    return {
      '--md-sys-color-primary': ColorUtils.hslToString(hue,aS,aL),
      '--md-sys-color-on-primary': '#0e0f0c',
      '--md-sys-color-primary-container': ColorUtils.hslToString(hue,Math.max(25,s-5),Math.min(30,l-15)),
      '--md-sys-color-on-primary-container': ColorUtils.hslToString(hue,aS,Math.min(85,aL+10)),
      '--md-sys-color-secondary-container': ColorUtils.hslToString(hue,Math.max(5,s/6),91),
      '--md-sys-color-on-secondary-container': '#0e0f0c',
      '--md-sys-color-surface': '#ffffff',
      '--md-sys-color-surface-container': ColorUtils.hslToString(hue,Math.max(4,s/7),91),
      '--md-sys-color-on-surface': '#0e0f0c',
      '--md-sys-color-on-surface-variant': '#868685',
      '--md-sys-color-outline': '#868685',
      '--phone-screen-bg': ColorUtils.hslToString(hue,Math.max(3,s/8),91),
      '--player-bg': ColorUtils.hslToString(hue,Math.max(5,s/6),88),
      '--island-expand-bg': ColorUtils.hslToString(hue,Math.max(8,s/3),10),
      '--wise-primary-pale': ColorUtils.hslToString(hue,Math.max(20,aS-30),Math.min(92,aL+15)),
      '--wise-ink-deep': ColorUtils.hslToString(hue,Math.max(40,s),Math.max(12,Math.min(22,l-10))),
      '--wise-canvas-soft-darker': ColorUtils.hslToString(hue,Math.max(4,s/5),85)
    };
  }
};

const CookieUtils = {
  set: function(n,v,d){var e=new Date();e.setTime(e.getTime()+(d||30)*864e5);document.cookie=n+'='+v+';expires='+e.toUTCString()+';path=/';},
  get: function(n){var v=document.cookie.match('(^|;)\\s*'+n+'=([^;]*)');return v?v[2]:null;},
  remove: function(n){document.cookie=n+'=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';}
};

var songs = [];
var currentSongIndex = 0;
var isShuffle = true;
var isRepeat = false;

function getRandomIndex() {
  if (songs.length <= 1) return 0;
  var idx;
  do { idx = Math.floor(Math.random() * songs.length); }
  while (idx === currentSongIndex);
  return idx;
}

async function loadMusicList() {
  try {
    var res = await fetch('/src/scripts/music.json?' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    songs = await res.json();
    console.log('🎵 已加载 ' + songs.length + ' 首歌曲');
  } catch (e) {
    console.error('❌ 加载 music.json 失败:', e);
    songs = [];
  }
  if (songs.length === 0) {
    songs = [{ title: '暂无歌曲', artist: '请添加 .mp3 文件到 /src/music 目录', cover: '', src: '' }];
  }
  currentSongIndex = Math.floor(Math.random() * songs.length);
  loadSong(songs[currentSongIndex]);
}

function loadEmbeddedCover(mp3Url, callback) {
  if (typeof jsmediatags === 'undefined') { callback(null); return; }
  try {
    jsmediatags.read(mp3Url, {
      onSuccess: function(tag) {
        var pic = tag.tags && tag.tags.picture;
        if (pic && pic.data) {
          var data = pic.data;
          var bytes = new Uint8Array(data);
          var binary = '';
          for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
          callback('data:' + (pic.format || 'image/jpeg') + ';base64,' + btoa(binary));
        } else {
          callback(null);
        }
      },
      onError: function() { callback(null); }
    });
  } catch(e) { callback(null); }
}

var audio = document.getElementById('audio');
var app = document.getElementById('app');
var island = document.getElementById('island');
var themeColorMeta = document.querySelector('meta[name="theme-color"]');

var weatherCodeMap = {
  0:{d:"晴朗",i:"wb_sunny",b:"#1a1c18"},1:{d:"多云",i:"partly_cloudy_day",b:"#1e2020"},2:{d:"少云",i:"partly_cloudy_day",b:"#1d1f1e"},3:{d:"阴天",i:"cloud",b:"#1c1d1c"},
  45:{d:"雾",i:"foggy",b:"#1a1b1a"},48:{d:"冻雾",i:"foggy",b:"#1b1c1e"},51:{d:"毛毛雨",i:"rainy",b:"#1a1e22"},53:{d:"中毛毛雨",i:"rainy",b:"#1b1f23"},55:{d:"大毛毛雨",i:"rainy",b:"#1c2024"},
  61:{d:"小雨",i:"rainy",b:"#1a1e24"},63:{d:"中雨",i:"rainy",b:"#191d22"},65:{d:"大雨",i:"thunderstorm",b:"#171b20"},66:{d:"冻雨",i:"severe_cold",b:"#1e2126"},67:{d:"冻雨",i:"severe_cold",b:"#1e2126"},
  71:{d:"小雪",i:"ac_unit",b:"#1e2022"},73:{d:"中雪",i:"ac_unit",b:"#1d1f21"},75:{d:"大雪",i:"severe_cold",b:"#1c1e20"},77:{d:"雪粒",i:"severe_cold",b:"#1c1e20"},
  80:{d:"阵雨",i:"rainy",b:"#1a1e23"},81:{d:"阵雨",i:"rainy",b:"#1b1f24"},82:{d:"暴雨",i:"thunderstorm",b:"#181c22"},85:{d:"阵雪",i:"ac_unit",b:"#1d1f21"},86:{d:"阵雪",i:"ac_unit",b:"#1c1e20"},
  95:{d:"雷暴",i:"thunderstorm",b:"#1a1c22"},96:{d:"雷暴",i:"thunderstorm",b:"#1b1d23"},99:{d:"强雷暴",i:"thunderstorm",b:"#191b21"}
};

function updateThemeColor() { var c=getComputedStyle(document.documentElement).getPropertyValue('--phone-screen-bg').trim(); if(c) themeColorMeta.setAttribute('content',c); }
function updateTime() { var n=new Date(); document.getElementById('islandTime').textContent = String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0'); }

async function getLocationByIP() {
  try { var r=await fetch('https://ipapi.co/json/'); if(!r.ok) throw Error(); var d=await r.json(); if(d.latitude&&d.longitude) return {lat:d.latitude,lon:d.longitude,city:d.city}; } catch(e) {
    if(location.protocol==='http:'){ try { var r2=await fetch('http://ip-api.com/json/?lang=zh-CN'); if(r2.ok){ var d2=await r2.json(); if(d2.status==='success') return {lat:d2.lat,lon:d2.lon,city:d2.city}; } } catch(e2){} }
  } return null;
}

async function fetchWeather() {
  var lat=parseFloat(CookieUtils.get('weather_lat'))||null, lon=parseFloat(CookieUtils.get('weather_lon'))||null, locName=null;
  if(!lat||!lon) {
    if('geolocation'in navigator){
      try {
        document.getElementById('locationDisplay').textContent='正在请求位置...';
        var p=await new Promise(function(res,rej){navigator.geolocation.getCurrentPosition(res,rej,{timeout:1e4,enableHighAccuracy:true,maximumAge:3e5});});
        lat=p.coords.latitude; lon=p.coords.longitude;
        CookieUtils.set('weather_lat',lat,30); CookieUtils.set('weather_lon',lon,30);
      } catch(e) {
        var ip=await getLocationByIP();
        if(ip){lat=ip.lat;lon=ip.lon;locName=ip.city;CookieUtils.set('weather_lat',lat,30);CookieUtils.set('weather_lon',lon,30);}
        else{lat=39.9042;lon=116.4074;document.getElementById('locationDisplay').textContent='默认位置 (北京)';}
      }
    } else {
      var ip=await getLocationByIP();
      if(ip){lat=ip.lat;lon=ip.lon;locName=ip.city;CookieUtils.set('weather_lat',lat,30);CookieUtils.set('weather_lon',lon,30);}
      else{lat=39.9042;lon=116.4074;document.getElementById('locationDisplay').textContent='默认位置 (北京)';}
    }
  }
  try {
    if(!locName){ try { var l=await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude='+lat+'&longitude='+lon+'&localityLanguage=zh'); var ld=await l.json(); locName=ld.city||ld.locality||ld.principalSubdivision||ld.countryName||lat.toFixed(2)+', '+lon.toFixed(2); } catch(e){locName='未知位置';} }
    if(!document.getElementById('locationDisplay').textContent.includes('默认')) document.getElementById('locationDisplay').textContent=locName;
    var wr=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto');
    var d=await wr.json(); var c=d.current_weather||d.current, da=d.daily, t=Math.round(c.temperature_2m), cd=c.weather_code, w=weatherCodeMap[cd]||{d:'未知',i:'thermostat',b:'#1a1c18'};
    document.getElementById('islandWeatherTemp').textContent=t+'\u00b0'; document.getElementById('islandWeatherIcon').textContent=w.i;
    document.getElementById('detailIcon').textContent=w.i; document.getElementById('detailTemp').textContent=t+'\u00b0';
    document.getElementById('detailDesc').textContent=w.d;
    document.getElementById('detailRange').textContent='H:'+Math.round(da.temperature_2m_max[0])+'\u00b0 L:'+Math.round(da.temperature_2m_min[0])+'\u00b0';
    document.getElementById('detailWind').innerHTML='<span class="material-symbols-rounded">air</span> '+Math.round(c.wind_speed_10m)+'km/h';
    document.getElementById('detailHumidity').innerHTML='<span class="material-symbols-rounded">water_drop</span> '+c.relative_humidity_2m+'%';
    document.documentElement.style.setProperty('--island-expand-bg',w.b);
  } catch(e) { console.error(e); if(!document.getElementById('locationDisplay').textContent.includes('失败')) document.getElementById('locationDisplay').textContent='天气获取失败'; }
}

function toggleIsland(){island.classList.toggle('active');}
function playSong(){if(!audio.src)return;audio.play();app.classList.add('playing');document.getElementById('playIcon').innerText='pause';}
function pauseSong(){audio.pause();app.classList.remove('playing');document.getElementById('playIcon').innerText='play_arrow';}
document.getElementById('playBtn').addEventListener('click',function(){audio.paused?playSong():pauseSong();});

function toggleShuffle() {
  isShuffle = !isShuffle;
  document.getElementById('shuffleBtn').classList.toggle('active', isShuffle);
}
document.getElementById('shuffleBtn').addEventListener('click', toggleShuffle);
document.getElementById('playlistBtn').addEventListener('click', openPlaylist);

function getNextIndex() {
  if (isRepeat) return currentSongIndex;
  return isShuffle ? getRandomIndex() : (currentSongIndex + 1) % songs.length;
}
function getPrevIndex() {
  if (isRepeat) return currentSongIndex;
  if (isShuffle) return getRandomIndex();
  return (currentSongIndex - 1 + songs.length) % songs.length;
}

document.getElementById('nextBtn').addEventListener('click', function(){
  if(!songs.length) return;
  currentSongIndex = getNextIndex();
  loadSong(songs[currentSongIndex]);
  playSong();
});
document.getElementById('prevBtn').addEventListener('click', function(){
  if(!songs.length) return;
  currentSongIndex = getPrevIndex();
  loadSong(songs[currentSongIndex]);
  playSong();
});

function loadSong(song){
  if (!song || !song.src) return;
  document.getElementById('mainTitle').innerText = song.title;
  document.getElementById('mainArtist').innerText = song.artist;
  var mc = document.getElementById('mainCover');
  mc.src = '';

  loadEmbeddedCover(song.src, function(coverDataUrl) {
    if (coverDataUrl) {
      mc.src = coverDataUrl;
      ColorUtils.extractColorFromUrl(coverDataUrl, function(rgb){
        var t = ColorUtils.generateTheme(rgb);
        for (var k in t) document.documentElement.style.setProperty(k, t[k]);
        updateThemeColor();
      });
    } else if (song.cover) {
      mc.src = song.cover;
      ColorUtils.extractColorFromUrl(song.cover, function(rgb){
        var t = ColorUtils.generateTheme(rgb);
        for (var k in t) document.documentElement.style.setProperty(k, t[k]);
        updateThemeColor();
      });
    }
  });

  audio.src = song.src;
  mc.onload = function() {
    if ('mediaSession' in navigator)
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title, artist: song.artist, album: '',
        artwork: [{ src: mc.src || '', sizes: '512x512', type: 'image/jpeg' }]
      });
  };
  if ('mediaSession' in navigator)
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title, artist: song.artist, artwork: [{ src: '', sizes: '512x512', type: 'image/jpeg' }]
    });
}

var isDragging=false;
var audioSlider=document.getElementById('audioSlider'),activeTrack=document.getElementById('activeTrack'),inactiveTrack=document.getElementById('inactiveTrack'),sliderThumb=document.getElementById('sliderThumb');
audio.addEventListener('timeupdate',function(){var d=audio.duration,ct=audio.currentTime;if(isNaN(d))return;var p=ct/d*100;if(!isDragging)updateUI(p);if(ct>=d&&d>0)document.getElementById('nextBtn').click();});
audioSlider.addEventListener('input',function(){isDragging=true;updateUI(audioSlider.value);});
audioSlider.addEventListener('change',function(){isDragging=false;audio.currentTime=audioSlider.value/100*audio.duration;});
function updateUI(p){p=isNaN(p)?0:Math.max(0,Math.min(100,p));audioSlider.value=p;activeTrack.style.width=p+'%';inactiveTrack.style.left=p+'%';inactiveTrack.style.width=(100-p)+'%';sliderThumb.style.left=p+'%';var cur=isDragging?p/100*audio.duration:audio.currentTime;document.getElementById('currTime').innerText=isNaN(cur)?'0:00':Math.floor(cur/60)+':'+String(Math.floor(cur%60)).padStart(2,'0');document.getElementById('durTime').innerText=isNaN(audio.duration)?'0:00':Math.floor(audio.duration/60)+':'+String(Math.floor(audio.duration%60)).padStart(2,'0');}
if('mediaSession'in navigator){navigator.mediaSession.setActionHandler('play',playSong);navigator.mediaSession.setActionHandler('pause',pauseSong);navigator.mediaSession.setActionHandler('previoustrack',function(){document.getElementById('prevBtn').click();});navigator.mediaSession.setActionHandler('nexttrack',function(){document.getElementById('nextBtn').click();});}
function toggleDrawer(){document.getElementById('drawer').classList.toggle('open');}
document.addEventListener('keydown',function(e){if(e.key===' '){e.preventDefault();audio.paused?playSong():pauseSong();}else if(e.key==='ArrowLeft'){e.preventDefault();document.getElementById('prevBtn').click();}else if(e.key==='ArrowRight'){e.preventDefault();document.getElementById('nextBtn').click();}});
async function loadBingWallpaper(){if(window.innerWidth<768)return;try{var r=await fetch('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN');var d=await r.json();if(d.images&&d.images.length>0){var u='https://www.bing.com'+d.images[0].url;var img=new Image();img.src=u;img.onload=function(){document.body.style.backgroundImage='url('+u+')';};}}catch(e){}}

function openPlaylist() {
  var overlay = document.getElementById('playlistOverlay');
  if (!songs || songs.length === 0) return;
  renderPlaylist();
  overlay.classList.add('open');
}

function closePlaylist() {
  document.getElementById('playlistOverlay').classList.remove('open');
}

function renderPlaylist() {
  var body = document.getElementById('playlistBody');
  var repeatBtn = document.getElementById('playlistRepeatBtn');
  repeatBtn.classList.toggle('active', isRepeat);
  document.getElementById('playlistCount').textContent = songs.length + ' 首';
  var html = '';
  for (var i = 0; i < songs.length; i++) {
    var song = songs[i];
    var isActive = i === currentSongIndex;
    var thumbSrc = song.cover || '';
    html += '<div class="playlist-item' + (isActive ? ' active' : '') + '" data-index="' + i + '">' +
      '<img class="playlist-item-thumb" src="' + thumbSrc + '" alt="" loading="lazy"' +
      ' onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 44 44%22><rect fill=%22%23e8ebe6%22 width=%2244%22 height=%2244%22/><text x=%2222%22 y=%2228%22 font-size=%2220%22 text-anchor=%22middle%22 fill=%22%23868685%22>\u266a</text></svg>\'">' +
      '<div class="playlist-item-info">' +
      '<div class="playlist-item-title">' + song.title + '</div>' +
      '<div class="playlist-item-artist">' + song.artist + '</div></div>' +
      '<div class="playlist-item-indicator"></div>' +
      '<span class="playlist-item-index">' + (i + 1) + '</span></div>';
  }
  body.innerHTML = html;

  var items = body.querySelectorAll('.playlist-item');
  for (var i = 0; i < items.length; i++) {
    items[i].addEventListener('click', function() {
      var idx = parseInt(this.dataset.index, 10);
      if (idx === currentSongIndex) { closePlaylist(); return; }
      currentSongIndex = idx;
      loadSong(songs[idx]);
      playSong();
      renderPlaylist();
    });
  }
}

document.getElementById('playlistBackdrop').addEventListener('click', closePlaylist);
document.getElementById('playlistHandle').addEventListener('click', closePlaylist);
document.getElementById('playlistRepeatBtn').addEventListener('click', function() {
  isRepeat = !isRepeat;
  this.classList.toggle('active', isRepeat);
});

function init(){
  updateTime();
  setInterval(updateTime,1e3);
  fetchWeather();
  setInterval(fetchWeather,6e5);
  island.addEventListener('click',toggleIsland);
  loadBingWallpaper();
  window.addEventListener('resize',function(){if(window.innerWidth>=768)loadBingWallpaper();});
  updateThemeColor();
}

loadMusicList().then(init);
