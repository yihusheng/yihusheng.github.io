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

// ── SVG 日弧更新 ──
function updateSunArc(sr,ss){
  var sgd=document.getElementById('sgd'),sd=document.getElementById('sd');
  if(!sgd||!sd)return;
  if(sr!=='--:--'&&ss!=='--:--'){
    var n=new Date(),sh=+sr.split(':')[0],sm=+sr.split(':')[1];
    var eh=+ss.split(':')[0],em=+ss.split(':')[1];
    var st=new Date(n.getFullYear(),n.getMonth(),n.getDate(),sh,sm);
    var et=new Date(n.getFullYear(),n.getMonth(),n.getDate(),eh,em);
    var tot=et-st,elp=n-st;
    if(tot>0){
      var p=Math.min(1,Math.max(0,elp/tot));
      var x=12+p*216; // arcLeft=12, arcWidth=216
      var y=46-34*Math.sin(p*Math.PI); // arcHeight=34
      sgd.setAttribute('cx',x);sgd.setAttribute('cy',y);sgd.setAttribute('opacity','1');
      sd.setAttribute('cx',x);sd.setAttribute('cy',y);sd.setAttribute('opacity','1');
      return;
    }
  }
  sgd.setAttribute('opacity','0');sd.setAttribute('opacity','0');
}

// ── SVG 月相更新 ──
function updateMoonArc(mr,ms){
  var mgd=document.getElementById('mgd'),md=document.getElementById('md');
  if(!mgd||!md)return;
  if(mr!=='--:--'&&ms!='--:--'){
    var n=new Date();
    var mrh=+mr.split(':')[0],mrm=+mr.split(':')[1];
    var msh=+ms.split(':')[0],msm=+ms.split(':')[1];
    var mrt=new Date(n.getFullYear(),n.getMonth(),n.getDate(),mrh,mrm);
    var mst=new Date(n.getFullYear(),n.getMonth(),n.getDate(),msh,msm);
    var tot=mst-mrt,elp=n-mrt;
    if(tot>0){
      var p=Math.min(1,Math.max(0,elp/tot));
      var x=12+p*216,y=46-34*Math.sin(p*Math.PI);
      mgd.setAttribute('cx',x);mgd.setAttribute('cy',y);mgd.setAttribute('opacity','1');
      md.setAttribute('cx',x);md.setAttribute('cy',y);md.setAttribute('opacity','1');
      return;
    }
  }
  mgd.setAttribute("opacity","0");md.setAttribute("opacity","0");
}

// ── 月升月落计算（近似值，基于月相推算）──
function calcMoonTimes(sr,ss){
  var mr=document.getElementById('weatherMoonrise'),ms=document.getElementById('weatherMoonset');
  var row=document.getElementById('moonTimesRow');
  if(!mr||!ms||!row)return;
  // 月相数值
  var n=new Date(),lm=29.53058867;
  var kn=Date.UTC(2000,0,6,18,14,0);
  var dd=(n.getTime()-kn)/86400000;
  var age=((dd%lm)+lm)%lm;
  var phase=age/lm; // 0~1
  // 月升≈ 日出 + phase*12h（近似），月落≈ 月升 + 12h
  var sh=+sr.split(':')[0]||6,eh=+ss.split(':')[0]||18;
  var mriseH=Math.floor((sh+phase*12)%24);
  var mriseM=Math.floor((phase*12%1)*60);
  var msetH=Math.floor((mriseH+12)%24);
  var msetM=mriseM;
  var mrStr=String(mriseH).padStart(2,'0')+':'+String(mriseM).padStart(2,'0');
  var msStr=String(msetH).padStart(2,'0')+':'+String(msetM).padStart(2,'0');
  mr.textContent=mrStr; ms.textContent=msStr;
  row.style.display='flex';
  updateMoonArc(mrStr,msStr);
}

loadMusicList().then(init);
