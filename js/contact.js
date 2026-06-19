(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const fileInput = document.getElementById("attachment");
  const fileTrigger = document.getElementById("attachment-trigger");
  const fileNameEl = document.getElementById("attachment-name");
  const submitBtn = form.querySelector('button[type="submit"]');
  const status = document.getElementById("form-status");
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  function showStatus(message, isError) {
    if (!status) return;
    status.hidden = false;
    status.textContent = message;
    status.classList.toggle("form-note--error", Boolean(isError));
  }

  function resolveApiUrl() {
    if (window.SEAH_SITE?.contactApiUrl) {
      return window.SEAH_SITE.contactApiUrl;
    }
    return "/api/contact";
  }

  if (fileInput && fileTrigger) {
    fileTrigger.addEventListener("click", function () {
      fileInput.click();
    });
  }

  if (fileInput && fileNameEl) {
    fileInput.addEventListener("change", function () {
      const file = fileInput.files && fileInput.files[0];

      if (file && file.size > MAX_FILE_SIZE) {
        fileInput.value = "";
        fileNameEl.textContent = "선택된 파일 없음";
        showStatus("첨부파일은 5MB 이하만 업로드할 수 있습니다.", true);
        return;
      }

      fileNameEl.textContent = file ? file.name : "선택된 파일 없음";
      if (status) status.hidden = true;
    });
  }

  const privacyToggle = document.getElementById("privacy-toggle");
  const privacyDetail = document.getElementById("privacy-detail");
  const privacyConsent = document.getElementById("privacy-consent");
  const privacyError = document.getElementById("privacy-error");

  function showPrivacyError(show) {
    if (privacyError) privacyError.hidden = !show;
  }

  if (privacyConsent) {
    privacyConsent.addEventListener("change", function () {
      if (privacyConsent.checked) showPrivacyError(false);
    });
  }

  if (privacyToggle && privacyDetail) {
    privacyToggle.addEventListener("click", function () {
      const willOpen = privacyDetail.hidden;
      privacyDetail.hidden = !willOpen;
      privacyToggle.textContent = willOpen ? "내용닫기" : "내용보기";
      privacyToggle.setAttribute("aria-expanded", String(willOpen));
    });
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const privacyConsentEl = document.getElementById("privacy-consent");
    if (privacyConsentEl && !privacyConsentEl.checked) {
      showPrivacyError(true);
      privacyConsentEl.focus();
      return;
    }

    showPrivacyError(false);

    const phoneVal = (form.phone && form.phone.value.trim()) || "";
    const emailVal = (form.email && form.email.value.trim()) || "";
    if (!phoneVal && !emailVal) {
      showStatus("연락처와 이메일 중 한 가지는 입력해주세요.", true);
      if (form.phone) form.phone.focus();
      return;
    }

    const businessVal = (form.business && form.business.value.trim()) || "";
    if (!businessVal) {
      showStatus("사업부문을 선택해 주세요.", true);
      if (form.business) form.business.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "전송 중...";
    }
    if (status) status.hidden = true;

    try {
      const formData = new FormData(form);
      const response = await fetch(resolveApiUrl(), {
        method: "POST",
        body: formData,
      });

      let result = {};
      try {
        result = await response.json();
      } catch (parseError) {
        result = {};
      }

      if (!response.ok) {
        throw new Error(result.error || "문의 전송에 실패했습니다.");
      }

      form.reset();
      if (fileNameEl) fileNameEl.textContent = "선택된 파일 없음";
      showStatus("문의가 접수되었습니다. 담당자 확인 후 연락드리겠습니다.", false);
    } catch (err) {
      const isLocalFile =
        window.location.protocol === "file:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (isLocalFile && err.message.includes("Failed to fetch")) {
        showStatus(
          "로컬 미리보기에서는 이메일 API가 동작하지 않습니다. Vercel 배포 주소 또는 `npx vercel dev`로 테스트해 주세요.",
          true
        );
      } else {
        showStatus(err.message || "문의 전송 중 오류가 발생했습니다.", true);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "문의 보내기";
      }
    }
  });
})();
