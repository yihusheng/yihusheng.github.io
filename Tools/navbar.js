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
 *  【样式说明】两枚独立按钮固定占据顶部区域：
 *    - 左上：主页按钮 🏠
 *    - 右上：菜单按钮 ···
 *    所有页面通过 spacer 占位确保内容在按钮下方显示。
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

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

  window.WiseNavbarData = NAV_ITEMS.slice();

  function injectFonts() {
    if (document.querySelector('link[href*="Material+Symbols+Rounded"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0';
    document.head.appendChild(link);
  }

  function getCurrentPath() {
    var p = window.location.pathname;
    p = p.replace(/\/index\.html$/, '');
    p = p.replace(/\/+$/, '');
    return p || '/';
  }

  function isHomePage() { return getCurrentPath() === '/'; }

  function isActive(itemHref) {
    var cur = getCurrentPath();
    var target = itemHref.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';
    if (cur === target) return true;
    if (target !== '/' && cur.startsWith(target)) return true;
    return false;
  }

  function buildHTML() {
    var html = '';
    for (var i = 0; i < NAV_ITEMS.length; i++) {
      var item = NAV_ITEMS[i];
      var act = isActive(item.href) ? ' active' : '';
      html += '<a class="wise-nav-drawer-link' + act + '" href="' + item.href + '">' +
        '<span class="nv-icon material-symbols-rounded">' + item.icon + '</span>' +
        item.label + '</a>';
    }

    return '' +
      '<div id="wiseNavbarSpacer" style="height:74px;flex-shrink:0;width:100%;"></div>' +
      '<a class="wise-nav-btn wise-nav-btn-home" href="/" aria-label="回到首页">' +
        '<span class="material-symbols-rounded">home</span></a>' +
      '<button class="wise-nav-btn wise-nav-btn-menu" id="wiseNavToggle" aria-label="打开导航菜单" aria-expanded="false">' +
        '<span class="material-symbols-rounded">apps</span></button>' +
      '<div class="wise-nav-drawer" id="wiseNavDrawer" aria-hidden="true">' +
        '<div class="wise-nav-drawer-panel">' +
          '<div class="wise-nav-drawer-header">' +
            '<span class="wise-nav-drawer-title">导航菜单</span>' +
            '<button class="wise-nav-drawer-close" id="wiseNavDrawerClose" aria-label="关闭导航菜单">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
                '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
              '</svg></button></div>' +
          html +
        '</div></div>';
  }

  function inject() {
    if (document.getElementById('wiseNavToggle')) return;
    injectFonts();

    // 在 body 最前面插入 spacer + 按钮，spacer 将后续内容推下
    document.body.insertAdjacentHTML('afterbegin', buildHTML());
  }

  function bindEvents() {
    var toggle = document.getElementById('wiseNavToggle');
    var drawer = document.getElementById('wiseNavDrawer');
    var close  = document.getElementById('wiseNavDrawerClose');
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

    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (drawer.classList.contains('open')) { closeDrawer(); } else { open(); }
    });
    if (close) close.addEventListener('click', closeDrawer);
    drawer.addEventListener('click', function(e) { if (e.target === drawer) closeDrawer(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeDrawer(); });
    var links = drawer.querySelectorAll('.wise-nav-drawer-link');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', closeDrawer);
    }
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { inject(); bindEvents(); });
    } else {
      inject();
      bindEvents();
    }
  }

  if (!isHomePage()) {
    init();
  }
})();
