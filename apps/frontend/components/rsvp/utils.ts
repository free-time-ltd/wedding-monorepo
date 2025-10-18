export function normalizeFormDefaults<
  T extends Record<string, string | number | boolean | null>,
>(defaults: T) {
  const normalized: Record<string, string | number | null> = {};

  for (const [key, value] of Object.entries(defaults)) {
    if (value === 1 || value === true) normalized[key] = "true";
    else if (value === 0 || value === false) normalized[key] = "false";
    else if (value === null) normalized[key] = null;
    else normalized[key] = value;
  }

  return normalized as T;
}

export function serializeFormValues<
  T extends Record<string, string | number | null>,
>(values: T) {
  const serialized: Record<string, number | boolean | null | string> = {};

  for (const [key, value] of Object.entries(values)) {
    if (value === "true") serialized[key] = true;
    else if (value === "false") serialized[key] = false;
    else if (value === null || value === "") serialized[key] = null;
    else serialized[key] = value;
  }

  return serialized as T;
}
