(function () {
  var api = window.SEAH_ADMIN_API;
  if (!api) return;

  var listEl = document.getElementById("recruit-list");
  var statusEl = document.getElementById("recruit-list-status");
  var writeBtn = document.getElementById("recruit-write-btn");

  if (writeBtn) {
    writeBtn.href = "/admin/recruit-edit.html";
  }

  loadList();

  function loadList() {
    setStatus("목록을 불러오는 중…");
    api
      .list("recruit")
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

  function listTitle(item) {
    var title = item.title || "";
    if (item.status === "closed") return title + " [마감]";
    return title;
  }

  function formatLabel(item) {
    return item.content_type === "legacy" ? "텍스트형" : "구조화";
  }

  function renderList(items) {
    if (!listEl) return;

    if (!items.length) {
      listEl.innerHTML =
        '<tr><td colspan="5" class="admin-table-empty">등록된 채용 공고가 없습니다.</td></tr>';
      setStatus("");
      return;
    }

    listEl.innerHTML = items
      .map(function (item, index) {
        return (
          "<tr>" +
          '<td class="admin-table-num">' +
          (items.length - index) +
          "</td>" +
          '<td class="admin-table-title"><a href="/admin/recruit-edit.html?id=' +
          encodeURIComponent(item.id) +
          '">' +
          escapeHtml(listTitle(item)) +
          "</a></td>" +
          '<td class="admin-table-type">' +
          escapeHtml(formatLabel(item)) +
          "</td>" +
          '<td class="admin-table-date">' +
          escapeHtml(api.formatDate(item.published_at)) +
          "</td>" +
          '<td class="admin-table-actions">' +
          '<a class="admin-btn admin-btn--sm admin-btn--ghost" href="/admin/recruit-edit.html?id=' +
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
        if (!confirm("이 채용 공고를 삭제할까요?")) return;
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
