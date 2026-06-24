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
  var imageListEl = document.getElementById("notice-image-list");
  var fileInput = document.getElementById("notice-image-input");
  var uploadBtn = document.getElementById("notice-upload-btn");
  var submitBtn = document.getElementById("notice-submit-btn");
  var cancelBtn = document.getElementById("notice-cancel-btn");
  var statusEl = document.getElementById("notice-form-status");
  var pageTitleEl = document.getElementById("admin-page-title");
  var pageMetaEl = document.getElementById("admin-page-meta");

  var images = [];

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
        images = (item.images || []).slice();
        renderImages();
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
      setStatus("이미지 업로드 중…");
      api
        .uploadImage("notice", file)
        .then(function (data) {
          if (data.url) images.push(data.url);
          renderImages();
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
    var hasImages = images.length > 0;

    if (!title) {
      setStatus("제목을 입력해 주세요.", true);
      return;
    }
    if (!hasBody && !hasImages) {
      setStatus("본문 또는 이미지 중 하나 이상 입력해 주세요.", true);
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
      images: images.slice(),
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

  function renderImages() {
    if (!imageListEl) return;

    if (!images.length) {
      imageListEl.innerHTML =
        '<p class="admin-form-hint">등록된 이미지가 없습니다.</p>';
      return;
    }

    imageListEl.innerHTML = images
      .map(function (url, index) {
        return (
          '<div class="admin-image-item">' +
          '<img src="' +
          escapeAttr(url) +
          '" alt="" />' +
          '<div class="admin-image-item-actions">' +
          '<button type="button" class="admin-btn admin-btn--sm admin-btn--ghost" data-move-up="' +
          index +
          '"' +
          (index === 0 ? " disabled" : "") +
          ">위로</button> " +
          '<button type="button" class="admin-btn admin-btn--sm admin-btn--ghost" data-move-down="' +
          index +
          '"' +
          (index === images.length - 1 ? " disabled" : "") +
          ">아래로</button> " +
          '<button type="button" class="admin-btn admin-btn--sm admin-btn--danger" data-remove="' +
          index +
          '">삭제</button>' +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    imageListEl.querySelectorAll("[data-remove]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(btn.getAttribute("data-remove"));
        images.splice(idx, 1);
        renderImages();
      });
    });

    imageListEl.querySelectorAll("[data-move-up]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(btn.getAttribute("data-move-up"));
        if (idx <= 0) return;
        var temp = images[idx - 1];
        images[idx - 1] = images[idx];
        images[idx] = temp;
        renderImages();
      });
    });

    imageListEl.querySelectorAll("[data-move-down]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(btn.getAttribute("data-move-down"));
        if (idx >= images.length - 1) return;
        var temp = images[idx + 1];
        images[idx + 1] = images[idx];
        images[idx] = temp;
        renderImages();
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

  renderImages();
})();
