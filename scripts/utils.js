import { state } from './state.js';

// ── Web Worker 并行处理 ──
export var maxWorker = new Worker('/scripts/worker.js');
var _wqid = 0;
var _wcb = {};
maxWorker.addEventListener('message', function(e) {
  var m = e.data;
  var cb = _wcb[m.id];
  if (cb) { delete _wcb[m.id]; cb(m); }
});
export function wPost(type, payload, cb) {
  var id = ++_wqid;
  _wcb[id] = cb;
  payload.type = type;
  payload.id = id;
  maxWorker.postMessage(payload);
}

// ── 预加载队列 ──
var _prefetched = {};
export function preloadAudio(idx) {
  if (!state.songs || state.songs.length < 2) return;
  var seen = {};
  for (var d = -1; d <= 1; d += 2) {
    for (var offset = 1; offset <= 2; offset++) {
      var index = d === -1
        ? (idx - offset + state.songs.length) % state.songs.length
        : (idx + offset) % state.songs.length;
      if (index === idx || seen[index]) continue;
      seen[index] = true;
      var s = state.songs[index];
      if (!s || !s.src || _prefetched[s.src]) continue;
      _prefetched[s.src] = true;
      if (document.head) {
        var lnk = document.createElement('link');
        lnk.rel = 'prefetch'; lnk.href = s.src; lnk.as = 'audio';
        document.head.appendChild(lnk);
      }
      if (s.cover && !_prefetched[s.cover]) {
        _prefetched[s.cover] = true;
        var lnk2 = document.createElement('link');
        lnk2.rel = 'prefetch'; lnk2.href = s.cover; lnk2.as = 'image';
        document.head.appendChild(lnk2);
      }
    }
  }
}

// ── 性能基准 ──
var benchLog = [];
export function bench(name, t) { benchLog.push({ name: name, t: t }); }
export function logBench() {
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
    totalAvg += parseFloat(avg); totalCount += times.length;
    console.log('%c║  ' + name.padEnd(19) + ' ×' + String(times.length).padStart(3) + '  avg:' + avg + 'ms  ║', 'color:#9fe870');
  });
  console.log('%c╚══════════════════════════════════╝', 'font-weight:bold');
}
setTimeout(logBench, 15000);

// ── IndexedDB 封面缓存 ──
export var CoverDB = {
  db: null,
  open: function() {
    return new Promise(function(resolve) {
      if (CoverDB.db) { resolve(); return; }
      var req = indexedDB.open('maxcloud-cover-cache', 1);
      req.onupgradeneeded = function(e) {
        try { e.target.result.createObjectStore('covers', { keyPath: 'src' }); } catch(ex) {}
      };
      req.onsuccess = function(e) { CoverDB.db = e.target.result; resolve(); };
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
    try { CoverDB.db.transaction('covers', 'readwrite').objectStore('covers').put({ src: src, data: data }); } catch(e) {}
  }
};
CoverDB.open();

// ── IndexedDB 歌词缓存 ──
export var LyricsDB = {
  db: null,
  open: function() {
    return new Promise(function(resolve) {
      if (LyricsDB.db) { resolve(); return; }
      var req = indexedDB.open('maxcloud-lyrics-cache', 1);
      req.onupgradeneeded = function(e) {
        try { e.target.result.createObjectStore('lyrics', { keyPath: 'src' }); } catch(ex) {}
      };
      req.onsuccess = function(e) { LyricsDB.db = e.target.result; resolve(); };
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
    try { LyricsDB.db.transaction('lyrics', 'readwrite').objectStore('lyrics').put({ src: src, data: data }); } catch(e) {}
  }
};
LyricsDB.open();

// ── 预热相邻歌曲 ──
export function preloadAdjacent(idx) {
  idx = idx || 0;
  if (!state.songs || state.songs.length === 0) return;
  var prevIdx = (idx - 1 + state.songs.length) % state.songs.length;
  var nextIdx = (idx + 1) % state.songs.length;
  [prevIdx, nextIdx].forEach(function(i) {
    if (i === idx) return;
    var s = state.songs[i];
    if (!s || !s.src) return;
    CoverDB.get(s.src).then(function(cached) { if (!cached && s.cover) { new Image().src = s.cover; } });
    if (!s.lrc) { LyricsDB.get(s.src).then(function() {}); }
  });
}

// ── 色彩工具 ──
export const ColorUtils = {
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

// ── Cookie 工具 ──
export const CookieUtils = {
  set: function(n,v,d){var e=new Date();e.setTime(e.getTime()+(d||30)*864e5);document.cookie=n+'='+v+';expires='+e.toUTCString()+';path=/';},
  get: function(n){var v=document.cookie.match('(^|;)\\s*'+n+'=([^;]*)');return v?v[2]:null;},
  remove: function(n){document.cookie=n+'=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';}
};
