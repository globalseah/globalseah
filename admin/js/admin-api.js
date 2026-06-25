(function () {
  async function parseResponse(res) {
    var data = {};
    try {
      data = await res.json();
    } catch (e) {
      data = {};
    }
    if (!res.ok || data.ok === false) {
      var message = data.error || "요청 처리에 실패했습니다. (" + res.status + ")";
      throw new Error(message);
    }
    return data;
  }

  function list(category) {
    return fetch("/api/admin/posts?category=" + encodeURIComponent(category)).then(
      parseResponse
    );
  }

  function get(id) {
    return fetch("/api/admin/posts?id=" + encodeURIComponent(id)).then(parseResponse);
  }

  function create(payload) {
    return fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(parseResponse);
  }

  function update(id, payload) {
    return fetch("/api/admin/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ id: id }, payload)),
    }).then(parseResponse);
  }

  function remove(id) {
    return fetch("/api/admin/posts?id=" + encodeURIComponent(id), {
      method: "DELETE",
    }).then(parseResponse);
  }

  function uploadImage(category, file) {
    var form = new FormData();
    form.append("category", category);
    form.append("file", file);
    return fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    }).then(parseResponse);
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function toDateInputValue(iso) {
    return formatDate(iso);
  }

  function analytics(range) {
    return fetch(
      "/api/admin/analytics?range=" + encodeURIComponent(range || "7d")
    ).then(parseResponse);
  }

  window.SEAH_ADMIN_API = {
    list: list,
    get: get,
    create: create,
    update: update,
    remove: remove,
    uploadImage: uploadImage,
    formatDate: formatDate,
    toDateInputValue: toDateInputValue,
    analytics: analytics,
  };
})();
