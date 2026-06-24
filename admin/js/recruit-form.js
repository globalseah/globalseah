(function () {
  var api = window.SEAH_ADMIN_API;
  if (!api) return;

  var STRUCTURED_FIELDS = [
    { key: "workplace", label: "근무지" },
    { key: "duties", label: "업무내용" },
    { key: "work_hours", label: "근무시간" },
    { key: "work_conditions", label: "근무조건" },
    { key: "salary", label: "급여조건" },
    { key: "other_conditions", label: "기타조건" },
    { key: "benefits", label: "복리후생" },
    { key: "special_notes", label: "특이사항" },
  ];

  var params = new URLSearchParams(window.location.search);
  var editId = params.get("id");
  var isEdit = Boolean(editId);

  var form = document.getElementById("recruit-form");
  var titleEl = document.getElementById("recruit-title");
  var dateEl = document.getElementById("recruit-date");
  var contactRoleEl = document.getElementById("recruit-contact-role");
  var contactPhoneEl = document.getElementById("recruit-contact-phone");
  var structuredPanel = document.getElementById("recruit-structured-panel");
  var legacyPanel = document.getElementById("recruit-legacy-panel");
  var bodyEl = document.getElementById("recruit-body");
  var formatBadge = document.getElementById("recruit-format-badge");
  var submitBtn = document.getElementById("recruit-submit-btn");
  var cancelBtn = document.getElementById("recruit-cancel-btn");
  var statusEl = document.getElementById("recruit-form-status");
  var pageTitleEl = document.getElementById("admin-page-title");
  var pageMetaEl = document.getElementById("admin-page-meta");
  var fieldEls = {};

  var contentType = "structured";

  STRUCTURED_FIELDS.forEach(function (field) {
    fieldEls[field.key] = document.getElementById("recruit-field-" + field.key);
  });

  if (pageTitleEl) {
    pageTitleEl.textContent = isEdit ? "채용 수정" : "채용 등록";
  }
  if (pageMetaEl) {
    pageMetaEl.textContent = isEdit
      ? "등록된 채용 공고를 수정합니다"
      : "8개 항목 구조화 형식으로 등록합니다";
  }
  if (submitBtn) {
    submitBtn.textContent = isEdit ? "수정 저장" : "등록";
  }
  document.title =
    (isEdit ? "채용 수정" : "채용 등록") + " — 글로벌세아종합관리";

  if (!isEdit && dateEl) {
    dateEl.value = api.toDateInputValue(new Date().toISOString());
  }

  setPanels();

  if (isEdit) {
    setStatus("불러오는 중…");
    api
      .get(editId)
      .then(function (data) {
        var item = data.item;
        if (!item || item.category !== "recruit") {
          throw new Error("채용 공고를 찾을 수 없습니다.");
        }

        contentType = item.content_type === "legacy" ? "legacy" : "structured";
        if (titleEl) titleEl.value = item.title || "";
        if (dateEl) dateEl.value = api.toDateInputValue(item.published_at);
        if (item.contact) {
          if (contactRoleEl) contactRoleEl.value = item.contact.role || "";
          if (contactPhoneEl) contactPhoneEl.value = item.contact.phone || "";
        }

        if (contentType === "legacy") {
          if (bodyEl) bodyEl.value = item.body || "";
        } else {
          var fields = item.fields || {};
          STRUCTURED_FIELDS.forEach(function (field) {
            if (fieldEls[field.key]) {
              fieldEls[field.key].value = fields[field.key] || "";
            }
          });
        }

        setPanels();
        setStatus("");
      })
      .catch(function (err) {
        setStatus(err.message, true);
        if (submitBtn) submitBtn.disabled = true;
      });
  }

  if (cancelBtn) {
    cancelBtn.href = "/admin/recruit.html";
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      save();
    });
  }

  function setPanels() {
    var isLegacy = contentType === "legacy";

    if (structuredPanel) structuredPanel.hidden = isLegacy;
    if (legacyPanel) legacyPanel.hidden = !isLegacy;

    if (formatBadge) {
      if (isEdit) {
        formatBadge.hidden = false;
        formatBadge.textContent = isLegacy ? "텍스트형 (기존 글)" : "구조화";
      } else {
        formatBadge.hidden = false;
        formatBadge.textContent = "구조화 (신규)";
      }
    }
  }

  function save() {
    var title = titleEl ? titleEl.value.trim() : "";
    var publishedAt = dateEl ? dateEl.value : "";
    var contact = {
      role: contactRoleEl ? contactRoleEl.value.trim() : "",
      phone: contactPhoneEl ? contactPhoneEl.value.trim() : "",
    };

    if (!title) {
      setStatus("제목을 입력해 주세요.", true);
      return;
    }
    if (!contact.role || !contact.phone) {
      setStatus("문의 연락처(담당자, 전화번호)를 입력해 주세요.", true);
      return;
    }
    if (!publishedAt) {
      setStatus("등록일을 선택해 주세요.", true);
      return;
    }

    var payload = {
      category: "recruit",
      title: title,
      contact: contact,
      published_at: publishedAt,
    };

    if (contentType === "legacy") {
      payload.content_type = "legacy";
      payload.body = bodyEl ? bodyEl.value : "";
      if (!String(payload.body).trim()) {
        setStatus("본문을 입력해 주세요.", true);
        return;
      }
    } else {
      payload.content_type = "structured";
      var fields = {};
      STRUCTURED_FIELDS.forEach(function (field) {
        var value = fieldEls[field.key] ? fieldEls[field.key].value.trim() : "";
        if (value) fields[field.key] = value;
      });
      payload.fields = fields;
    }

    if (submitBtn) submitBtn.disabled = true;
    setStatus(isEdit ? "저장 중…" : "등록 중…");

    var request = isEdit ? api.update(editId, payload) : api.create(payload);

    request
      .then(function () {
        window.location.href = "/admin/recruit.html";
      })
      .catch(function (err) {
        setStatus(err.message, true);
        if (submitBtn) submitBtn.disabled = false;
      });
  }

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className =
      "admin-status" + (isError ? " admin-status--error" : "") + (message ? "" : " is-hidden");
  }
})();
