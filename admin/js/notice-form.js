(function () {
  var api = window.SEAH_ADMIN_API;
  if (!api) return;

  var params = new URLSearchParams(window.location.search);
  var editId = params.get("id");
  var isEdit = Boolean(editId);

  var form = document.getElementById("notice-form");
  var titleEl = document.getElementById("notice-title");
  var dateEl = document.getElementById("notice-date");
  var bodyEl = document.getElementById("notice-body");
  var attachmentListEl = document.getElementById("notice-image-list");
  var fileInput = document.getElementById("notice-image-input");
  var uploadBtn = document.getElementById("notice-upload-btn");
  var submitBtn = document.getElementById("notice-submit-btn");
  var cancelBtn = document.getElementById("notice-cancel-btn");
  var statusEl = document.getElementById("notice-form-status");
  var pageTitleEl = document.getElementById("admin-page-title");
  var pageMetaEl = document.getElementById("admin-page-meta");

  var attachments = [];

  if (pageTitleEl) {
    pageTitleEl.textContent = isEdit ? "공지 수정" : "공지 작성";
  }
  if (pageMetaEl) {
    pageMetaEl.textContent = isEdit ? "등록된 공지를 수정합니다" : "새 공지를 등록합니다";
  }
  if (submitBtn) {
    submitBtn.textContent = isEdit ? "수정 저장" : "등록";
  }
  document.title =
    (isEdit ? "공지 수정" : "공지 작성") + " — 글로벌세아종합관리";

  if (!isEdit && dateEl) {
    dateEl.value = api.toDateInputValue(new Date().toISOString());
  }

  if (isEdit) {
    setStatus("불러오는 중…");
    api
      .get(editId)
      .then(function (data) {
        var item = data.item;
        if (!item || item.category !== "notice") {
          throw new Error("공지를 찾을 수 없습니다.");
        }
        if (titleEl) titleEl.value = item.title || "";
        if (dateEl) dateEl.value = api.toDateInputValue(item.published_at);
        if (bodyEl) bodyEl.value = item.body || "";
        attachments = resolveAttachments(item);
        renderAttachments();
        setStatus("");
      })
      .catch(function (err) {
        setStatus(err.message, true);
        if (submitBtn) submitBtn.disabled = true;
      });
  }

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener("click", function () {
      fileInput.click();
    });

    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      fileInput.value = "";
      if (!file) return;

      uploadBtn.disabled = true;
      setStatus("파일 업로드 중…");
      api
        .uploadFile("notice", file)
        .then(function (data) {
          if (data.url) {
            attachments.push({
              url: data.url,
              name: data.name || file.name || "첨부파일",
              mime: data.mime || file.type || "",
              kind: data.kind === "document" ? "document" : "image",
              size: data.size != null ? data.size : file.size,
            });
          }
          renderAttachments();
          setStatus("");
        })
        .catch(function (err) {
          setStatus(err.message, true);
        })
        .finally(function () {
          uploadBtn.disabled = false;
        });
    });
  }

  if (cancelBtn) {
    cancelBtn.href = "/admin/notices.html";
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      save();
    });
  }

  function save() {
    var title = titleEl ? titleEl.value.trim() : "";
    var body = bodyEl ? bodyEl.value : "";
    var publishedAt = dateEl ? dateEl.value : "";
    var hasBody = body.trim().length > 0;
    var hasAttachments = attachments.length > 0;

    if (!title) {
      setStatus("제목을 입력해 주세요.", true);
      return;
    }
    if (!hasBody && !hasAttachments) {
      setStatus("본문 또는 첨부파일 중 하나 이상 입력해 주세요.", true);
      return;
    }
    if (!publishedAt) {
      setStatus("등록일을 선택해 주세요.", true);
      return;
    }

    var payload = {
      category: "notice",
      title: title,
      body: hasBody ? body : null,
      attachments: attachments.slice(),
      published_at: publishedAt,
    };

    if (submitBtn) submitBtn.disabled = true;
    setStatus(isEdit ? "저장 중…" : "등록 중…");

    var request = isEdit
      ? api.update(editId, payload)
      : api.create(payload);

    request
      .then(function () {
        window.location.href = "/admin/notices.html";
      })
      .catch(function (err) {
        setStatus(err.message, true);
        if (submitBtn) submitBtn.disabled = false;
      });
  }

  function resolveAttachments(item) {
    if (item.attachments && item.attachments.length) {
      return item.attachments.map(normalizeAttachment).filter(Boolean);
    }
    return (item.images || []).map(function (url) {
      return {
        url: url,
        name: filenameFromUrl(url),
        mime: "",
        kind: "image",
        size: null,
      };
    });
  }

  function normalizeAttachment(item) {
    if (!item || !item.url) return null;
    return {
      url: item.url,
      name: item.name || filenameFromUrl(item.url),
      mime: item.mime || "",
      kind: item.kind === "document" ? "document" : "image",
      size: item.size != null ? item.size : null,
    };
  }

  function filenameFromUrl(url) {
    var value = String(url || "");
    var parts = value.split("/");
    return parts[parts.length - 1] || "첨부파일";
  }

  function formatFileSize(bytes) {
    if (bytes == null || !Number.isFinite(bytes)) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function renderAttachments() {
    if (!attachmentListEl) return;

    if (!attachments.length) {
      attachmentListEl.innerHTML =
        '<p class="admin-form-hint">등록된 첨부파일이 없습니다.</p>';
      return;
    }

    attachmentListEl.innerHTML = attachments
      .map(function (item, index) {
        var actions =
          '<div class="admin-attachment-item-actions">' +
          '<button type="button" class="admin-btn admin-btn--sm admin-btn--ghost" data-move-up="' +
          index +
          '"' +
          (index === 0 ? " disabled" : "") +
          ">위로</button> " +
          '<button type="button" class="admin-btn admin-btn--sm admin-btn--ghost" data-move-down="' +
          index +
          '"' +
          (index === attachments.length - 1 ? " disabled" : "") +
          ">아래로</button> " +
          '<button type="button" class="admin-btn admin-btn--sm admin-btn--danger" data-remove="' +
          index +
          '">삭제</button>' +
          "</div>";

        if (item.kind === "image") {
          return (
            '<div class="admin-attachment-item admin-attachment-item--image">' +
            '<img src="' +
            escapeAttr(item.url) +
            '" alt="" />' +
            actions +
            "</div>"
          );
        }

        var sizeLabel = formatFileSize(item.size);
        return (
          '<div class="admin-attachment-item admin-attachment-item--document">' +
          '<div class="admin-attachment-doc">' +
          '<span class="admin-attachment-doc-icon" aria-hidden="true">📎</span>' +
          '<div class="admin-attachment-doc-meta">' +
          '<span class="admin-attachment-doc-name">' +
          escapeHtml(item.name) +
          "</span>" +
          (sizeLabel
            ? '<span class="admin-attachment-doc-size">' + escapeHtml(sizeLabel) + "</span>"
            : "") +
          "</div>" +
          "</div>" +
          actions +
          "</div>"
        );
      })
      .join("");

    attachmentListEl.querySelectorAll("[data-remove]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(btn.getAttribute("data-remove"));
        attachments.splice(idx, 1);
        renderAttachments();
      });
    });

    attachmentListEl.querySelectorAll("[data-move-up]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(btn.getAttribute("data-move-up"));
        if (idx <= 0) return;
        var temp = attachments[idx - 1];
        attachments[idx - 1] = attachments[idx];
        attachments[idx] = temp;
        renderAttachments();
      });
    });

    attachmentListEl.querySelectorAll("[data-move-down]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(btn.getAttribute("data-move-down"));
        if (idx >= attachments.length - 1) return;
        var temp = attachments[idx + 1];
        attachments[idx + 1] = attachments[idx];
        attachments[idx] = temp;
        renderAttachments();
      });
    });
  }

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className =
      "admin-status" + (isError ? " admin-status--error" : "") + (message ? "" : " is-hidden");
  }

  function escapeAttr(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function escapeHtml(value) {
    return escapeAttr(value);
  }

  renderAttachments();
})();
