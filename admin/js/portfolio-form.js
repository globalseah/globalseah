(function () {
  var api = window.SEAH_ADMIN_API;
  if (!api) return;

  var params = new URLSearchParams(window.location.search);
  var editId = params.get("id");
  var isEdit = Boolean(editId);

  var form = document.getElementById("portfolio-form");
  var facilityEl = document.getElementById("portfolio-facility");
  var usageEl = document.getElementById("portfolio-usage");
  var locationEl = document.getElementById("portfolio-location");
  var serviceEl = document.getElementById("portfolio-service");
  var dateEl = document.getElementById("portfolio-date");
  var previewEl = document.getElementById("portfolio-image-preview");
  var previewEmptyEl = document.getElementById("portfolio-image-empty");
  var fileInput = document.getElementById("portfolio-image-input");
  var uploadBtn = document.getElementById("portfolio-upload-btn");
  var removeImageBtn = document.getElementById("portfolio-remove-image");
  var submitBtn = document.getElementById("portfolio-submit-btn");
  var cancelBtn = document.getElementById("portfolio-cancel-btn");
  var statusEl = document.getElementById("portfolio-form-status");
  var pageTitleEl = document.getElementById("admin-page-title");
  var pageMetaEl = document.getElementById("admin-page-meta");

  var imageUrl = "";

  if (pageTitleEl) {
    pageTitleEl.textContent = isEdit ? "실적 수정" : "실적 등록";
  }
  if (pageMetaEl) {
    pageMetaEl.textContent = isEdit
      ? "등록된 실적 카드를 수정합니다"
      : "새 실적 카드를 등록합니다";
  }
  if (submitBtn) {
    submitBtn.textContent = isEdit ? "수정 저장" : "등록";
  }
  document.title =
    (isEdit ? "실적 수정" : "실적 등록") + " — 글로벌세아종합관리";

  if (!isEdit && dateEl) {
    dateEl.value = api.toDateInputValue(new Date().toISOString());
  }

  if (isEdit) {
    setStatus("불러오는 중…");
    api
      .get(editId)
      .then(function (data) {
        var item = data.item;
        if (!item || item.category !== "portfolio") {
          throw new Error("실적을 찾을 수 없습니다.");
        }
        var fields = item.fields || {};
        if (facilityEl) facilityEl.value = fields.facility || item.title || "";
        if (usageEl) usageEl.value = fields.usage || "";
        if (locationEl) locationEl.value = fields.location || "";
        if (serviceEl) serviceEl.value = fields.service || "";
        if (dateEl) dateEl.value = api.toDateInputValue(item.published_at);
        imageUrl = item.image_url || "";
        renderPreview();
        setStatus("");
      })
      .catch(function (err) {
        setStatus(err.message, true);
        if (submitBtn) submitBtn.disabled = true;
      });
  } else {
    renderPreview();
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
        .uploadImage("portfolio", file)
        .then(function (data) {
          imageUrl = data.url || "";
          renderPreview();
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

  if (removeImageBtn) {
    removeImageBtn.addEventListener("click", function () {
      if (!imageUrl) return;
      if (!confirm("등록된 이미지를 제거할까요?")) return;
      imageUrl = "";
      renderPreview();
    });
  }

  if (cancelBtn) {
    cancelBtn.href = "/admin/portfolio.html";
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      save();
    });
  }

  function save() {
    var facility = facilityEl ? facilityEl.value.trim() : "";
    var usage = usageEl ? usageEl.value.trim() : "";
    var location = locationEl ? locationEl.value.trim() : "";
    var service = serviceEl ? serviceEl.value.trim() : "";
    var publishedAt = dateEl ? dateEl.value : "";

    if (!facility) {
      setStatus("시설명을 입력해 주세요.", true);
      return;
    }
    if (!usage) {
      setStatus("용도를 입력해 주세요.", true);
      return;
    }
    if (!location) {
      setStatus("위치를 입력해 주세요.", true);
      return;
    }
    if (!service) {
      setStatus("사업내용을 입력해 주세요.", true);
      return;
    }
    if (!imageUrl) {
      setStatus("이미지를 업로드해 주세요.", true);
      return;
    }
    if (!publishedAt) {
      setStatus("등록일을 선택해 주세요.", true);
      return;
    }

    var payload = {
      category: "portfolio",
      title: facility,
      image_url: imageUrl,
      fields: {
        facility: facility,
        usage: usage,
        location: location,
        service: service,
      },
      published_at: publishedAt,
    };

    if (submitBtn) submitBtn.disabled = true;
    setStatus(isEdit ? "저장 중…" : "등록 중…");

    var request = isEdit
      ? api.update(editId, payload)
      : api.create(payload);

    request
      .then(function () {
        window.location.href = "/admin/portfolio.html";
      })
      .catch(function (err) {
        setStatus(err.message, true);
        if (submitBtn) submitBtn.disabled = false;
      });
  }

  function renderPreview() {
    var hasImage = Boolean(imageUrl);

    if (previewEl) {
      if (hasImage) {
        previewEl.src = imageUrl;
        previewEl.hidden = false;
      } else {
        previewEl.removeAttribute("src");
        previewEl.hidden = true;
      }
    }

    if (previewEmptyEl) {
      previewEmptyEl.hidden = hasImage;
    }

    if (removeImageBtn) {
      removeImageBtn.disabled = !hasImage;
    }
  }

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className =
      "admin-status" + (isError ? " admin-status--error" : "") + (message ? "" : " is-hidden");
  }
})();
