/**
 * Cloudflare Pages Middleware — 在边缘层实时注入导航栏
 *
 * 拦截 Metacubexd / zashboard 的 HTML 响应，使用 HTMLRewriter
 * 注入导航栏 HTML/CSS/JS，同时注销 Service Worker 打破 PWA 缓存。
 *
 * 【为什么不用静态注入？】
 * Metacubexd 的 SW 会 precache index.html 并通过 NavigationRoute
 * 劫持所有导航请求，导致无论怎么改源文件，刷新时都返回旧缓存。
 * 边缘注入确保每次响应都是最新的。
 */

// ── 导航栏静态 HTML（不含抽屉链接，由 navbar.js 动态填充）──
const NAV_HTML = [
  '<a class="wise-nav-btn wise-nav-btn-home" href="/" aria-label="回到首页">',
  '<span class="material-symbols-rounded">home</span></a>',
  '<button class="wise-nav-btn wise-nav-btn-menu" id="wiseNavToggle" aria-label="打开导航菜单" aria-expanded="false">',
  '<span class="material-symbols-rounded">apps</span></button>',
  '<div class="wise-nav-drawer" id="wiseNavDrawer" aria-hidden="true">',
  '<div class="wise-nav-drawer-panel">',
  '<div class="wise-nav-drawer-header">',
  '<span class="wise-nav-drawer-title">导航菜单</span>',
  '<button class="wise-nav-drawer-close" id="wiseNavDrawerClose" aria-label="关闭导航菜单">',
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">',
  '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  '</svg></button></div></div></div>',
].join('');

// ── 注入到 <head> 的内容 ──
const HEAD_INJECT = [
  '<!-- wise-navbar -->',
  '<link rel="stylesheet" href="/Tools/navbar.css">',
  '<script src="/Tools/navbar.js"><\/script>',
  '<script>',
  '/* 注销 Metacubexd 的 Service Worker，打破 PWA 缓存 */',
  'if("serviceWorker" in navigator){',
  'navigator.serviceWorker.getRegistrations().then(function(regs){',
  'regs.forEach(function(reg){',
  'if(reg.scope.includes("Metacubexd")){',
  'reg.unregister().then(function(s){',
  'console.log("[navbar] SW unregistered:",reg.scope,s)',
  '})',
  '}',
  '})',
  '})}',
  '<\/script>',
].join('\n');

// ── 非 HTML 资源扩展名 ──
const SKIP_EXTS = new Set([
  'js','mjs','css','png','jpg','jpeg','gif','svg','ico','webp',
  'woff','woff2','ttf','eot','json','webmanifest','xml','txt',
  'map','gz','tgz','zip','pdf','mp4','webm',
]);

// ── 需要注入的路径前缀 ──
const TARGET_PATHS = ['/Tools/Metacubexd', '/Tools/zashboard'];

function shouldTransform(pathname) {
  // 只处理 dashboard 路径
  if (!TARGET_PATHS.some(p => pathname.startsWith(p))) return false;
  // 跳过静态资源
  const ext = pathname.split('.').pop()?.toLowerCase();
  if (ext && SKIP_EXTS.has(ext)) return false;
  return true;
}

class NavbarHeadHandler {
  element(el) {
    el.prepend(HEAD_INJECT, { html: true });
  }
}

class NavbarBodyHandler {
  element(el) {
    // 添加 navbar-overlay 类
    const cls = (el.getAttribute('class') || '').trim();
    const newCls = cls.includes('navbar-overlay') ? cls : ('navbar-overlay ' + cls).trim();
    el.setAttribute('class', newCls);
    // 注入导航栏 HTML
    el.prepend(NAV_HTML, { html: true });
  }
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  if (!shouldTransform(url.pathname)) {
    return next();
  }

  const response = await next();

  // 仅处理 HTML 响应
  const ct = (response.headers.get('content-type') || '').toLowerCase();
  if (!ct.includes('text/html') && !ct.includes('text/plain')) {
    return response;
  }

  try {
    return new HTMLRewriter()
      .on('head', new NavbarHeadHandler())
      .on('body', new NavbarBodyHandler())
      .transform(response);
  } catch (e) {
    console.error('[navbar] transform error:', e);
    return response;
  }
}
