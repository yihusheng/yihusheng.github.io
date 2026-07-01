// ── 天气模块（weather）──
import { CookieUtils, ColorUtils } from './utils.js';

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

export function updateThemeColor() { var c=getComputedStyle(document.documentElement).getPropertyValue('--phone-screen-bg').trim(); if(c) themeColorMeta.setAttribute('content',c); }
export function updateTime() { var n=new Date(); document.getElementById('islandTime').textContent = String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0'); }

async function getLocationByIP() {
  try { var r=await fetch('https://ipapi.co/json/',{signal:AbortSignal.timeout(4000)}); if(r.ok){ var d=await r.json(); if(d.latitude&&d.longitude) return {lat:d.latitude,lon:d.longitude,city:d.city||d.city||''}; } } catch(e){}
  try { var r=await fetch('https://ip-api.com/json/?fields=status,lat,lon,city',{signal:AbortSignal.timeout(4000)}); if(r.ok){ var d=await r.json(); if(d.status==='success') return {lat:d.lat,lon:d.lon,city:d.city||''}; } } catch(e2){}
  try { var r=await fetch('https://ipinfo.io/json',{signal:AbortSignal.timeout(4000)}); if(r.ok){ var d=await r.json(); if(d.loc){ var p=d.loc.split(','); return {lat:parseFloat(p[0]),lon:parseFloat(p[1]),city:d.city||d.region||''}; } } } catch(e3){}
  return null;
}

export async function fetchWeather() {
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
        else{ lat=null;lon=null; } // 全失败则跳过天气更新
      }
    } else {
      var ip=await getLocationByIP();
      if(ip){lat=ip.lat;lon=ip.lon;locName=ip.city;CookieUtils.set('weather_lat',lat,30);CookieUtils.set('weather_lon',lon,30);}
      else{ lat=null;lon=null; }
    }
  }
  if(lat==null||lon==null){ document.getElementById('locationDisplay').textContent='位置获取失败，请检查网络或允许定位'; return; }
  try {
    if(!locName){ try { var l=await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude='+lat+'&longitude='+lon+'&localityLanguage=zh',{signal:AbortSignal.timeout(5000)}); var ld=await l.json(); locName=ld.city||ld.locality||ld.principalSubdivision||ld.countryName||lat.toFixed(2)+', '+lon.toFixed(2); } catch(e){locName='未知位置';} }
    if(!document.getElementById('locationDisplay').textContent.includes('默认')) document.getElementById('locationDisplay').textContent=locName;
    var wr=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,cloud_cover,precipitation&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=1',{signal:AbortSignal.timeout(8000)});
    var d=await wr.json(); var c=d.current||d.current_weather, da=d.daily, tz=d.timezone||'';
    var t=Math.round(c.temperature_2m), fl=Math.round(c.apparent_temperature||t), cd=c.weather_code, w=weatherCodeMap[cd]||{d:'未知',i:'thermostat',b:'#1a1c18'};
    document.getElementById('islandWeatherTemp').textContent=t+'\u00b0'; document.getElementById('islandWeatherIcon').textContent=w.i;
    document.getElementById('detailIcon').textContent=w.i; document.getElementById('detailTemp').textContent=t+'\u00b0';
    document.getElementById('detailDesc').textContent=w.d+(isNaN(fl)||fl===t?'':' (体感 '+fl+'\u00b0)');
    document.getElementById('detailRange').textContent='H:'+Math.round(da.temperature_2m_max[0])+'\u00b0 L:'+Math.round(da.temperature_2m_min[0])+'\u00b0';
    document.getElementById('detailWind').innerHTML='<span class="material-symbols-rounded">air</span> '+Math.round(c.wind_speed_10m)+'km/h';
    document.getElementById('detailHumidity').innerHTML='<span class="material-symbols-rounded">water_drop</span> '+c.relative_humidity_2m+'%';
    document.documentElement.style.setProperty('--island-expand-bg',w.b);
    var sunriseStr='--:--',sunsetStr='--:--';
    if(da.sunrise&&da.sunrise[0]){ var sr=new Date(da.sunrise[0]); sunriseStr=String(sr.getHours()).padStart(2,'0')+':'+String(sr.getMinutes()).padStart(2,'0'); document.getElementById('weatherSunrise').textContent=sunriseStr; document.getElementById('weatherSunriseSmall').textContent=sunriseStr; }
    if(da.sunset&&da.sunset[0]){ var ss=new Date(da.sunset[0]); sunsetStr=String(ss.getHours()).padStart(2,'0')+':'+String(ss.getMinutes()).padStart(2,'0'); document.getElementById('weatherSunset').textContent=sunsetStr; document.getElementById('weatherSunsetSmall').textContent=sunsetStr; }
    var mp=getMoonPhase(new Date()); document.getElementById('weatherMoonPhase').textContent=mp; document.getElementById('weatherMoonPhaseSmall').textContent=mp.replace(/[\uD800-\uDFFF]/g,'').trim() || mp;
    updateSunArc(sunriseStr||'--:--',sunsetStr||'--:--');
    calcMoonTimes(sunriseStr,sunsetStr);
  } catch(e) { console.error(e); if(!document.getElementById('locationDisplay').textContent.includes('失败')) document.getElementById('locationDisplay').textContent='天气获取失败'; }
}

function getMoonPhase(date) {
  var knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
  var lunarMonth = 29.53058867;
  var diffDays = (date.getTime() - knownNewMoon) / 86400000;
  var age = ((diffDays % lunarMonth) + lunarMonth) % lunarMonth;
  var phase = age / lunarMonth;
  if (phase < 0.025 || phase > 0.975) return '\uD83C\uDF11 新月';
  if (phase < 0.175) return '\uD83C\uDF12 蛾眉月';
  if (phase < 0.325) return '\uD83C\uDF13 上弦月';
  if (phase < 0.475) return '\uD83C\uDF14 盈凸月';
  if (phase < 0.525) return '\uD83C\uDF15 满月';
  if (phase < 0.675) return '\uD83C\uDF16 亏凸月';
  if (phase < 0.825) return '\uD83C\uDF17 下弦月';
  return '\uD83C\uDF18 残月';
}

function updateSunArc(sunriseStr, sunsetStr) {
  try {
    var sunSvg = document.getElementById('sunSvg');
    if (!sunSvg) return;
    var now = new Date();
    var srParts = sunriseStr.split(':');
    var ssParts = sunsetStr.split(':');
    var srMin = parseInt(srParts[0],10)*60 + parseInt(srParts[1],10);
    var ssMin = parseInt(ssParts[0],10)*60 + parseInt(ssParts[1],10);
    var nowMin = now.getHours()*60 + now.getMinutes();
    if (ssMin <= srMin) return;
    var progress = Math.max(0, Math.min(1, (nowMin - srMin) / (ssMin - srMin)));
    var cx = 12 + progress * 216;
    var cy = 46 - (1 - Math.pow(2*progress - 1, 2)) * 34;
    var sd = document.getElementById('sd');
    var sgd = document.getElementById('sgd');
    if (sd) { sd.setAttribute('cx', cx); sd.setAttribute('cy', cy); sd.setAttribute('opacity', '1'); }
    if (sgd) { sgd.setAttribute('cx', cx); sgd.setAttribute('cy', cy); sgd.setAttribute('opacity', '0.8'); }
  } catch(e) {}
}

function calcMoonTimes(sunriseStr, sunsetStr) {
  try {
    var mr = document.getElementById('weatherMoonrise');
    var ms = document.getElementById('weatherMoonset');
    var mt = document.getElementById('moonTimesRow');
    if (!mr || !ms) return;
    var mrStr = '--:--', msStr = '--:--';
    if (sunsetStr && sunsetStr !== '--:--') {
      var ss = sunsetStr.split(':');
      var mrH = (parseInt(ss[0],10) + 1) % 24;
      mrStr = String(mrH).padStart(2,'0') + ':' + ss[1];
      mr.textContent = mrStr;
    }
    if (sunriseStr && sunriseStr !== '--:--') {
      var sr = sunriseStr.split(':');
      var msH = (parseInt(sr[0],10) - 1 + 24) % 24;
      msStr = String(msH).padStart(2,'0') + ':' + sr[1];
      ms.textContent = msStr;
    }
    if (mt) mt.style.display = 'flex';
    // 更新月亮位置弧
    updateMoonArc(mrStr, msStr);
  } catch(e) {}
}

function updateMoonArc(moonriseStr, moonsetStr) {
  try {
    var moonSvg = document.getElementById('moonArcSvg');
    if (!moonSvg) return;
    var now = new Date();
    if (moonriseStr === '--:--' || moonsetStr === '--:--') return;
    var mrParts = moonriseStr.split(':');
    var msParts = moonsetStr.split(':');
    if (mrParts.length < 2 || msParts.length < 2) return;
    var mrMin = parseInt(mrParts[0],10)*60 + parseInt(mrParts[1],10);
    var msMin = parseInt(msParts[0],10)*60 + parseInt(msParts[1],10);
    var nowMin = now.getHours()*60 + now.getMinutes();
    // 如果月落 < 月升，表示跨天（月落是次日凌晨）
    var progress;
    if (msMin <= mrMin) {
      // 跨天：当前在月升前（夜间）或月落后（凌晨）
      if (nowMin >= mrMin) {
        // 月升后，跨天到次日月落
        progress = Math.max(0, Math.min(1, (nowMin - mrMin) / (msMin + 1440 - mrMin)));
      } else {
        // 还没月升（次日凌晨），在次日月升前
        progress = 0;
      }
    } else {
      progress = Math.max(0, Math.min(1, (nowMin - mrMin) / (msMin - mrMin)));
    }
    var cx = 12 + progress * 216;
    var cy = 46 - (1 - Math.pow(2*progress - 1, 2)) * 34 - 6;
    var md = document.getElementById('md');
    var mgd = document.getElementById('mgd');
    if (md) { md.setAttribute('cx', cx); md.setAttribute('cy', cy); md.setAttribute('opacity', '1'); }
    if (mgd) { mgd.setAttribute('cx', cx); mgd.setAttribute('cy', cy); mgd.setAttribute('opacity', '0.8'); }
  } catch(e) {}
}
