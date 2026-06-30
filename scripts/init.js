// ── 应用入口 ──
import './drawer.js'; // 侧效加载：渲染抽屉 + 事件绑定
import { updateTime, fetchWeather, updateThemeColor } from './weather.js';
import { loadMusicList, loadBingWallpaper } from './player.js';
import { initIsland } from './island.js';

// 天气 & 时间
updateTime(); setInterval(updateTime, 1e3);
fetchWeather(); setInterval(fetchWeather, 6e5);
updateThemeColor();

// 壁纸
loadBingWallpaper();
window.addEventListener('resize', function(){ if (window.innerWidth >= 768) loadBingWallpaper(); });

// 灵动岛
initIsland();

// 音乐（不阻塞 UI）
loadMusicList();
