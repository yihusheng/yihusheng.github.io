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
var maxWorker = new Worker('/src/scripts/worker.js');
var _wqid = 0;
var _wcb = {};
maxWorker.addEventListener('message', function(e) {
  var m = e.data;
  var cb = _wcb[m.id];
  if (cb) { delete _wcb[m.id]; cb(m); }
});
function wPost(type, payload, cb) {
  var id = ++_wqid;
  _wcb[id] = cb;
  payload.type = type;
  payload.id = id;
  maxWorker.postMessage(payload);
}
// ── 预加载队列：相邻歌曲后台预热（浏览器级 prefetch，轻量无副作用）──
var _prefetched = {};
function preloadAudio(idx) {
  if (!songs || songs.length < 2) return;
  var seen = {};
  for (var d = -1; d <= 1; d += 2) {
    for (var offset = 1; offset <= 2; offset++) {
      var index = d === -1
        ? (idx - offset + songs.length) % songs.length
        : (idx + offset) % songs.length;
      if (index === idx || seen[index]) continue;
      seen[index] = true;
      var s = songs[index];
      if (!s || !s.src || _prefetched[s.src]) continue;
      _prefetched[s.src] = true;
      // <link rel=prefetch> 让浏览器在空闲时下载缓存，切换时秒开
      if (document.head) {
        var lnk = document.createElement('link');
        lnk.rel = 'prefetch';
        lnk.href = s.src;
        lnk.as = 'audio';
        document.head.appendChild(lnk);
      }
      // 封面也预取
      if (s.cover && !_prefetched[s.cover]) {
        _prefetched[s.cover] = true;
        var lnk2 = document.createElement('link');
        lnk2.rel = 'prefetch';
        lnk2.href = s.cover;
        lnk2.as = 'image';
        document.head.appendChild(lnk2);
      }
    }
  }
}

// ── 性能基准 ──
var benchLog = [];
function bench(name, t) { benchLog.push({ name: name, t: t }); }
function logBench() {
  if (benchLog.length === 0) return;
  var byName = {};
  benchLog.forEach(function(b) {
    if (!byName[b.name]) byName[b.name] = [];
    byName[b.name].push(b.t);
  });
  console.log('%c╔══════════════════════════════════╗', 'font-weight:bold');
  console.log('%c║  Web Worker 性能基准 (ms)        ║', 'font-weight:bold');
  var totalAvg = 0, totalCount = 0;
  Object.keys(byName).forEach(function(name) {
    var times = byName[name];
    var avg = (times.reduce(function(a,b){return a+b;}, 0) / times.length).toFixed(2);
    totalAvg += parseFloat(avg);
    totalCount += times.length;
    console.log('%c║  ' + name.padEnd(19) + ' ×' + String(times.length).padStart(3) + '  avg:' + avg + 'ms  ║', 'color:#9fe870');
  });
  console.log('%c╚══════════════════════════════════╝', 'font-weight:bold');
}
setTimeout(logBench, 15000);

// ── IndexedDB 封面缓存 ──
var CoverDB = {
  db: null,
  open: function() {
    return new Promise(function(resolve) {
      if (CoverDB.db) { resolve(); return; }
      var req = indexedDB.open('maxcloud-cover-cache', 1);
      req.onupgradeneeded = function(e) {
        try { e.target.result.createObjectStore('covers', { keyPath: 'src' }); } catch(ex) {}
      };
      req.onsuccess = function(e) {
        CoverDB.db = e.target.result;
        resolve();
      };
      req.onerror = function() { resolve(); };
    });
  },
  get: function(src) {
    if (!CoverDB.db) return Promise.resolve(null);
    return new Promise(function(resolve) {
      try {
        var tx = CoverDB.db.transaction('covers', 'readonly');
        var r = tx.objectStore('covers').get(src);
        r.onsuccess = function() { resolve(r.result ? r.result.data : null); };
        r.onerror = function() { resolve(null); };
      } catch(e) { resolve(null); }
    });
  },
  set: function(src, data) {
    if (!CoverDB.db) return;
    try {
      CoverDB.db.transaction('covers', 'readwrite').objectStore('covers').put({ src: src, data: data });
    } catch(e) {}
  }
};
CoverDB.open();

// ── IndexedDB 歌词缓存（避免重复下载整个音频读内嵌歌词）──
var LyricsDB = {
  db: null,
  open: function() {
    return new Promise(function(resolve) {
      if (LyricsDB.db) { resolve(); return; }
      var req = indexedDB.open('maxcloud-lyrics-cache', 1);
      req.onupgradeneeded = function(e) {
        try { e.target.result.createObjectStore('lyrics', { keyPath: 'src' }); } catch(ex) {}
      };
      req.onsuccess = function(e) {
        LyricsDB.db = e.target.result;
        resolve();
      };
      req.onerror = function() { resolve(); };
    });
  },
  get: function(src) {
    if (!LyricsDB.db) return Promise.resolve(null);
    return new Promise(function(resolve) {
      try {
        var tx = LyricsDB.db.transaction('lyrics', 'readonly');
        var r = tx.objectStore('lyrics').get(src);
        r.onsuccess = function() { resolve(r.result ? r.result.data : null); };
        r.onerror = function() { resolve(null); };
      } catch(e) { resolve(null); }
    });
  },
  set: function(src, data) {
    if (!LyricsDB.db) return;
    try {
      LyricsDB.db.transaction('lyrics', 'readwrite').objectStore('lyrics').put({ src: src, data: data });
    } catch(e) {}
  }
};
LyricsDB.open();

// ── 预热相邻歌曲，并行拉封面 + 歌词 ──
function preloadAdjacent(idx) {
  idx = idx || currentSongIndex;
  var prevIdx = (idx - 1 + songs.length) % songs.length;
  var nextIdx = (idx + 1) % songs.length;
  [prevIdx, nextIdx].forEach(function(i) {
    if (i === idx) return;
    var s = songs[i];
    if (!s || !s.src) return;
    CoverDB.get(s.src).then(function(cached) {
      if (cached) return;
      if (s.cover) { new Image().src = s.cover; }
    });
    // 预热相邻歌词（只走缓存，不触发下载）
    if (!s.lrc) {
      LyricsDB.get(s.src).then(function(cached) {
        if (cached) return;
      });
    }
  });
}

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
      var t0=performance.now();
      c.width=50;c.height=50;x.drawImage(i,0,0,50,50);
      try{
        var d=x.getImageData(0,0,50,50).data;
        var r=0,g=0,b=0,t=0;
        for(var j=0;j<d.length;j+=4){
          var br=0.299*d[j]+0.587*d[j+1]+0.114*d[j+2];
          var w=br<50?2:1; r+=d[j]*w; g+=d[j+1]*w; b+=d[j+2]*w; t+=w;
        }
        if(t>0){r=Math.floor(r/t);g=Math.floor(g/t);b=Math.floor(b/t);}
        console.log('  [main-thread] extractColor: '+(performance.now()-t0).toFixed(1)+'ms');
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
var currentHowl = null;
var currentSongId = null;
var lyricsData = [];
var lyricsVisible = false;
var currentLyricIndex = -1;
var currentSongLrcUrl = null;
var lrcLoadId = 0;

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
    songs = [{ title: '暂无歌曲', artist: '请添加 .mp3 文件到 public/music 目录', cover: '', src: '' }];
  }
  currentSongIndex = Math.floor(Math.random() * songs.length);
  loadSong(songs[currentSongIndex]);
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
        } else {
          callback(null);
        }
      },
      onError: function() { callback(null); }
    });
  } catch(e) { callback(null); }
}

// ── 前端兜底：jsmediatags 读取内嵌歌词（缓存 + 跳过大文件）──
function loadEmbeddedLyrics(audioUrl, callback) {
  if (typeof jsmediatags === 'undefined') { callback(null); return; }
  LyricsDB.get(audioUrl).then(function(cached) {
    if (cached) { callback(cached); return; }
    // 大文件跳过 jsmediatags 读取（需下载整个文件才能解析）
    fetch(audioUrl, { method: 'HEAD' }).then(function(r) {
      var size = parseInt(r.headers.get('Content-Length') || '0', 10);
      if (size > 3 * 1024 * 1024) { callback(null); return; }
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
          LyricsDB.set(audioUrl, lrcText);
          callback(lrcText);
        } else if (tags.lyrics) {
          var joined = '';
          for (var i = 0; i < tags.lyrics.length; i++) {
            var l = tags.lyrics[i];
            joined += (typeof l === 'string' ? l : l.text || '') + '\n';
          }
          if (joined.trim()) { LyricsDB.set(audioUrl, joined); callback(joined); }
          else callback(null);
        } else {
          callback(null);
        }
      },
      onError: function() { callback(null); }
    });
  } catch(e) { callback(null); }
}

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
    // 请求更多天气数据：日出日落、体感温度、云量、紫外线、降水概率
    var wr=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,cloud_cover,precipitation&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=1');
    var d=await wr.json(); var c=d.current||d.current_weather, da=d.daily, tz=d.timezone||'';
    var t=Math.round(c.temperature_2m), fl=Math.round(c.apparent_temperature||t), cd=c.weather_code, w=weatherCodeMap[cd]||{d:'未知',i:'thermostat',b:'#1a1c18'};
    document.getElementById('islandWeatherTemp').textContent=t+'\u00b0'; document.getElementById('islandWeatherIcon').textContent=w.i;
    document.getElementById('detailIcon').textContent=w.i; document.getElementById('detailTemp').textContent=t+'\u00b0';
    document.getElementById('detailDesc').textContent=w.d+(isNaN(fl)||fl===t?'':' (体感 '+fl+'\u00b0)');
    document.getElementById('detailRange').textContent='H:'+Math.round(da.temperature_2m_max[0])+'\u00b0 L:'+Math.round(da.temperature_2m_min[0])+'\u00b0';
    document.getElementById('detailWind').innerHTML='<span class="material-symbols-rounded">air</span> '+Math.round(c.wind_speed_10m)+'km/h';
    document.getElementById('detailHumidity').innerHTML='<span class="material-symbols-rounded">water_drop</span> '+c.relative_humidity_2m+'%';
    document.documentElement.style.setProperty('--island-expand-bg',w.b);
    // 日出日落 & 月相
    if(da.sunrise&&da.sunrise[0]){ var sr=new Date(da.sunrise[0]); document.getElementById('weatherSunrise').textContent=String(sr.getHours()).padStart(2,'0')+':'+String(sr.getMinutes()).padStart(2,'0'); }
    if(da.sunset&&da.sunset[0]){ var ss=new Date(da.sunset[0]); document.getElementById('weatherSunset').textContent=String(ss.getHours()).padStart(2,'0')+':'+String(ss.getMinutes()).padStart(2,'0'); }
    document.getElementById('weatherMoonPhase').textContent=getMoonPhase(new Date());
  } catch(e) { console.error(e); if(!document.getElementById('locationDisplay').textContent.includes('失败')) document.getElementById('locationDisplay').textContent='天气获取失败'; }
}

// ── 月相计算（精确到 0.1 天）──
function getMoonPhase(date) {
  // 已知新月基准: 2000年1月6日 18:14 UTC（JDE 2451550.1）
  var knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
  var lunarMonth = 29.53058867; // 平均朔望月（天）
  var diffDays = (date.getTime() - knownNewMoon) / 86400000;
  var age = ((diffDays % lunarMonth) + lunarMonth) % lunarMonth; // 月龄（天）
  var phase = age / lunarMonth; // 0~1
  if (phase < 0.025 || phase > 0.975) return '🌑 新月';
  if (phase < 0.175) return '🌒 蛾眉月';
  if (phase < 0.325) return '🌓 上弦月';
  if (phase < 0.475) return '🌔 盈凸月';
  if (phase < 0.525) return '🌕 满月';
  if (phase < 0.675) return '🌖 亏凸月';
  if (phase < 0.825) return '🌗 下弦月';
  return '🌘 残月';
}

// ── 切换天气详情抽屉 ──
function toggleWeatherDetail() {
  var island = document.getElementById('island');
  island.classList.toggle('weather-detailed');
  var icon = document.getElementById('weatherMoreIcon');
  if (icon) icon.textContent = island.classList.contains('weather-detailed') ? 'expand_less' : 'expand_more';
}

function toggleIsland(){
  if(island.classList.contains('music-mode')){toggleLyrics();return;}
  island.classList.toggle('active');
  if(!island.classList.contains('active')) island.classList.remove('weather-detailed');
  // 收起时重置箭头
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
        if (currentHowl && lyricsData[idx] && !isNaN(lyricsData[idx].time)) currentHowl.seek(lyricsData[idx].time);
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