(function () {
  var api = window.SEAH_ADMIN_API;
  if (!api) return;

  var listEl = document.getElementById("portfolio-list");
  var statusEl = document.getElementById("portfolio-list-status");
  var writeBtn = document.getElementById("portfolio-write-btn");

  if (writeBtn) {
    writeBtn.href = "/admin/portfolio-edit.html";
  }

  loadList();

  function loadList() {
    setStatus("목록을 불러오는 중…");
    api
      .list("portfolio")
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

  function field(item, key) {
    if (!item.fields) return "";
    return item.fields[key] || "";
  }

  function renderList(items) {
    if (!listEl) return;

    if (!items.length) {
      listEl.innerHTML =
        '<tr><td colspan="7" class="admin-table-empty">등록된 실적이 없습니다. 새 실적을 추가해 주세요.</td></tr>';
      setStatus("");
      return;
    }

    listEl.innerHTML = items
      .map(function (item, index) {
        var facility = field(item, "facility") || item.title || "";
        var thumb = item.image_url
          ? '<img class="admin-table-thumb" src="' +
            escapeAttr(item.image_url) +
            '" alt="" />'
          : '<span class="admin-table-thumb-empty">—</span>';

        return (
          "<tr>" +
          '<td class="admin-table-num">' +
          (items.length - index) +
          "</td>" +
          '<td class="admin-table-thumb-cell">' +
          thumb +
          "</td>" +
          '<td class="admin-table-title"><a href="/admin/portfolio-edit.html?id=' +
          encodeURIComponent(item.id) +
          '">' +
          escapeHtml(facility) +
          "</a></td>" +
          "<td>" +
          escapeHtml(field(item, "usage")) +
          "</td>" +
          "<td>" +
          escapeHtml(field(item, "location")) +
          "</td>" +
          "<td>" +
          escapeHtml(field(item, "service")) +
          "</td>" +
          '<td class="admin-table-actions">' +
          '<a class="admin-btn admin-btn--sm admin-btn--ghost" href="/admin/portfolio-edit.html?id=' +
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
        if (!confirm("이 실적을 삭제할까요?")) return;
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

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();
