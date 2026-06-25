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

  function analytics(start, end) {
    var url =
      "/api/admin/analytics?start=" +
      encodeURIComponent(start) +
      "&end=" +
      encodeURIComponent(end);
    return fetch(url).then(parseResponse);
  }

  function analyticsHealth() {
    return fetch("/api/admin/analytics-health").then(parseResponse);
  }

  function todayDate() {
    return formatDateFromLocal(new Date());
  }

  function defaultDateRange(days) {
    var count = Math.max(1, Number(days) || 7);
    var end = new Date();
    end.setDate(end.getDate() - 1);
    var start = new Date(end);
    start.setDate(end.getDate() - (count - 1));
    return {
      start: formatDateFromLocal(start),
      end: formatDateFromLocal(end),
    };
  }

  var ANALYTICS_RANGE_KEY = "seah-admin-analytics-range";

  function getStoredDateRange() {
    try {
      var raw = sessionStorage.getItem(ANALYTICS_RANGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && data.start && data.end) return data;
    } catch (e) {
      /* ignore */
    }
    return null;
  }

  function storeDateRange(start, end) {
    try {
      sessionStorage.setItem(
        ANALYTICS_RANGE_KEY,
        JSON.stringify({ start: start, end: end })
      );
    } catch (e) {
      /* ignore */
    }
  }

  function initialDateRange() {
    return getStoredDateRange() || defaultDateRange(1);
  }

  function formatDateFromLocal(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
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
    analyticsHealth: analyticsHealth,
    todayDate: todayDate,
    defaultDateRange: defaultDateRange,
    initialDateRange: initialDateRange,
    storeDateRange: storeDateRange,
  };
})();
