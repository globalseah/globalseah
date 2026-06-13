(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = new FormData(form);
    const name = data.get("name");
    const email = data.get("email");
    const subject = data.get("subject");
    const message = data.get("message");

    // MVP: 이메일 API 연동 전 안내. 운영 시 Resend / SMTP / Formspree 등으로 교체.
    const body = [
      `이름: ${name}`,
      `이메일: ${email}`,
      `문의유형: ${data.get("type")}`,
      "",
      message,
    ].join("\n");

    const mailto = `mailto:${window.SEAH_SITE?.email || ""}?subject=${encodeURIComponent(
      `[홈페이지 문의] ${subject}`
    )}&body=${encodeURIComponent(body)}`;

    if (window.SEAH_SITE?.email) {
      window.location.href = mailto;
    }

    const status = document.getElementById("form-status");
    if (status) {
      status.hidden = false;
      status.textContent =
        "문의 내용이 준비되었습니다. 이메일 발송 API 연동 후 서버에서 자동 발송됩니다. (현재 MVP: 메일 앱 연동 또는 담당자 확인)";
    }
  });
})();
