/**
 * ═══════════════════════════════════════════════════════════════
 *  Wise Navbar — yihusheng 网站统一导航栏
 *  
 *  【核心理念】所有导航数据集中在此文件顶部的 NAV_ITEMS 数组中。
 *  无论哪个页面引用此脚本，都会自动读取该数组生成导航栏。
 *  
 *  【维护方式】后续只需修改下方的 NAV_ITEMS 数组，添加/删除/修改
 *  导航条目，所有引用此脚本的页面都会同步更新，无需逐个页面修改。
 *  
 *  导航数据通过 window.WiseNavbarData 暴露给全局，
 *  主页底部抽屉读取此数据动态渲染导航卡片。
 *  
 *  【使用方法】在任意页面的 <head> 中引入：
 *    <link rel="stylesheet" href="/Tools/navbar.css">
 *    <script src="/Tools/navbar.js"></script>
 *  
 *  【样式说明】导航栏为右下角悬浮双按钮：
 *    - 左侧：主页按钮（房子图标）
 *    - 右侧：菜单按钮（点击打开导航抽屉）
 *  两个按钮保持相同风格（墨底+绿字）。
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────
     ★★★ 导航数据 — 修改这里 = 更新所有页面 ★★★
     ──────────────────────────────────────────────
     格式：{ icon, label, href }
     icon: Material Symbols Rounded 图标名
     label: 显示文字
     href: 链接路径（从根目录 / 开始）
  */
  const NAV_ITEMS = [
    { icon: 'home',             label: '首页',      href: '/' },
    { icon: 'calculate',        label: 'Double',    href: '/Tools/Double/' },
    { icon: 'lan',              label: 'MAC Info',  href: '/Tools/MAC/' },
    { icon: 'format_underlined',label: 'Underline', href: '/Tools/Underline/' },
    { icon: 'functions',        label: 'Calculator', href: '/Tools/Content%20Calculator/' },
    { icon: 'open_in_new',      label: 'JumpTools', href: '/Tools/JumpTools/' },
    { icon: 'music_note',       label: 'Music',     href: '/Music/' },
    { icon: 'dashboard',        label: 'zashboard', href: '/Tools/zashboard/' },
    { icon: 'dashboard',        label: 'Metacubexd', href: '/Tools/Metacubexd/' },
  ];

  /* ──────────────────────────────────────────────
     暴露数据给外部使用（如主页底部抽屉）
     ────────────────────────────────────────────── */
  window.WiseNavbarData = NAV_ITEMS.slice();

  /* ══════════════════════════════════════════════
     内部逻辑 — 通常无需修改
     ══════════════════════════════════════════════ */

  // 自动注入 Material Symbols Rounded 字体
  function injectFonts() {
    if (document.querySelector('link[href*="Material+Symbols+Rounded"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0';
    document.head.appendChild(link);
  }

  // 获取当前页面路径（标准化）
  function getCurrentPath() {
    let p = window.location.pathname;
    p = p.replace(/\/index\.html$/, '');
    p = p.replace(/\/+$/, '');
    return p || '/';
  }

  // 判断是否为首页
  function isHomePage() {
    return getCurrentPath() === '/';
  }

  // 判断某项是否匹配当前页面
  function isActive(itemHref) {
    const cur = getCurrentPath();
    const target = itemHref.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';
    if (cur === target) return true;
    if (target !== '/' && cur.startsWith(target)) return true;
    return false;
  }

  // 生成悬浮导航栏 HTML
  function buildHTML() {
    const drawerLinks = NAV_ITEMS.map(item => {
      const act = isActive(item.href) ? ' active' : '';
      return `<a class="wise-nav-drawer-link${act}" href="${item.href}">
        <span class="nv-icon material-symbols-rounded">${item.icon}</span>
        ${item.label}
      </a>`;
    }).join('');

    return `
<!-- Wise Floating Navbar -->
<nav class="wise-navbar" id="wiseNavbar" role="navigation" aria-label="导航">
  <a class="wise-nav-btn" href="/" aria-label="回到首页">
    <span class="material-symbols-rounded">home</span>
  </a>
  <div class="wise-nav-divider"></div>
  <button class="wise-nav-btn" id="wiseNavToggle" aria-label="打开导航菜单" aria-expanded="false">
    <span class="material-symbols-rounded">apps</span>
  </button>
</nav>

<div class="wise-nav-drawer" id="wiseNavDrawer" aria-hidden="true">
  <div class="wise-nav-drawer-panel">
    <div class="wise-nav-drawer-header">
      <span class="wise-nav-drawer-title">导航菜单</span>
      <button class="wise-nav-drawer-close" id="wiseNavDrawerClose" aria-label="关闭导航菜单">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    ${drawerLinks}
  </div>
</div>`;
  }

  // 注入导航栏到页面（仅非首页调用）
  function inject() {
    if (document.getElementById('wiseNavbar')) return;

    injectFonts();
    document.body.insertAdjacentHTML('beforeend', buildHTML());
    // 悬浮按钮不需要 padding
  }

  // 绑定交互事件（仅非首页调用）
  function bindEvents() {
    const toggle = document.getElementById('wiseNavToggle');
    const drawer = document.getElementById('wiseNavDrawer');
    const close  = document.getElementById('wiseNavDrawerClose');
    if (!toggle || !drawer) return;

    function open() {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', e => {
      e.stopPropagation();
      drawer.classList.contains('open') ? closeDrawer() : open();
    });
    if (close) close.addEventListener('click', closeDrawer);
    drawer.addEventListener('click', e => { if (e.target === drawer) closeDrawer(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
    drawer.querySelectorAll('.wise-nav-drawer-link').forEach(el => {
      el.addEventListener('click', closeDrawer);
    });
  }

  // 启动（仅非首页调用）
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => { inject(); bindEvents(); });
    } else {
      inject();
      bindEvents();
    }
  }

  /* ══════════════════════════════════════════════
     入口：首页只暴露数据，不注入导航栏
     其他页面自动注入悬浮双按钮导航
     ══════════════════════════════════════════════ */
  if (!isHomePage()) {
    init();
  }
  // 首页：仅通过 window.WiseNavbarData 暴露数据
})();
