// ── 国际化 (i18n) ──
const LANG_KEY = 'lang';
const FALLBACK_LANG = 'zh';

// 外部注入 CookieUtils（避免循环依赖）
let _cookieUtils = null;
export function setCookieUtils(cu) { _cookieUtils = cu; }

const strings = {
  zh: {
    // 播放器
    '暂无歌曲': '暂无歌曲',
    '请添加 .mp3 文件到 public/music 目录': '请添加 .mp3 文件到 public/music 目录',
    '歌曲加载失败，请刷新重试': '歌曲加载失败，请刷新重试',
    '歌曲加载失败，请检查文件或网络': '歌曲加载失败，请检查文件或网络',
    '暂无歌词': '暂无歌词',
    '歌词加载中...': '歌词加载中...',
    '音乐列表加载失败，请检查网络': '音乐列表加载失败，请检查网络',
    '加载中...': '加载中...',
    // 抽屉
    '音乐': '音乐',
    '工具': '工具',
    '主题': '主题',
    '关于': '关于',
    '设置': '设置',
    '位置': '位置',
    '定位中...': '定位中...',
    '位置获取失败': '位置获取失败',
    '已加载 {n} 首歌曲': '已加载 {n} 首歌曲',
    '{n} 首': '{n} 首',
    '默认': '默认',
    '深色': '深色',
    '浅色': '浅色',
    '键盘快捷键': '键盘快捷键',
    '空格: 播放/暂停  ← → : 切换歌曲': '空格: 播放/暂停  ← → : 切换歌曲',
    // 季节
    '春': '春',
    '夏': '夏',
    '秋': '秋',
    '冬': '冬',
  },
  en: {
    '暂无歌曲': 'No songs available',
    '请添加 .mp3 文件到 public/music 目录': 'Add .mp3 files to public/music',
    '歌曲加载失败，请刷新重试': 'Failed to load songs, please refresh',
    '歌曲加载失败，请检查文件或网络': 'Failed to load song, check file or network',
    '暂无歌词': 'No lyrics',
    '歌词加载中...': 'Loading lyrics...',
    '音乐列表加载失败，请检查网络': 'Failed to load music list, check network',
    '加载中...': 'Loading...',
    '音乐': 'Music',
    '工具': 'Tools',
    '主题': 'Theme',
    '关于': 'About',
    '设置': 'Settings',
    '位置': 'Location',
    '定位中...': 'Locating...',
    '位置获取失败': 'Location failed',
    '已加载 {n} 首歌曲': '{n} songs loaded',
    '{n} 首': '{n} songs',
    '默认': 'Default',
    '深色': 'Dark',
    '浅色': 'Light',
    '键盘快捷键': 'Keyboard Shortcuts',
    '空格: 播放/暂停  ← → : 切换歌曲': 'Space: Play/Pause  ← → : Prev/Next',
    '春': 'Spr',
    '夏': 'Sum',
    '秋': 'Aut',
    '冬': 'Win',
  },
};

export function t(key) {
  const lang = getLang();
  return strings[lang]?.[key] || strings[FALLBACK_LANG]?.[key] || key;
}

export function tpl(key, vars) {
  let str = t(key);
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace('{' + k + '}', v);
  }
  return str;
}

export function getLang() {
  return document.documentElement.lang || _cookieUtils?.get(LANG_KEY) || FALLBACK_LANG;
}

export function setLang(lang) {
  document.documentElement.lang = lang;
  _cookieUtils?.set(LANG_KEY, lang, 365);
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
}

export function initI18n() {
  // Restore saved language
  const saved = _cookieUtils?.get(LANG_KEY);
  if (saved) {
    document.documentElement.lang = saved;
  }
  // Apply translations to static elements
  setLang(getLang());
}
