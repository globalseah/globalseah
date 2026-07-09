const CATEGORIES = new Set(["notice", "portfolio", "recruit"]);
const CONTENT_TYPES = new Set(["legacy", "structured"]);

const PORTFOLIO_FIELD_KEYS = ["facility", "usage", "location", "service"];

const RECRUIT_FIELD_KEYS = [
  "workplace",
  "duties",
  "work_hours",
  "work_conditions",
  "salary",
  "other_conditions",
  "benefits",
  "special_notes",
];

function trim(value) {
  return String(value == null ? "" : value).trim();
}

function filenameFromUrl(url) {
  const value = trim(url);
  if (!value) return "첨부파일";
  const parts = value.split("/");
  return parts[parts.length - 1] || "첨부파일";
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images.map((item) => trim(item)).filter(Boolean);
}

function normalizeAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .map(function (item) {
      if (!item || typeof item !== "object") return null;
      const url = trim(item.url);
      if (!url) return null;
      const kind = item.kind === "document" ? "document" : "image";
      const name = trim(item.name) || filenameFromUrl(url);
      const mime = trim(item.mime);
      const size =
        item.size != null && Number.isFinite(Number(item.size))
          ? Number(item.size)
          : null;
      return { url, name, mime, kind, size };
    })
    .filter(Boolean);
}

function attachmentsFromLegacyImages(images) {
  return normalizeImages(images).map(function (url) {
    return {
      url,
      name: filenameFromUrl(url),
      mime: "",
      kind: "image",
      size: null,
    };
  });
}

function resolveNoticeAttachments(row) {
  const attachments = normalizeAttachments(row && row.attachments);
  if (attachments.length) return attachments;
  return attachmentsFromLegacyImages(row && row.images);
}

function imagesFromAttachments(attachments) {
  return normalizeAttachments(attachments)
    .filter(function (item) {
      return item.kind === "image";
    })
    .map(function (item) {
      return item.url;
    });
}

function noticeHasContent(body, attachments, images) {
  const hasBody = trim(body).length > 0;
  const hasAttachments = normalizeAttachments(attachments).length > 0;
  const hasImages = normalizeImages(images).length > 0;
  return hasBody || hasAttachments || hasImages;
}

function normalizeContact(contact) {
  if (!contact || typeof contact !== "object") return null;
  const role = trim(contact.role);
  const phone = trim(contact.phone);
  if (!role || !phone) return null;
  return { role, phone };
}

function normalizeFields(fields) {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return {};
  }
  return fields;
}

function parsePublishedAt(value) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { error: "등록일 형식이 올바르지 않습니다." };
  }
  return { value: date.toISOString() };
}

function validateNotice(payload, isCreate) {
  const title = trim(payload.title);
  if (!title) return "제목을 입력해 주세요.";

  const body = payload.body == null ? "" : String(payload.body);
  const attachments = normalizeAttachments(payload.attachments);
  const images = normalizeImages(payload.images);

  if (isCreate && !noticeHasContent(body, attachments, images)) {
    return "본문 또는 첨부파일 중 하나 이상 입력해 주세요.";
  }

  return null;
}

function validatePortfolio(payload, isCreate) {
  const fields = normalizeFields(payload.fields);
  const facility = trim(fields.facility || payload.title);
  const usage = trim(fields.usage);
  const location = trim(fields.location);
  const service = trim(fields.service);

  if (!facility) return "시설명을 입력해 주세요.";
  if (!usage) return "용도를 입력해 주세요.";
  if (!location) return "위치를 입력해 주세요.";
  if (!service) return "사업내용을 입력해 주세요.";

  const imageUrl = trim(payload.image_url);
  if (isCreate && !imageUrl) return "이미지를 업로드해 주세요.";

  return null;
}

function validateRecruit(payload, isCreate) {
  const title = trim(payload.title);
  if (!title) return "제목을 입력해 주세요.";

  const contentType = payload.content_type || "structured";
  if (!CONTENT_TYPES.has(contentType)) {
    return "채용 형식이 올바르지 않습니다.";
  }

  const contact = normalizeContact(payload.contact);
  if (!contact) return "문의 연락처(담당자, 전화번호)를 입력해 주세요.";

  if (contentType === "legacy") {
    if (isCreate && !trim(payload.body)) {
      return "본문을 입력해 주세요.";
    }
    return null;
  }

  return null;
}

function validatePostPayload(payload, isCreate) {
  const category = trim(payload.category);
  if (!CATEGORIES.has(category)) {
    return "게시판 카테고리가 올바르지 않습니다.";
  }

  if (category === "notice") return validateNotice(payload, isCreate);
  if (category === "portfolio") return validatePortfolio(payload, isCreate);
  return validateRecruit(payload, isCreate);
}

function buildInsertRow(payload) {
  const category = trim(payload.category);
  const published = parsePublishedAt(payload.published_at);
  if (published.error) return { error: published.error };

  const row = {
    category,
    title: trim(payload.title),
    published_at: published.value,
    status: "open",
  };

  if (category === "notice") {
    row.body = payload.body == null ? null : String(payload.body);
    const attachments = normalizeAttachments(payload.attachments);
    if (attachments.length) {
      row.attachments = attachments;
      row.images = imagesFromAttachments(attachments);
    } else {
      row.images = normalizeImages(payload.images);
      row.attachments = attachmentsFromLegacyImages(row.images);
    }
    row.fields = null;
    row.image_url = null;
    row.contact = null;
    row.content_type = null;
  } else if (category === "portfolio") {
    const fields = normalizeFields(payload.fields);
    row.title = trim(fields.facility || payload.title);
    row.fields = {
      facility: trim(fields.facility || payload.title),
      usage: trim(fields.usage),
      location: trim(fields.location),
      service: trim(fields.service),
    };
    row.image_url = trim(payload.image_url);
    row.body = null;
    row.images = [];
    row.attachments = [];
    row.contact = null;
    row.content_type = null;
  } else if (category === "recruit") {
    const contentType = payload.content_type || "structured";
    row.content_type = contentType;
    row.contact = normalizeContact(payload.contact);
    row.status = payload.status === "closed" ? "closed" : "open";

    if (contentType === "legacy") {
      row.body = payload.body == null ? "" : String(payload.body);
      row.fields = null;
    } else {
      const fields = normalizeFields(payload.fields);
      const structured = {};
      RECRUIT_FIELD_KEYS.forEach(function (key) {
        const value = trim(fields[key]);
        if (value) structured[key] = value;
      });
      row.fields = structured;
      row.body = null;
    }
    row.images = [];
    row.attachments = [];
    row.image_url = null;
  }

  return { row };
}

function buildUpdateRow(payload, existing) {
  const updates = {};
  const category = existing.category;

  if (payload.published_at != null) {
    const published = parsePublishedAt(payload.published_at);
    if (published.error) return { error: published.error };
    updates.published_at = published.value;
  }

  if (payload.title != null) {
    updates.title = trim(payload.title);
  }

  if (category === "notice") {
    if (payload.body !== undefined) {
      updates.body = payload.body == null ? null : String(payload.body);
    }
    if (payload.attachments !== undefined) {
      const attachments = normalizeAttachments(payload.attachments);
      updates.attachments = attachments;
      updates.images = imagesFromAttachments(attachments);
    } else if (payload.images !== undefined) {
      updates.images = normalizeImages(payload.images);
      updates.attachments = attachmentsFromLegacyImages(updates.images);
    }

    const nextBody =
      updates.body !== undefined ? updates.body : existing.body;
    const nextAttachments =
      updates.attachments !== undefined
        ? updates.attachments
        : resolveNoticeAttachments(existing);
    const nextImages =
      updates.images !== undefined ? updates.images : existing.images || [];

    if (
      !noticeHasContent(nextBody || "", nextAttachments, nextImages)
    ) {
      return { error: "본문 또는 첨부파일 중 하나 이상 필요합니다." };
    }
  }

  if (category === "portfolio") {
    const fields = normalizeFields(
      payload.fields != null ? payload.fields : existing.fields || {}
    );
    if (payload.fields != null || payload.title != null) {
      updates.fields = {
        facility: trim(fields.facility || payload.title || existing.title),
        usage: trim(fields.usage || (existing.fields && existing.fields.usage)),
        location: trim(
          fields.location || (existing.fields && existing.fields.location)
        ),
        service: trim(
          fields.service || (existing.fields && existing.fields.service)
        ),
      };
      updates.title = updates.fields.facility;
    }
    if (payload.image_url != null) {
      updates.image_url = trim(payload.image_url);
    }
  }

  if (category === "recruit") {
    if (payload.contact != null) {
      const contact = normalizeContact(payload.contact);
      if (!contact) return { error: "문의 연락처를 확인해 주세요." };
      updates.contact = contact;
    }
    if (existing.content_type === "legacy") {
      if (payload.body !== undefined) {
        updates.body = payload.body == null ? "" : String(payload.body);
      }
    } else if (payload.fields != null) {
      const fields = normalizeFields(payload.fields);
      const structured = {};
      RECRUIT_FIELD_KEYS.forEach(function (key) {
        const value = trim(fields[key]);
        if (value) structured[key] = value;
      });
      updates.fields = structured;
    }
  }

  return { updates };
}

module.exports = {
  CATEGORIES,
  RECRUIT_FIELD_KEYS,
  PORTFOLIO_FIELD_KEYS,
  validatePostPayload,
  buildInsertRow,
  buildUpdateRow,
  normalizeImages,
  normalizeAttachments,
  resolveNoticeAttachments,
  imagesFromAttachments,
};
