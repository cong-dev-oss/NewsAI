const stringifyFallback = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const isValidationItem = (value) =>
  value &&
  typeof value === "object" &&
  typeof value.msg === "string" &&
  Array.isArray(value.loc);

const formatValidationItem = (item) => {
  const path = item.loc.filter(Boolean).join(".");
  return path ? `${path}: ${item.msg}` : item.msg;
};

const extractFromUnknown = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => {
        if (isValidationItem(item)) return formatValidationItem(item);
        return extractFromUnknown(item);
      })
      .filter(Boolean);
    return parts.join("; ");
  }

  if (typeof value === "object") {
    if (typeof value.message === "string" && value.message.trim()) {
      return value.message.trim();
    }
    if ("detail" in value) {
      const detailText = extractFromUnknown(value.detail);
      if (detailText) return detailText;
    }
    if ("error" in value) {
      const errorText = extractFromUnknown(value.error);
      if (errorText) return errorText;
    }
    const jsonText = stringifyFallback(value);
    if (jsonText === "{}" || jsonText === "[]") {
      return "";
    }
    return jsonText;
  }

  return String(value);
};

export const extractApiErrorMessage = (payload, fallbackMessage = "Request failed") => {
  const resolved = extractFromUnknown(payload);
  return resolved || fallbackMessage;
};
