(function () {
  const site = window.SEAH_SITE;
  if (!site) return;

  document.body.classList.add("site-shell");

  const depth = parseInt(document.body.dataset.depth || "0", 10);
  const base = depth === 0 ? "" : "../".repeat(depth);
  const isHome = document.body.classList.contains("page-home");

  function link(href) {
    return base + href;
  }

  function isActive(href) {
    const path = window.location.pathname.replace(/\\/g, "/");
    const target = link(href);
    return path.endsWith(href) || path.endsWith(target.replace(/^\.\.\//, ""));
  }

  function renderNavItem(item, index) {
    const active = isActive(item.href) ? " active" : "";
    if (item.children) {
      return `
        <li class="nav-item has-sub" data-submenu="${index}">
          <a href="${link(item.href)}" class="nav-link${active}">${item.label}</a>
        </li>`;
    }
    return `
      <li class="nav-item">
        <a href="${link(item.href)}" class="nav-link${active}">${item.label}</a>
      </li>`;
  }

  function renderSubBarPanels() {
    return site.nav
      .map((item, index) => {
        if (!item.children) return "";
        const links = item.children
          .map((c, i) => {
            const sep =
              i > 0 ? '<span class="gnb-sub-sep" aria-hidden="true">|</span>' : "";
            const childActive = isActive(c.href) ? ' class="active"' : "";
            return `${sep}<a href="${link(c.href)}"${childActive}>${c.label}</a>`;
          })
          .join("");
        return `<div class="gnb-sub-panel" data-submenu="${index}" role="group" hidden>${links}</div>`;
      })
      .join("");
  }

  const navHtml = site.nav.map(renderNavItem).join("");
  const subBarHtml = renderSubBarPanels();
  const mobileNavHtml = site.nav
    .map((item) => {
      if (!item.children) {
        return `<a href="${link(item.href)}">${item.label}</a>`;
      }
      const subs = item.children
        .map((c) => `<a href="${link(c.href)}" class="sub">${c.label}</a>`)
        .join("");
      return `<div class="mobile-group"><strong>${item.label}</strong>${subs}</div>`;
    })
    .join("");

  const headerHtml = `
    <header class="site-header${isHome ? " site-header--hero" : ""}">
      <div class="header-main">
        <div class="header-main-inner">
          <a href="${link("index.html")}" class="brand" aria-label="${site.name} 홈">
            <img src="${link("assets/images/headlogo.png")}" alt="(주)${site.name}" class="brand-logo brand-logo--default" />
            <img src="${link("assets/images/headlogo-white.png")}" alt="" class="brand-logo brand-logo--inverse" aria-hidden="true" />
          </a>
          <nav class="main-nav" aria-label="주 메뉴">
            <ul>${navHtml}</ul>
          </nav>
          <a href="${link("contact/index.html")}" class="header-inquiry-btn">문의하기</a>
          <button type="button" class="menu-toggle" aria-label="메뉴 열기" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div class="gnb-sub-bar" hidden>
        <div class="gnb-sub-bar-inner">${subBarHtml}</div>
      </div>
    </header>
    <div class="mobile-drawer" hidden>
      <div class="mobile-drawer-inner">${mobileNavHtml}</div>
    </div>`;

  const contactNav = site.nav.find((item) => item.href === "contact/index.html");
  const contactLabel = contactNav ? contactNav.label : "견적 및 상담문의";

  const footerHtml = `
    <footer class="site-footer">
      <div class="footer-nav-bar">
        <div class="footer-nav-inner">
          <a href="${link("company/greeting.html")}">회사소개</a>
          <span aria-hidden="true">|</span>
          <a href="${link("portfolio/index.html")}">실적현황</a>
          <span aria-hidden="true">|</span>
          <a href="${link("notice/index.html")}">공지사항</a>
          <span aria-hidden="true">|</span>
          <a href="${link("contact/index.html")}">${contactLabel}</a>
          <span aria-hidden="true">|</span>
          <a href="${link("company/location.html")}">찾아오시는길</a>
        </div>
      </div>
      <div class="footer-body">
        <div class="footer-body-inner">
          <p class="footer-company-line">
            <strong>${site.name}</strong> (${site.nameEn})<br />
            ${site.address}
          </p>
          <p class="footer-company-line">
            대표이사 ${site.ceo} · 사업자등록번호 ${site.bizRegNo || ""}
          </p>
          <p class="footer-company-line">
            TEL ${site.phone} · FAX ${site.fax} · E-mail ${site.email}
          </p>
          <p class="footer-copy">
            Copyright &copy; ${new Date().getFullYear()} ${site.nameEn}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>`;

  document.body.insertAdjacentHTML("afterbegin", headerHtml);
  document.body.insertAdjacentHTML("beforeend", footerHtml);

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const drawer = document.querySelector(".mobile-drawer");
  const drawerInner = drawer ? drawer.querySelector(".mobile-drawer-inner") : null;
  let refreshMobileHeader = function () {};
  let drawerCloseTimer = null;

  function isMobileDrawer() {
    return !document.documentElement.classList.contains("desktop-only");
  }

  function setDrawerOpen(open) {
    if (!toggle || !drawer) return;

    clearTimeout(drawerCloseTimer);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    document.body.classList.toggle("nav-open", open);

    if (header) {
      header.classList.toggle("menu-open", open);
      if (open) header.classList.remove("is-scroll-hidden");
    }

    if (isMobileDrawer()) {
      if (open) {
        drawer.hidden = false;
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            drawer.classList.add("is-open");
          });
        });
      } else {
        drawer.classList.remove("is-open");
        drawerCloseTimer = window.setTimeout(function () {
          if (!drawer.classList.contains("is-open")) {
            drawer.hidden = true;
          }
        }, 320);
      }
    } else {
      drawer.hidden = !open;
      drawer.classList.toggle("is-open", open);
    }

    refreshMobileHeader();
  }

  if (drawerInner) {
    drawerInner.addEventListener("transitionend", function (e) {
      if (e.target !== drawerInner || e.propertyName !== "transform") return;
      if (!drawer.classList.contains("is-open") && !drawer.hidden) {
        drawer.hidden = true;
      }
    });
  }

  function isDesktopNav() {
    return (
      document.documentElement.classList.contains("desktop-only") ||
      window.matchMedia("(min-width: 1024px)").matches
    );
  }

  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      const open = toggle.getAttribute("aria-expanded") === "true";
      setDrawerOpen(!open);
    });

    drawer.addEventListener("click", function (e) {
      if (e.target === drawer) setDrawerOpen(false);
    });

    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setDrawerOpen(false);
      });
    });

    window.addEventListener("seah:viewport", function (e) {
      if (!e.detail.mobile) setDrawerOpen(false);
    });
  }

  const subBar = document.querySelector(".gnb-sub-bar");
  const panels = document.querySelectorAll(".gnb-sub-panel");
  const navItemsWithSub = document.querySelectorAll(".nav-item.has-sub");
  const navItemsNoSub = document.querySelectorAll(".nav-item:not(.has-sub)");
  let openTimer = null;
  let closeTimer = null;

  function collapseSubBar() {
    if (!subBar) return;
    subBar.classList.remove("is-visible");
    panels.forEach((panel) => {
      panel.classList.remove("is-active");
      panel.hidden = true;
    });
    setTimeout(() => {
      if (!subBar.classList.contains("is-visible")) {
        subBar.hidden = true;
      }
    }, 320);
  }

  function showHeaderOnly() {
    if (!header) return;
    clearTimeout(closeTimer);
    collapseSubBar();
    header.classList.add("is-open");
  }

  function showSubmenu(index) {
    if (!header || !subBar) return;
    clearTimeout(closeTimer);
    subBar.hidden = false;
    requestAnimationFrame(() => {
      header.classList.add("is-open");
      subBar.classList.add("is-visible");
      panels.forEach((panel) => {
        const active = panel.dataset.submenu === String(index);
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
    });
  }

  function hideHeader() {
    if (!header || !subBar) return;
    header.classList.remove("is-open");
    collapseSubBar();
  }

  if (header) {
    navItemsWithSub.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        if (!isDesktopNav()) return;
        clearTimeout(closeTimer);
        clearTimeout(openTimer);
        const index = item.dataset.submenu;
        openTimer = setTimeout(() => showSubmenu(index), 150);
      });
    });

    navItemsNoSub.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        if (!isDesktopNav()) return;
        clearTimeout(closeTimer);
        clearTimeout(openTimer);
        openTimer = setTimeout(showHeaderOnly, 150);
      });
    });

    header.addEventListener("mouseenter", () => {
      clearTimeout(closeTimer);
    });
    header.addEventListener("mouseleave", () => {
      clearTimeout(openTimer);
      closeTimer = setTimeout(hideHeader, 250);
    });
  }

  window.matchMedia("(min-width: 1024px)").addEventListener("change", () => {
    if (!isDesktopNav()) {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      hideHeader();
    }
  });

  const pageHero = document.querySelector(".page-hero");
  if (pageHero) {
    const path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    const heroBySection = {
      company: "hero-sub1.jpg",
      business: "hero-sub2.jpg",
      portfolio: "hero-sub3.jpg",
      notice: "hero-sub4.png",
      contact: "hero-sub5.jpg",
    };
    let heroFile = heroBySection.company;
    if (path.includes("/business/")) heroFile = heroBySection.business;
    else if (path.includes("/portfolio/")) heroFile = heroBySection.portfolio;
    else if (path.includes("/notice/")) heroFile = heroBySection.notice;
    else if (path.includes("/contact/")) heroFile = heroBySection.contact;

    pageHero.style.setProperty("--page-hero-bg", `url("${base}assets/images/${heroFile}")`);
  }

  initMobileSubNav();

  window.addEventListener("seah:viewport", initMobileSubNav);
  window.addEventListener("resize", debounce(initMobileSubNav, 150));

  function debounce(fn, ms) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function initMobileSubNav() {
    const isMobile = !document.documentElement.classList.contains("desktop-only");
    document.querySelectorAll(".sub-nav-sidebar, .sub-nav-tabs--equal").forEach(function (nav) {
      if (isMobile) {
        buildMobileSubNavDropdown(nav);
      } else {
        destroyMobileSubNavDropdown(nav);
      }
    });
  }

  function buildMobileSubNavDropdown(nav) {
    if (nav.querySelector(".sub-nav-dropdown")) return;

    const links = Array.from(nav.querySelectorAll(":scope > a"));
    if (!links.length) return;

    const active = links.find(function (a) {
      return a.classList.contains("active");
    }) || links[0];

    const dropdown = document.createElement("div");
    dropdown.className = "sub-nav-dropdown";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "sub-nav-dropdown-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-haspopup", "listbox");
    toggle.setAttribute("aria-label", "서브메뉴 열기");

    const label = document.createElement("span");
    label.className = "sub-nav-dropdown-label";
    label.textContent = active.textContent.trim();

    const chevron = document.createElement("span");
    chevron.className = "sub-nav-dropdown-chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = "▾";

    toggle.appendChild(label);
    toggle.appendChild(chevron);

    const panel = document.createElement("div");
    panel.className = "sub-nav-dropdown-panel";
    panel.hidden = true;

    const list = document.createElement("div");
    list.className = "sub-nav-dropdown-list";
    list.setAttribute("role", "listbox");

    links.forEach(function (a) {
      list.appendChild(a);
    });

    panel.appendChild(list);
    dropdown.appendChild(toggle);
    dropdown.appendChild(panel);
    nav.appendChild(dropdown);
    nav.classList.add("sub-nav--has-dropdown");

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
      dropdown.classList.toggle("is-open", open);
      toggle.setAttribute("aria-label", open ? "서브메뉴 닫기" : "서브메뉴 열기");
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    list.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    function onDocClick(e) {
      if (!dropdown.contains(e.target)) setOpen(false);
    }

    document.addEventListener("click", onDocClick);
    dropdown._outsideClick = onDocClick;
  }

  function destroyMobileSubNavDropdown(nav) {
    const dropdown = nav.querySelector(".sub-nav-dropdown");
    if (!dropdown) return;

    if (dropdown._outsideClick) {
      document.removeEventListener("click", dropdown._outsideClick);
    }

    const links = dropdown.querySelectorAll(".sub-nav-dropdown-list a");
    links.forEach(function (a) {
      nav.insertBefore(a, dropdown);
    });

    dropdown.remove();
    nav.classList.remove("sub-nav--has-dropdown");
  }

  function initMobileHeaderScroll() {
    const SCROLL_THRESHOLD = 10;
    const TOP_ALWAYS_VISIBLE = 80;
    const heroSection = document.querySelector(".home-hero-b");
    let lastScrollY = window.scrollY;
    let accumulatedDelta = 0;
    let scrollTicking = false;
    let scrollListenerActive = false;
    let resizeTimer;

    function isMobileScrollHeader() {
      return !document.documentElement.classList.contains("desktop-only");
    }

    function isHeroHeader() {
      return Boolean(header && header.classList.contains("site-header--hero"));
    }

    function getHeroHeight() {
      if (!heroSection) return 0;
      return heroSection.offsetHeight;
    }

    function setScrollHidden(hidden) {
      if (!header) return;
      header.classList.toggle("is-scroll-hidden", hidden);
    }

    function clearHeroHeaderState() {
      if (!header) return;
      header.classList.remove("is-hero-in-view", "is-hero-passed");
    }

    function updateHeroHeaderState(scrollY) {
      if (!header || !isHeroHeader()) {
        clearHeroHeaderState();
        return;
      }

      if (document.body.classList.contains("nav-open")) {
        header.classList.remove("is-hero-in-view");
        header.classList.add("is-hero-passed");
        return;
      }

      const inHero = scrollY < getHeroHeight();
      header.classList.toggle("is-hero-in-view", inHero);
      header.classList.toggle("is-hero-passed", !inHero);
    }

    function resetScrollState() {
      lastScrollY = window.scrollY;
      accumulatedDelta = 0;
    }

    function updateMobileHeader() {
      scrollTicking = false;

      if (!header || !isMobileScrollHeader()) {
        setScrollHidden(false);
        clearHeroHeaderState();
        resetScrollState();
        return;
      }

      const scrollY = window.scrollY;
      updateHeroHeaderState(scrollY);

      if (document.body.classList.contains("nav-open")) {
        setScrollHidden(false);
        resetScrollState();
        return;
      }

      if (scrollY <= TOP_ALWAYS_VISIBLE) {
        setScrollHidden(false);
        resetScrollState();
        return;
      }

      const delta = scrollY - lastScrollY;
      lastScrollY = scrollY;

      if (delta === 0) return;

      if ((delta > 0 && accumulatedDelta < 0) || (delta < 0 && accumulatedDelta > 0)) {
        accumulatedDelta = 0;
      }

      accumulatedDelta += delta;

      if (accumulatedDelta >= SCROLL_THRESHOLD) {
        setScrollHidden(true);
        accumulatedDelta = 0;
      } else if (accumulatedDelta <= -SCROLL_THRESHOLD) {
        setScrollHidden(false);
        accumulatedDelta = 0;
      }
    }

    function onScroll() {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(updateMobileHeader);
      }
    }

    function enableScrollHeader() {
      if (scrollListenerActive) return;
      scrollListenerActive = true;
      resetScrollState();
      setScrollHidden(false);
      window.addEventListener("scroll", onScroll, { passive: true });
      updateMobileHeader();
    }

    function disableScrollHeader() {
      if (!scrollListenerActive) return;
      scrollListenerActive = false;
      window.removeEventListener("scroll", onScroll);
      setScrollHidden(false);
      clearHeroHeaderState();
      resetScrollState();
    }

    function syncScrollHeader() {
      if (isMobileScrollHeader()) {
        enableScrollHeader();
      } else {
        disableScrollHeader();
      }
    }

    refreshMobileHeader = function () {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(updateMobileHeader);
      }
    };

    syncScrollHeader();
    window.addEventListener("seah:viewport", syncScrollHeader);
    window.addEventListener("pageshow", syncScrollHeader);
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refreshMobileHeader, 150);
    });
  }

  initMobileHeaderScroll();

  const revealScript = document.createElement("script");
  revealScript.src = link("js/reveal-on-scroll.js");
  revealScript.defer = true;
  document.body.appendChild(revealScript);
})();
