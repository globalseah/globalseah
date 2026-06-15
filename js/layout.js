(function () {
  const site = window.SEAH_SITE;
  if (!site) return;

  const depth = parseInt(document.body.dataset.depth || "0", 10);
  const base = depth === 0 ? "" : "../".repeat(depth);

  function link(href) {
    return base + href;
  }

  function isActive(href) {
    const path = window.location.pathname.replace(/\\/g, "/");
    const target = link(href);
    return path.endsWith(href) || path.endsWith(target.replace(/^\.\.\//, ""));
  }

  function renderNavItem(item) {
    if (item.children) {
      const childLinks = item.children
        .map(
          (c) =>
            `<li><a href="${link(c.href)}"${isActive(c.href) ? ' class="active"' : ""}>${c.label}</a></li>`
        )
        .join("");
      return `
        <li class="nav-item has-sub">
          <a href="${link(item.href)}" class="nav-link${isActive(item.href) ? " active" : ""}">${item.label}</a>
          <ul class="sub-nav">${childLinks}</ul>
        </li>`;
    }
    return `
      <li class="nav-item">
        <a href="${link(item.href)}" class="nav-link${isActive(item.href) ? " active" : ""}">${item.label}</a>
      </li>`;
  }

  const navHtml = site.nav.map(renderNavItem).join("");
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
    <header class="site-header">
      <div class="header-main">
        <div class="header-main-inner">
          <a href="${link("index.html")}" class="brand" aria-label="${site.name} 홈">
            <img src="${link("assets/images/headlogo.png")}" alt="(주)${site.name}" class="brand-logo" />
          </a>
          <nav class="main-nav" aria-label="주 메뉴">
            <ul>${navHtml}</ul>
          </nav>
          <button type="button" class="menu-toggle" aria-label="메뉴 열기" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
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
