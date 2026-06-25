(function () {
  var api = window.SEAH_ADMIN_API;
  if (!api) return;

  var panelEl = document.getElementById("stats-health-panel");
  var listEl = document.getElementById("stats-health-list");
  var messageEl = document.getElementById("stats-health-message");
  var gtagEl = document.getElementById("stats-health-gtag");
  var runBtn = document.getElementById("stats-health-run");

  function isDebugMode() {
    try {
      return new URLSearchParams(window.location.search).get("debug") === "1";
    } catch (e) {
      return false;
    }
  }

  if (!isDebugMode()) {
    if (panelEl) panelEl.classList.add("is-hidden");
    return;
  }

  if (runBtn) {
    runBtn.addEventListener("click", runDiagnostics);
  }

  checkPublicGtag();
  runDiagnostics();

  function checkPublicGtag() {
    if (!gtagEl) return;

    fetch("/api/ga4-id")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        var id = (data && data.measurementId) || "";
        var siteId =
          window.SEAH_SITE && window.SEAH_SITE.ga4MeasurementId
            ? window.SEAH_SITE.ga4MeasurementId
            : "";

        if (siteId) {
          gtagEl.textContent =
            "site-config.js 측정 ID: " +
            siteId +
            " (공개 페이지 gtag에 사용)";
          return;
        }

        if (id) {
          gtagEl.textContent = "Vercel GA4_MEASUREMENT_ID: " + id;
          return;
        }

        gtagEl.textContent =
          "공개 수집 ID 없음 — site-config.ga4MeasurementId 또는 Vercel GA4_MEASUREMENT_ID를 설정하세요.";
      })
      .catch(function () {
        gtagEl.textContent =
          "/api/ga4-id 응답 실패 — 배포·환경변수를 확인하세요.";
      });
  }

  function runDiagnostics() {
    if (!listEl) return;
    if (messageEl) messageEl.textContent = "연결 진단 중…";
    if (runBtn) runBtn.disabled = true;
    listEl.innerHTML = "";

    api
      .analyticsHealth()
      .then(function (payload) {
        var data = payload.data || {};
        renderChecks(data.checks || []);
        renderChecks(data.apiChecks || []);
        if (messageEl) {
          messageEl.textContent = data.message || "";
          messageEl.className =
            "admin-health-message" + (data.ok ? " is-ok" : " is-error");
        }
        if (panelEl) {
          panelEl.classList.toggle("is-ok", Boolean(data.ok));
          panelEl.classList.toggle("is-error", !data.ok);
        }
      })
      .catch(function (err) {
        if (messageEl) {
          messageEl.textContent = err.message;
          messageEl.className = "admin-health-message is-error";
        }
      })
      .finally(function () {
        if (runBtn) runBtn.disabled = false;
      });
  }

  function renderChecks(items) {
    if (!items.length) return;
    listEl.innerHTML += items
      .map(function (item) {
        return (
          '<li class="admin-health-item' +
          (item.ok ? " is-ok" : " is-error") +
          '">' +
          '<span class="admin-health-icon" aria-hidden="true">' +
          (item.ok ? "✓" : "✕") +
          "</span>" +
          '<div class="admin-health-body">' +
          "<strong>" +
          escapeHtml(item.label) +
          "</strong>" +
          "<p>" +
          escapeHtml(item.detail || "") +
          "</p>" +
          "</div></li>"
        );
      })
      .join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
