/**
 * ═══════════════════════════════════════════════════════════════
 *  Wise Navbar — yihusheng 网站统一导航栏
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
    { icon: 'device_hub',       label: 'UA Info',   href: '/Tools/UA/' },
    { icon: 'dashboard',        label: 'zashboard', href: '/Tools/zashboard/' },
    { icon: 'dashboard',        label: 'Metacubexd', href: '/Tools/Metacubexd/' },
  ];

  window.WiseNavbarData = NAV_ITEMS.slice();

  // ── DOM 就绪后检测是否首页（路径 + 页面内容双重判断）──
  function isHomePage() {
    var path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';
    // 显式首页路径
    if (path === '/' || path === '/Music') return true;
    // DOM 特征（404 fallback 返回了首页内容）
    if (document.getElementById('drawerSections')) return true;
    if (document.querySelector('.phone-screen')) return true;
    if (document.querySelector('.dynamic-island')) return true;
    return false;
  }

  function injectFonts() {
    if (document.querySelector('link[href*="Material+Symbols+Rounded"')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0';
    document.head.appendChild(link);
  }

  function injectSpacerCSS() {
    if (document.body && document.body.classList.contains('navbar-overlay')) return;
    var style = document.createElement('style');
    style.id = 'wiseNavbarSpacerCSS';
    style.textContent =
      'body { padding-top: 62px !important; }' +
      'body > #app { padding-top: 62px !important; box-sizing: border-box !important; }' +
      'body > #__nuxt { padding-top: 62px !important; box-sizing: border-box !important; }';
    document.head.appendChild(style);
  }

  function isActive(itemHref) {
    var cur = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';
    var target = itemHref.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';
    if (cur === target) return true;
    if (target !== '/' && cur.startsWith(target)) return true;
    return false;
  }

  function buildDrawerLinks() {
    var html = '';
    for (var i = 0; i < NAV_ITEMS.length; i++) {
      var item = NAV_ITEMS[i];
      var act = isActive(item.href) ? ' active' : '';
      html += '<a class="wise-nav-drawer-link' + act + '" href="' + item.href + '">' +
        '<span class="nv-icon material-symbols-rounded">' + item.icon + '</span>' +
        item.label + '</a>';
    }
    return html;
  }

  function buildHTML() {
    return '' +
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
          buildDrawerLinks() +
        '</div></div>';
  }

  function populateDrawer() {
    var panel = document.querySelector('.wise-nav-drawer-panel');
    if (!panel) return;
    var existing = panel.querySelector('.wise-nav-drawer-link');
    if (existing) return;
    panel.insertAdjacentHTML('beforeend', buildDrawerLinks());
  }

  function inject() {
    if (document.getElementById('wiseNavToggle')) return;
    injectFonts();
    injectSpacerCSS();
    document.body.insertAdjacentHTML('beforeend', buildHTML());
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

  function doInit() {
    // DOM 就绪后重新判断，避免在 <head> 阶段误判
    if (isHomePage()) return;

    var alreadyExists = !!document.getElementById('wiseNavToggle');
    if (!alreadyExists) {
      injectFonts();
      injectSpacerCSS();
      inject();
    } else {
      injectFonts();
      populateDrawer();
    }
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doInit);
  } else {
    doInit();
  }
})();
