/** 모바일 전용 스크롤 등장 애니메이션 — Intersection Observer */
(function () {
  const REVEAL_THRESHOLD = 0.2;
  const STAGGER_MS = 100;

  const REVEAL_SELECTORS = [
    "main .home-biz-icons .biz-banner-card",
    "main .home-info-card",
    "main .home-section-head",
    "main .home-portfolio-inner",
    "main .home-inquiry-section--mobile .home-inquiry-widget",
    "main .page-content .content-card",
    "main .page-content .greeting-panel",
    "main .page-content .page-main > article",
    "main .page-content .page-main > .service-section",
    "main .page-content .portfolio-grid .portfolio-item",
    "main .page-content .cert-grid > *",
    "main .page-content .philosophy-section",
    "main .page-content .sub-nav-sidebar",
    "main .page-content .sub-nav-tabs--equal",
    "main .contact-form-card",
    "main .page-content .board-table",
    "main .page-content .notice-view-head",
    "main .page-content .notice-view-body",
    "main .page-content .recruit-view-head",
    "main .page-content .recruit-view-body",
  ];

  const EXCLUDE_ANCESTOR =
    ".home-hero-b, .page-hero, .site-header, .site-footer, .mobile-drawer";

  let observer = null;
  let mutationObserver = null;
  let mutationTimer = null;
  let heroRevealDone = false;

  function isMobileReveal() {
    return !document.documentElement.classList.contains("desktop-only");
  }

  function isExcluded(el) {
    return Boolean(el.closest(EXCLUDE_ANCESTOR));
  }

  function collectTargets() {
    const seen = new Set();
    const targets = [];

    REVEAL_SELECTORS.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (seen.has(el) || isExcluded(el)) return;
        seen.add(el);
        targets.push(el);
      });
    });

    return targets;
  }

  function collectHeroTargets() {
    const targets = [];
    const homeHeroCopy = document.querySelector("main .home-hero-b-copy");

    if (homeHeroCopy) {
      const sub = homeHeroCopy.querySelector(".home-hero-b-sub");
      const lines = homeHeroCopy.querySelectorAll(".hero-line");
      const lead = homeHeroCopy.querySelector(".home-hero-b-lead");

      if (sub) targets.push(sub);
      lines.forEach(function (line) {
        targets.push(line);
      });
      if (lead) targets.push(lead);
    }

    const pageHeroContainer = document.querySelector("main .page-hero .container");
    if (pageHeroContainer) {
      const breadcrumb = pageHeroContainer.querySelector(".breadcrumb");
      const title = pageHeroContainer.querySelector("h1");
      if (breadcrumb) targets.push(breadcrumb);
      if (title) targets.push(title);
    }

    return targets;
  }

  function assignHeroStagger(elements) {
    elements.forEach(function (el, index) {
      el.style.setProperty("--reveal-delay", index * STAGGER_MS + "ms");
    });
  }

  function initHeroRevealOnLoad() {
    if (!isMobileReveal() || heroRevealDone) return;

    const targets = collectHeroTargets().filter(function (el) {
      return !el.classList.contains("reveal-on-load");
    });

    if (!targets.length) return;

    heroRevealDone = true;
    assignHeroStagger(targets);

    targets.forEach(function (el) {
      el.classList.add("reveal-on-scroll", "reveal-on-load");
    });

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        targets.forEach(function (el) {
          el.classList.add("is-revealed");
        });
      });
    });
  }

  function assignStaggerIndices(elements) {
    const groups = new Map();

    elements.forEach(function (el) {
      const group =
        el.closest(
          ".home-biz-icons-inner, .home-bottom-inner, .portfolio-grid, .cert-grid, .page-main, .page-content > .container, section"
        ) || el.parentElement;
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(el);
    });

    groups.forEach(function (groupEls) {
      groupEls.forEach(function (el, index) {
        el.style.setProperty("--reveal-delay", index * STAGGER_MS + "ms");
      });
    });
  }

  function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.bottom > 0 && rect.top < viewportHeight;
  }

  function playRevealAnimation(el, io) {
    if (el.classList.contains("is-revealed")) return;
    if (io) io.unobserve(el);

    void el.offsetHeight;

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        el.classList.add("is-revealed");
      });
    });
  }

  function ensureObserver() {
    if (observer) return observer;

    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || entry.intersectionRatio < REVEAL_THRESHOLD) return;
          playRevealAnimation(entry.target, observer);
        });
      },
      { threshold: REVEAL_THRESHOLD }
    );

    return observer;
  }

  function observeTargets(elements) {
    if (!isMobileReveal() || !elements.length) return;

    const io = ensureObserver();
    const pending = elements.filter(function (el) {
      return !el.classList.contains("is-revealed");
    });

    if (!pending.length) return;

    assignStaggerIndices(pending);

    pending.forEach(function (el) {
      el.classList.add("reveal-on-scroll");
    });

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        pending.forEach(function (el) {
          if (isInViewport(el)) {
            playRevealAnimation(el, io);
            return;
          }

          io.observe(el);
        });
      });
    });
  }

  function teardown() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    document.querySelectorAll(".reveal-on-scroll").forEach(function (el) {
      el.classList.remove(
        "reveal-on-scroll",
        "reveal-on-load",
        "is-revealed",
        "is-revealed-instant"
      );
      el.style.removeProperty("--reveal-delay");
    });

    heroRevealDone = false;
  }

  function init() {
    if (!isMobileReveal()) {
      teardown();
      return;
    }

    initHeroRevealOnLoad();
    observeTargets(collectTargets());
  }

  function scheduleInit() {
    window.requestAnimationFrame(init);
  }

  function scheduleInitDebounced() {
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(scheduleInit, 120);
  }

  function watchDynamicContent() {
    const main = document.querySelector("main");
    if (!main || mutationObserver) return;

    mutationObserver = new MutationObserver(function () {
      if (!isMobileReveal()) return;
      scheduleInitDebounced();
    });

    mutationObserver.observe(main, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleInit);
  } else {
    scheduleInit();
  }

  window.addEventListener("load", scheduleInit);
  window.addEventListener("seah:viewport", scheduleInit);
  watchDynamicContent();
})();
