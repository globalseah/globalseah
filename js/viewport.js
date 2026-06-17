/** site-config.js의 responsive 설정에 따라 뷰포트 적용 */
(function () {
  const site = window.SEAH_SITE;
  if (!site) return;

  const meta = document.querySelector('meta[name="viewport"]');
  if (!meta) return;

  const desktopWidth = site.desktopViewportWidth || 1200;

  if (site.responsive === false) {
    meta.setAttribute("content", `width=${desktopWidth}, initial-scale=1`);
    document.documentElement.classList.add("desktop-only");
    document.documentElement.style.setProperty(
      "--desktop-preview-width",
      `${desktopWidth}px`
    );
    document.documentElement.style.setProperty("--site-min-width", "1024px");
    document.documentElement.style.setProperty("--site-max-width", `${desktopWidth}px`);
  } else {
    meta.setAttribute("content", "width=device-width, initial-scale=1");
    document.documentElement.classList.remove("desktop-only");
  }
})();
