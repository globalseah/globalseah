(function () {
  var api = window.SEAH_ADMIN_API;
  if (!api) return;

  var listEl = document.getElementById("notice-list");
  var statusEl = document.getElementById("notice-list-status");
  var writeBtn = document.getElementById("notice-write-btn");

  if (writeBtn) {
    writeBtn.href = "/admin/notice-edit.html";
  }

  loadList();

  function loadList() {
    setStatus("목록을 불러오는 중…");
    api
      .list("notice")
      .then(function (data) {
        renderList(data.items || []);
      })
      .catch(function (err) {
        setStatus(err.message, true);
        if (listEl) listEl.innerHTML = "";
      });
  }

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "admin-status" + (isError ? " admin-status--error" : "");
  }

  function renderList(items) {
    if (!listEl) return;

    if (!items.length) {
      listEl.innerHTML =
        '<tr><td colspan="4" class="admin-table-empty">등록된 공지가 없습니다. 새 공지를 작성해 주세요.</td></tr>';
      setStatus("");
      return;
    }

    listEl.innerHTML = items
      .map(function (item, index) {
        var hasText = item.body && String(item.body).trim();
        var resolved = resolveAttachments(item);
        var imageCount = resolved.filter(function (a) {
          return a.kind === "image";
        }).length;
        var docCount = resolved.filter(function (a) {
          return a.kind === "document";
        }).length;
        var typeLabel = noticeTypeLabel(hasText, imageCount, docCount);

        return (
          "<tr>" +
          '<td class="admin-table-num">' +
          (items.length - index) +
          "</td>" +
          '<td class="admin-table-title"><a href="/admin/notice-edit.html?id=' +
          encodeURIComponent(item.id) +
          '">' +
          escapeHtml(item.title) +
          "</a></td>" +
          "<td>" +
          escapeHtml(typeLabel) +
          "</td>" +
          '<td class="admin-table-date">' +
          escapeHtml(api.formatDate(item.published_at)) +
          "</td>" +
          '<td class="admin-table-actions">' +
          '<a class="admin-btn admin-btn--sm admin-btn--ghost" href="/admin/notice-edit.html?id=' +
          encodeURIComponent(item.id) +
          '">수정</a> ' +
          '<button type="button" class="admin-btn admin-btn--sm admin-btn--danger" data-delete="' +
          encodeURIComponent(item.id) +
          '">삭제</button>' +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    setStatus("총 " + items.length + "건");

    listEl.querySelectorAll("[data-delete]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = decodeURIComponent(btn.getAttribute("data-delete"));
        if (!confirm("이 공지를 삭제할까요?")) return;
        btn.disabled = true;
        api
          .remove(id)
          .then(function () {
            loadList();
          })
          .catch(function (err) {
            alert(err.message);
            btn.disabled = false;
          });
      });
    });
  }

  function resolveAttachments(item) {
    if (item.attachments && item.attachments.length) {
      return item.attachments;
    }
    return (item.images || []).map(function (url) {
      return { url: url, kind: "image" };
    });
  }

  function noticeTypeLabel(hasText, imageCount, docCount) {
    var parts = [];
    if (hasText) parts.push("텍스트");
    if (imageCount) parts.push("이미지 " + imageCount + "장");
    if (docCount) parts.push("문서 " + docCount + "건");
    return parts.length ? parts.join("+") : "-";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
