/**
 * Cloudflare Pages Middleware — 在边缘层注入导航栏
 * 
 * 拦截 Metacubexd / zashboard 的 HTML 响应，实时注入导航栏，
 * 不修改任何源文件。同时注入 Service Worker 注销脚本，
 * 解决 PWA 缓存导致导航栏消失的问题。
 */
const NAV_HTML = `<a class="wise-nav-btn wise-nav-btn-home" href="/" aria-label="回到首页"><span class="material-symbols-rounded">home</span></a><button class="wise-nav-btn wise-nav-btn-menu" id="wiseNavToggle" aria-label="打开导航菜单" aria-expanded="false"><span class="material-symbols-rounded">apps</span></button><div class="wise-nav-drawer" id="wiseNavDrawer" aria-hidden="true"><div class="wise-nav-drawer-panel"><div class="wise-nav-drawer-header"><span class="wise-nav-drawer-title">导航菜单</span><button class="wise-nav-drawer-close" id="wiseNavDrawerClose" aria-label="关闭导航菜单"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div></div></div>`;

const NAV_HEAD = `<!-- wise-navbar --><link rel="stylesheet" href="/Tools/navbar.css"><script src="/Tools/navbar.js"></script>`;

const SW_UNREGISTER = `<script>if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){if(x.scope.includes('Metacubexd')){x.unregister();console.log('[navbar] SW unregistered:',x.scope)}})})}</script>`;

const ASSET_EXTS = new Set(['js','css','png','jpg','jpeg','svg','ico','webp','woff','woff2','ttf','json','webmanifest','xml','txt','gz','tgz','zip','map']);

function isDashboard(path) {
  return path.startsWith('/Tools/Metacubexd') || path.startsWith('/Tools/zashboard');
}

function isAssetPath(path) {
  const ext = path.split('.').pop()?.toLowerCase();
  return ext && ASSET_EXTS.has(ext);
}

class HeadHandler {
  element(el) {
    el.prepend(NAV_HEAD, { html: true });
    el.append(SW_UNREGISTER, { html: true });
  }
}

class BodyHandler {
  element(el) {
    const cls = el.getAttribute('class') || '';
    el.setAttribute('class', (cls + ' navbar-overlay').trim());
    el.prepend(NAV_HTML, { html: true });
  }
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  if (!isDashboard(path)) return next();
  if (isAssetPath(path)) return next();

  const response = await next();
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return response;

  return new HTMLRewriter()
    .on('head', new HeadHandler())
    .on('body', new BodyHandler())
    .transform(response);
}
