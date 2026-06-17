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
          <button type="button" class="menu-toggle" aria-label="메뉴 열기" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div class="gnb-sub-bar" hidden>
        <div class="gnb-sub-bar-inner">${subBarHtml}</div>
      </div>
      <div class="mobile-drawer" hidden>
        <div class="mobile-drawer-inner">${mobileNavHtml}</div>
      </div>
    </header>`;

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
            <strong>${site.name}</strong> (${site.nameEn}) · ${site.address}
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
  if (toggle && drawer) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      drawer.hidden = open;
      document.body.classList.toggle("nav-open", !open);
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
        if (!window.matchMedia("(min-width: 1024px)").matches) return;
        clearTimeout(closeTimer);
        clearTimeout(openTimer);
        const index = item.dataset.submenu;
        openTimer = setTimeout(() => showSubmenu(index), 150);
      });
    });

    navItemsNoSub.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        if (!window.matchMedia("(min-width: 1024px)").matches) return;
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

  window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
    if (!e.matches) {
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
})();
