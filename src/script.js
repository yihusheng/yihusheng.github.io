// ==================== 缩放适配核心代码 ====================
const ORIGINAL_WIDTH = 375;
const ORIGINAL_HEIGHT = 812;

function applyScale() {
    const app = document.getElementById('app');
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const availableWidth = screenWidth * 0.95;
    const availableHeight = screenHeight * 0.95;
    
    const scaleX = availableWidth / ORIGINAL_WIDTH;
    const scaleY = availableHeight / ORIGINAL_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    
    const finalScale = Math.min(scale, 1.15);
    
    app.style.transform = `scale(${finalScale})`;
    
    console.log(`屏幕: ${screenWidth}x${screenHeight}, 缩放比例: ${finalScale.toFixed(3)}`);
}

applyScale();

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(applyScale, 100);
});

window.addEventListener('orientationchange', () => {
    setTimeout(applyScale, 200);
});

// ==================== 以下是原有代码 ====================
const ColorUtils = {
    hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
    },
    rgbToHsl: (r, g, b) => {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; } else {
            const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; case b: h = (r - g) / d + 4; break; }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    },
    hslToString: (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`,
    extractColorFromUrl: (imageUrl, callback) => {
        const canvas = document.getElementById('colorCanvas');
        const ctx = canvas.getContext('2d');
        
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;
        
        img.onload = function() {
            canvas.width = 50;
            canvas.height = 50;
            ctx.drawImage(img, 0, 0, 50, 50);
            
            try {
                const imageData = ctx.getImageData(0, 0, 50, 50).data;
                let r = 0, g = 0, b = 0, totalWeight = 0;
                
                // 优化：增强深色像素权重，确保深紫色封面主色调被提取
                for (let i = 0; i < imageData.length; i += 4) {
                    const pixelR = imageData[i];
                    const pixelG = imageData[i + 1];
                    const pixelB = imageData[i + 2];
                    const brightness = (0.299 * pixelR + 0.587 * pixelG + 0.114 * pixelB);
                    
                    // 对深色像素（亮度 < 50）给予更高权重，避免被高光部分干扰
                    let weight = 1;
                    if (brightness < 50) {
                        weight = 2; // 深色像素权重加倍
                    }
                    
                    r += pixelR * weight;
                    g += pixelG * weight;
                    b += pixelB * weight;
                    totalWeight += weight;
                }
                
                if (totalWeight > 0) {
                    r = Math.floor(r / totalWeight);
                    g = Math.floor(g / totalWeight);
                    b = Math.floor(b / totalWeight);
                }
                
                callback({ r, g, b });
            } catch (e) {
                console.error("颜色提取错误:", e);
                callback({ r: 76, g: 55, b: 139 });
            }
        };
        
        img.onerror = function() {
            console.error("图片加载失败:", imageUrl);
            callback({ r: 76, g: 55, b: 139 });
        };
    },
    
    generateTheme: (sourceRgb) => {
        const hsl = ColorUtils.rgbToHsl(sourceRgb.r, sourceRgb.g, sourceRgb.b);
        const h = hsl.h;
        const s = Math.max(20, Math.min(100, hsl.s));
        const l = hsl.l;
        
        return {
            '--md-sys-color-primary': ColorUtils.hslToString(h, Math.min(100, s + 15), Math.max(40, Math.min(60, l + 15))),
            '--md-sys-color-on-primary': ColorUtils.hslToString(h, Math.min(100, s + 20), Math.min(20, l - 40)),
            '--md-sys-color-primary-container': ColorUtils.hslToString(h, Math.max(30, s), Math.min(45, l - 15)),
            '--md-sys-color-on-primary-container': ColorUtils.hslToString(h, Math.min(50, s - 20), Math.max(80, l + 30)),
            '--md-sys-color-secondary-container': ColorUtils.hslToString(h, Math.max(15, s - 15), Math.min(30, l - 20)),
            '--md-sys-color-on-secondary-container': ColorUtils.hslToString(h, Math.min(100, s + 30), Math.max(70, l + 20)),
            '--md-sys-color-surface': ColorUtils.hslToString(h, s / 4, 8),
            '--md-sys-color-surface-container': ColorUtils.hslToString(h, s / 3, 12),
            '--md-sys-color-surface-container-high': ColorUtils.hslToString(h, s / 2.5, 18),
            '--island-bg': ColorUtils.hslToString(h, s / 2, 10),
            '--phone-screen-bg': ColorUtils.hslToString(h, s / 3, 5),
            '--player-bg': ColorUtils.hslToString(h, s / 2, l / 3)
        };
    }
};

const CookieUtils = {
    set: (name, value, days = 30) => {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    },
    get: (name) => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    remove: (name) => {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/";
    }
};

const songs = [
    {
        title: "Serafina",
        artist: "Bambi • Highs in the Minuses",
        cover: "https://maxcloud.pages.dev/src/Follow%20YourDream's.jpg",
        src: "https://maxcloud.pages.dev/src/MerOne%20Record's%20-%20Follow%20YourDream's.mp3"
    },
    {
        title: "Ocean Breeze",
        artist: "Chill Vibes • Summer",
        cover: "https://picsum.photos/600/600?random=2",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        title: "Night Drive",
        artist: "Synthwave • Retro",
        cover: "https://picsum.photos/600/600?random=3",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    }
];

let currentSongIndex = 0;
const audio = document.getElementById('audio');
const app = document.getElementById('app');
const island = document.getElementById('island');

const weatherCodeMap = {
    0: { desc: "晴朗", icon: "☀️" }, 1: { desc: "多云", icon: "🌤️" }, 2: { desc: "少云", icon: "⛅" }, 3: { desc: "阴天", icon: "☁️" },
    45: { desc: "雾", icon: "🌫️" }, 48: { desc: "冻雾", icon: "🌫️" }, 51: { desc: "毛毛雨", icon: "🌦️" }, 53: { desc: "中毛毛雨", icon: "🌦️" },
    55: { desc: "大毛毛雨", icon: "🌧️" }, 61: { desc: "小雨", icon: "🌧️" }, 63: { desc: "中雨", icon: "🌧️" }, 65: { desc: "大雨", icon: "🌧️" },
    66: { desc: "冻雨", icon: "🌨️" }, 67: { desc: "冻雨", icon: "🌨️" }, 71: { desc: "小雪", icon: "🌨️" }, 73: { desc: "中雪", icon: "🌨️" },
    75: { desc: "大雪", icon: "❄️" }, 77: { desc: "雪粒", icon: "❄️" }, 80: { desc: "阵雨", icon: "🌧️" }, 81: { desc: "阵雨", icon: "🌧️" },
    82: { desc: "暴雨", icon: "⛈️" }, 85: { desc: "阵雪", icon: "🌨️" }, 86: { desc: "阵雪", icon: "🌨️" },
    95: { desc: "雷暴", icon: "⛈️" }, 96: { desc: "雷暴", icon: "⛈️" }, 99: { desc: "强雷暴", icon: "⛈️" }
};

function init() {
    updateTime();
    setInterval(updateTime, 1000);
    fetchWeather();
    setInterval(fetchWeather, 10 * 60 * 1000);
    island.addEventListener('click', toggleIsland);
}

function updateTime() {
    const now = new Date();
    document.getElementById('islandTime').textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
}

async function fetchWeather() {
    let lat = parseFloat(CookieUtils.get('weather_lat')) || null;
    let lon = parseFloat(CookieUtils.get('weather_lon')) || null;
    
    if (!lat || !lon) {
        if ('geolocation' in navigator) {
            try {
                document.getElementById('locationDisplay').textContent = "定位中...";
                
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { 
                        timeout: 10000,
                        enableHighAccuracy: true,
                        maximumAge: 5 * 60 * 1000
                    });
                });
                
                lat = position.coords.latitude; 
                lon = position.coords.longitude;
                
                CookieUtils.set('weather_lat', lat, 30);
                CookieUtils.set('weather_lon', lon, 30);
                
                document.getElementById('locationDisplay').textContent = "获取位置成功...";
            } catch (e) {
                console.log("无法获取地理位置: ", e.message);
                lat = 39.9042;
                lon = 116.4074;
                document.getElementById('locationDisplay').textContent = "定位失败，使用默认位置";
            }
        } else {
            console.log("浏览器不支持地理定位");
            lat = 39.9042;
            lon = 116.4074;
            document.getElementById('locationDisplay').textContent = "不支持定位，使用默认位置";
        }
    }
    
    try {
        const locationResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`);
        const locationData = await locationResponse.json();
        
        let locationName = "未知位置";
        if (locationData && locationData.city) {
            locationName = locationData.city;
        } else if (locationData && locationData.locality) {
            locationName = locationData.locality;
        } else if (locationData && locationData.principalSubdivision) {
            locationName = locationData.principalSubdivision;
        } else if (locationData && locationData.countryName) {
            locationName = locationData.countryName;
        } else {
            locationName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        }
        
        document.getElementById('locationDisplay').textContent = locationName;
        
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
        const data = await response.json();
        const current = data.current_weather || data.current;
        const daily = data.daily;
        const temp = Math.round(current.temperature_2m);
        const code = current.weather_code;
        const weather = weatherCodeMap[code] || { desc: "未知", icon: "🌡️" };
        
        document.getElementById('islandWeatherTemp').textContent = `${temp}°`;
        document.getElementById('islandWeatherIcon').textContent = weather.icon;
        document.getElementById('detailIcon').textContent = weather.icon;
        document.getElementById('detailTemp').textContent = `${temp}°`;
        document.getElementById('detailDesc').textContent = weather.desc;
        document.getElementById('detailRange').textContent = `H:${Math.round(daily.temperature_2m_max[0])}° L:${Math.round(daily.temperature_2m_min[0])}°`;
        document.getElementById('detailWind').textContent = `💨 ${Math.round(current.wind_speed_10m)}km/h`;
        document.getElementById('detailHumidity').textContent = `💧 ${current.relative_humidity_2m}%`;
    } catch (e) {
        console.error("获取天气数据失败:", e);
        document.getElementById('locationDisplay').textContent = "获取天气失败";
    }
}

function toggleIsland() {
    island.classList.toggle('active');
}

function playSong() {
    audio.play();
    app.classList.add('playing');
    island.classList.remove('active'); 
    document.getElementById('playIcon').innerText = 'pause';
}

function pauseSong() {
    audio.pause();
    app.classList.remove('playing');
    island.classList.remove('active');
    document.getElementById('playIcon').innerText = 'play_arrow';
}

document.getElementById('playBtn').addEventListener('click', () => {
    if (audio.paused) playSong(); else pauseSong();
});

document.getElementById('nextBtn').addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(songs[currentSongIndex]);
    playSong();
});

document.getElementById('prevBtn').addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(songs[currentSongIndex]);
    playSong();
});

function loadSong(song) {
    document.getElementById('mainTitle').innerText = song.title;
    document.getElementById('mainArtist').innerText = song.artist;
    document.getElementById('islandTitle').innerText = song.title;
    document.getElementById('islandArtist').innerText = song.artist.split('•')[0].trim();
    const coverUrl = song.cover;

    // 修复：先绑定事件，再设置 src，确保缓存图片也能触发 onload
    const iCover = document.getElementById('islandCover');
    iCover.classList.add('updating'); 
    
    iCover.onload = () => {
        iCover.classList.remove('updating');
        // 移除 setTimeout，直接应用颜色，确保即时生效
        ColorUtils.extractColorFromUrl(coverUrl, (rgb) => {
            const theme = ColorUtils.generateTheme(rgb);
            for (const [k, v] of Object.entries(theme)) {
                document.documentElement.style.setProperty(k, v);
            }
        });
    };
    iCover.src = coverUrl;

    const mainCover = document.getElementById('mainCover');
    mainCover.onload = () => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: song.artist,
                album: song.artist.split('•')[1]?.trim() || 'Unknown Album',
                artwork: [
                    { src: song.cover, sizes: '96x96', type: 'image/jpeg' },
                    { src: song.cover, sizes: '128x128', type: 'image/jpeg' },
                    { src: song.cover, sizes: '192x192', type: 'image/jpeg' },
                    { src: song.cover, sizes: '256x256', type: 'image/jpeg' },
                    { src: song.cover, sizes: '384x384', type: 'image/jpeg' },
                    { src: song.cover, sizes: '512x512', type: 'image/jpeg' }
                ]
            });
        }
    };
    mainCover.src = coverUrl;
    
    audio.src = song.src;
    
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: song.artist,
            artwork: [{ src: song.cover, sizes: '512x512', type: 'image/jpeg' }]
        });
    }
}

let isDragging = false;
const audioSlider = document.getElementById('audioSlider');
const activeTrack = document.getElementById('activeTrack');
const inactiveTrack = document.getElementById('inactiveTrack');
const sliderThumb = document.getElementById('sliderThumb');

audio.addEventListener('timeupdate', () => {
    const { duration, currentTime } = audio;
    if (isNaN(duration)) return;
    const percent = (currentTime / duration) * 100;
    if (!isDragging) updateUI(percent);
    if (currentTime >= duration) document.getElementById('nextBtn').click();
});

audioSlider.addEventListener('input', () => { isDragging = true; updateUI(audioSlider.value); });
audioSlider.addEventListener('change', () => { isDragging = false; audio.currentTime = (audioSlider.value / 100) * audio.duration; });

function updateUI(percent) {
    percent = isNaN(percent) ? 0 : percent;
    audioSlider.value = percent;
    activeTrack.style.width = percent + "%";
    inactiveTrack.style.left = percent + "%";
    inactiveTrack.style.width = (100 - percent) + "%";
    sliderThumb.style.left = percent + "%";
    const cur = isDragging ? (percent/100)*audio.duration : audio.currentTime;
    document.getElementById('currTime').innerText = isNaN(cur)?"0:00":`${Math.floor(cur/60)}:${String(Math.floor(cur%60)).padStart(2,'0')}`;
    document.getElementById('durTime').innerText = isNaN(audio.duration)?"0:00":`${Math.floor(audio.duration/60)}:${String(Math.floor(audio.duration%60)).padStart(2,'0')}`;
}

if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => playSong());
    navigator.mediaSession.setActionHandler('pause', () => pauseSong());
    navigator.mediaSession.setActionHandler('previoustrack', () => document.getElementById('prevBtn').click());
    navigator.mediaSession.setActionHandler('nexttrack', () => document.getElementById('nextBtn').click());
}

loadSong(songs[currentSongIndex]);
init();
function toggleDrawer() { document.getElementById('drawer').classList.toggle('open'); }