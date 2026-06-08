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
 *  【使用方法】在任意页面的 <head> 中引入：
 *    <link rel="stylesheet" href="/Tools/navbar.css">
 *    <script src="/Tools/navbar.js"></script>
 *  
 *  对于全屏 SPA（如 zashboard / Metacubexd），给 <body> 添加
 *  class="navbar-overlay" 即可切换为半透明覆盖模式。
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────
     ★★★ 导航数据 — 修改这里 = 更新所有页面 ★★★
     ──────────────────────────────────────────────
     格式：{ icon, label, href }
     icon: Material Symbols Rounded 图标名（完整列表见 Google Fonts）
     label: 显示文字
     href: 链接路径（从根目录 / 开始）
  */
  const NAV_ITEMS = [
    { icon: 'home',        label: '首页',      href: '/' },
    { icon: 'calculate',   label: 'Double',    href: '/Tools/Double/' },
    { icon: 'lan',         label: 'MAC Info',  href: '/Tools/MAC/' },
    { icon: 'underline',   label: 'Underline', href: '/Tools/Underline/' },
    { icon: 'functions',   label: 'Calculator', href: '/Tools/Content%20Calculator/' },
    { icon: 'open_in_new', label: 'JumpTools', href: '/Tools/JumpTools/' },
    { icon: 'music_note',  label: 'Music',     href: '/Music/' },
    { icon: 'dashboard',   label: 'zashboard', href: '/Tools/zashboard/' },
    { icon: 'dashboard',   label: 'Metacubexd', href: '/Tools/Metacubexd/' },
  ];

  /* ──────────────────────────────────────────────
     网站配置
     ────────────────────────────────────────────── */
  const SITE = {
    name: 'yihusheng',
    short: 'Y',
  };

  /* ══════════════════════════════════════════════
     内部逻辑 — 通常无需修改
     ══════════════════════════════════════════════ */

  // 获取当前页面路径（标准化）
  function getCurrentPath() {
    let p = window.location.pathname;
    p = p.replace(/\/index\.html$/, '');   // 去掉 index.html
    p = p.replace(/\/+$/, '');             // 去掉末尾斜杠
    return p || '/';
  }

  // 判断某项是否匹配当前页面
  function isActive(itemHref) {
    const cur = getCurrentPath();
    const target = itemHref.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';
    if (cur === target) return true;
    // 对于非首页，支持路径前缀匹配（如 /Tools/Double/xxx 也匹配 Double）
    if (target !== '/' && cur.startsWith(target)) return true;
    return false;
  }

  // 生成导航栏 HTML
  function buildHTML() {
    const isOverlay = document.body.classList.contains('navbar-overlay');

    // 桌面端链接
    const links = NAV_ITEMS.map(item => {
      const act = isActive(item.href) ? ' active' : '';
      return `<a class="wise-nav-link${act}" href="${item.href}">
        <span class="nv-icon material-symbols-rounded">${item.icon}</span>
        ${item.label}
      </a>`;
    }).join('');

    // 移动端抽屉链接
    const drawerLinks = NAV_ITEMS.map(item => {
      const act = isActive(item.href) ? ' active' : '';
      return `<a class="wise-nav-drawer-link${act}" href="${item.href}">
        <span class="nv-icon material-symbols-rounded">${item.icon}</span>
        ${item.label}
      </a>`;
    }).join('');

    return `
<nav class="wise-navbar" id="wiseNavbar" role="navigation" aria-label="主导航">
  <div class="wise-navbar-inner">
    <a class="wise-nav-logo" href="/" aria-label="回到首页">
      <span class="wise-nav-logo-icon">${SITE.short}</span>
      <span>${SITE.name}</span>
    </a>
    <div class="wise-nav-links">
      ${links}
    </div>
    <button class="wise-nav-toggle" id="wiseNavToggle" aria-label="打开导航菜单" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="4" y1="6" x2="20" y2="6"/>
        <line x1="4" y1="12" x2="20" y2="12"/>
        <line x1="4" y1="18" x2="20" y2="18"/>
      </svg>
    </button>
  </div>
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

  // 注入导航栏到页面
  function inject() {
    if (document.getElementById('wiseNavbar')) return; // 防止重复注入

    document.body.insertAdjacentHTML('afterbegin', buildHTML());
    
    // body padding（非 overlay 模式）
    if (!document.body.classList.contains('navbar-overlay')) {
      document.body.style.paddingTop = '52px';
    }
  }

  // 绑定交互事件
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

    // 点击遮罩关闭
    drawer.addEventListener('click', e => { if (e.target === drawer) closeDrawer(); });
    // ESC 键关闭
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
    // 抽屉内链接点击后关闭
    drawer.querySelectorAll('.wise-nav-drawer-link').forEach(el => {
      el.addEventListener('click', closeDrawer);
    });
  }

  // 启动
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => { inject(); bindEvents(); });
    } else {
      inject();
      bindEvents();
    }
  }

  init();
})();
