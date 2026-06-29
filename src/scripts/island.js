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
