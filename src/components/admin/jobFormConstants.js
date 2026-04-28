/**
 * Dropdown labels (Hebrew UI) and mapping from API enum names to numeric indices
 * for .NET JobType / Field.
 */
export const JOB_TYPE_OPTIONS = [
  { value: 0, label: "משרה מלאה" },
  { value: 1, label: "משרה חלקית" },
  { value: 2, label: "התמחות" },
];

export const FIELD_OPTIONS = [
  { value: 0, label: "פיתוח" },
  { value: 1, label: "בדיקות (QA)" },
  { value: 2, label: "DevOps" },
];

const JOB_TYPE_FROM_API = {
  FullTime: 0,
  PartTime: 1,
  Internship: 2,
};

const FIELD_FROM_API = {
  Development: 0,
  QA: 1,
  DevOps: 2,
};

export function jobTypeFromApi(value) {
  if (typeof value === "number" && value >= 0 && value <= 2) return value;
  return JOB_TYPE_FROM_API[value] ?? 0;
}

export function fieldFromApi(value) {
  if (typeof value === "number" && value >= 0 && value <= 2) return value;
  return FIELD_FROM_API[value] ?? 0;
}

/** Hebrew label for JobType from API (enum name or 0–2). */
export function jobTypeLabelHe(apiValue) {
  if (typeof apiValue === "number" && apiValue >= 0 && apiValue <= 2) {
    return JOB_TYPE_OPTIONS[apiValue]?.label ?? String(apiValue);
  }
  const idx = JOB_TYPE_FROM_API[apiValue];
  return idx !== undefined ? JOB_TYPE_OPTIONS[idx].label : String(apiValue ?? "");
}

/** Hebrew label for Field from API (enum name or 0–2). */
export function fieldLabelHe(apiValue) {
  if (typeof apiValue === "number" && apiValue >= 0 && apiValue <= 2) {
    return FIELD_OPTIONS[apiValue]?.label ?? String(apiValue);
  }
  const idx = FIELD_FROM_API[apiValue];
  return idx !== undefined ? FIELD_OPTIONS[idx].label : String(apiValue ?? "");
}
