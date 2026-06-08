/* ═══════════════════════════════════════════
   Wise Navbar — 统一工具导航栏 (JavaScript)
   用法：在工具页面的 <head> 中引入此脚本，
   然后调用 WiseNavbar.init()
   ═══════════════════════════════════════════ */

const WiseNavbar = (() => {
  // ── 工具菜单配置 ──
  const tools = [
    { id: 'dashboard',  label: '主页',     icon: '⌂',  path: '/' },
    { id: 'double',     label: 'Double',   icon: '⨯',  path: '/Tools/Double/' },
    { id: 'mac',        label: 'MAC',      icon: '⊞',  path: '/Tools/MAC/' },
    { id: 'underline',  label: 'Underline',icon: '▭',  path: '/Tools/Underline/' },
    { id: 'calculator', label: '計算器',   icon: '∑',  path: '/Tools/Content%20Calculator/' },
    { id: 'jumptools',  label: '跳转',     icon: '↗',  path: '/Tools/JumpTools/' },
    { id: 'zashboard',  label: 'zashboard',icon: '◉',  path: '/Tools/zashboard/' },
    { id: 'metacubexd', label: 'MetaCubeXD',icon: '◆', path: '/Tools/Metacubexd/' },
    { id: 'music',      label: '音乐解锁', icon: '♪',  path: '/Music/' },
  ];

  // ── 判断当前页面 ID ──
  function getCurrentPageId() {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    for (const t of tools) {
      const tPath = t.path.replace(/\/+$/, '') || '/';
      if (path === tPath) return t.id;
    }
    // 模糊匹配
    for (const t of tools) {
      const tPath = t.path.replace(/\/+$/, '');
      if (tPath && path.startsWith(tPath)) return t.id;
    }
    return 'dashboard';
  }

  // ── 构建 Navbar HTML ──
  function buildHTML(currentId) {
    const isOverlay = currentId === 'zashboard' || currentId === 'metacubexd';

    let linksHTML = '';
    for (const t of tools) {
      const active = t.id === currentId ? ' class="active"' : '';
      linksHTML += `<a href="${t.path}"${active}><span class="nv-icon">${t.icon}</span> ${t.label}</a>`;
    }

    let drawerLinksHTML = '';
    for (const t of tools) {
      const active = t.id === currentId ? ' class="active"' : '';
      drawerLinksHTML += `<a href="${t.path}"${active}><span class="nv-icon">${t.icon}</span> ${t.label}</a>`;
    }

    return `
<nav class="wise-navbar${isOverlay ? ' wise-navbar-overlay' : ''}" id="wiseNavbar">
  <div class="wise-navbar-inner">
    <a href="/" class="wise-nav-logo">
      <span class="wise-nav-logo-icon">W</span>
      Tools
    </a>
    <div class="wise-nav-links">
      ${linksHTML}
    </div>
    <button class="wise-nav-toggle" id="wiseNavToggle" aria-label="打开导航菜单">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="4" y1="6" x2="20" y2="6"/>
        <line x1="4" y1="12" x2="20" y2="12"/>
        <line x1="4" y1="18" x2="20" y2="18"/>
      </svg>
    </button>
  </div>
</nav>

<div class="wise-nav-drawer" id="wiseNavDrawer">
  <div class="wise-nav-drawer-panel">
    <div class="wise-nav-drawer-header">
      <span class="wise-nav-drawer-title">📋 导航菜单</span>
      <button class="wise-nav-drawer-close" id="wiseNavDrawerClose" aria-label="关闭菜单">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    ${drawerLinksHTML}
  </div>
</div>`;
  }

  // ── 注入 Navbar ──
  function inject() {
    if (document.getElementById('wiseNavbar')) return; // 避免重复注入

    const currentId = getCurrentPageId();
    const html = buildHTML(currentId);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.prepend(wrapper);

    // ── 绑定事件 ──
    const toggle = document.getElementById('wiseNavToggle');
    const drawer = document.getElementById('wiseNavDrawer');
    const closeBtn = document.getElementById('wiseNavDrawerClose');

    if (toggle && drawer) {
      toggle.addEventListener('click', () => drawer.classList.add('open'));
    }
    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
    }
    if (drawer) {
      drawer.addEventListener('click', (e) => {
        if (e.target === drawer) drawer.classList.remove('open');
      });
    }

    // ── 如果是 SPA 类型页面，追加 overlay class ──
    if (currentId === 'zashboard' || currentId === 'metacubexd') {
      document.body.classList.add('navbar-overlay');
    }
  }

  // ── 初始化（DOM 就绪后自动执行） ──
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  }

  return { init };
})();

// 自动初始化
WiseNavbar.init();
