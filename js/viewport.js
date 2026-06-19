/** site-config.js의 responsive·디바이스 분기에 따라 뷰포트 적용 */
(function () {
  const site = window.SEAH_SITE;
  if (!site) return;

  const meta = document.querySelector('meta[name="viewport"]');
  if (!meta) return;

  const desktopWidth = site.desktopViewportWidth || 1280;
  const mobileBreakpoint = site.mobileBreakpoint ?? 1024;
  const narrowMq = `(max-width: ${mobileBreakpoint - 1}px)`;

  function isTouchDevice() {
    return window.matchMedia("(hover: none), (pointer: coarse)").matches;
  }

  /** 터치 + 너비 < mobileBreakpoint 일 때만 모바일 레이아웃 (iPad 가로 등은 PC) */
  function useMobileLayout() {
    if (site.responsive === false) return false;
    return isTouchDevice() && window.innerWidth < mobileBreakpoint;
  }

  function applyDesktopOnly() {
    meta.setAttribute("content", `width=${desktopWidth}, initial-scale=1`);
    document.documentElement.classList.add("desktop-only");
    document.documentElement.style.setProperty(
      "--desktop-preview-width",
      `${desktopWidth}px`
    );
    document.documentElement.style.setProperty("--site-min-width", `${desktopWidth}px`);
    document.documentElement.style.setProperty("--site-max-width", `${desktopWidth}px`);
  }

  function applyMobile() {
    meta.setAttribute("content", "width=device-width, initial-scale=1");
    document.documentElement.classList.remove("desktop-only");
    document.documentElement.style.removeProperty("--desktop-preview-width");
    document.documentElement.style.removeProperty("--site-min-width");
    document.documentElement.style.removeProperty("--site-max-width");
  }

  function apply() {
    const mobile = useMobileLayout();
    const prevMode = document.documentElement.dataset.viewportMode;

    if (mobile) {
      applyMobile();
    } else {
      applyDesktopOnly();
    }

    const mode =
      site.responsive === false ? "desktop-fixed" : mobile ? "mobile" : "desktop";
    if (prevMode !== mode) {
      document.documentElement.dataset.viewportMode = mode;
      window.dispatchEvent(
        new CustomEvent("seah:viewport", { detail: { mode, mobile } })
      );
    }
  }

  apply();

  if (site.responsive === false) return;

  let debounceTimer;
  let devtoolsRecheckTimer;

  /** resize·기기모드 전환 시 즉시 + 지연 재판별 (DevTools pointer 미디어쿼리 지연 대응) */
  function scheduleApply() {
    apply();
    clearTimeout(debounceTimer);
    clearTimeout(devtoolsRecheckTimer);
    debounceTimer = setTimeout(apply, 150);
    devtoolsRecheckTimer = setTimeout(apply, 350);
  }

  window.addEventListener("resize", scheduleApply);
  window.addEventListener("pageshow", apply);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleApply);
  }

  window
    .matchMedia("(hover: none), (pointer: coarse)")
    .addEventListener("change", scheduleApply);

  window.matchMedia(narrowMq).addEventListener("change", scheduleApply);
})();
