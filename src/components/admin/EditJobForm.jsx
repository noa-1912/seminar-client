/**
 * EditJobForm
 * -----------
 * Manager-facing edit form for existing jobs.
 *
 * Features:
 * - Loads current job + tags in parallel.
 * - Normalizes API enums and legacy casing variants.
 * - Validates user input before submission.
 * - Sends full UpdateJobDto payload to preserve server contract.
 *
 * Usage:
 * - Rendered inside a modal dialog by `ManagementTable`.
 */
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import JobImageField from "./JobImageField";
import {
  FIELD_OPTIONS,
  JOB_TYPE_OPTIONS,
  fieldFromApi,
  jobTypeFromApi,
} from "./jobFormConstants";
import {
  getAllTags,
  getJobById,
  jobStatusStringToApiValue,
  updateJob,
} from "./adminService";

function toDateInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Resolves numeric tag IDs from tag names included in the loaded job object. */
function resolveTagIdsFromJob(job, allTags) {
  if (!job?.tags?.length || !allTags?.length) return [];
  const names = new Set(job.tags.map((t) => String(t).toLowerCase()));
  return allTags
    .filter((t) => names.has(String(t.tagName ?? t.TagName).toLowerCase()))
    .map((t) => t.tagId ?? t.TagId);
}

const STATUS_OPTIONS = [
  { value: 0, label: "פתוח" },
  { value: 1, label: "סגור" },
  { value: 2, label: "ממתין" },
];

function validate(v) {
  const errors = {};
  if (!String(v.title ?? "").trim()) errors.title = "שדה חובה";
  if (!String(v.description ?? "").trim()) errors.description = "שדה חובה";
  if (!String(v.companyName ?? "").trim()) errors.companyName = "שדה חובה";
  if (!String(v.location ?? "").trim()) errors.location = "שדה חובה";
  if (!String(v.requirements ?? "").trim()) errors.requirements = "שדה חובה";
  const exp = Number(v.experience);
  if (Number.isNaN(exp) || exp < 0) errors.experience = "הזיני מספר 0 או חיובי";
  if (!v.deadline) errors.deadline = "נא לבחור מועד";

  const min = v.salaryMin === "" ? null : Number(v.salaryMin);
  const max = v.salaryMax === "" ? null : Number(v.salaryMax);
  if (v.salaryMin !== "" && Number.isNaN(min)) errors.salaryMin = "מספר לא תקין";
  if (v.salaryMax !== "" && Number.isNaN(max)) errors.salaryMax = "מספר לא תקין";
  if (min != null && max != null && min > max) errors.salaryMax = "המקסימום חייב להיות ≥ המינימום";

  if (v.jobWebsiteUrl?.trim() && !/^https?:\/\//i.test(v.jobWebsiteUrl.trim())) {
    errors.jobWebsiteUrl = "כתובת מלאה (https://…)";
  }
  return errors;
}

/** Converts local edit state into an UpdateJobDto-compatible payload. */
function buildUpdatePayload(v) {
  const salaryMin = v.salaryMin === "" ? null : Math.floor(Number(v.salaryMin));
  const salaryMax = v.salaryMax === "" ? null : Math.floor(Number(v.salaryMax));
  return {
    title: v.title.trim(),
    description: v.description.trim(),
    companyName: v.companyName.trim(),
    location: v.location.trim(),
    requirements: v.requirements.trim(),
    experience: Math.max(0, Math.floor(Number(v.experience) || 0)),
    jobType: Number(v.jobType),
    field: Number(v.field),
    isRemote: Boolean(v.isRemote),
    isPrivate: Boolean(v.isPrivate),
    salaryMin,
    salaryMax,
    jobWebsiteUrl: v.jobWebsiteUrl?.trim() || null,
    jobImageUrl: v.jobImageUrl?.trim() || null,
    status: Number(v.status),
    deadline: v.deadline ? new Date(`${v.deadline}T12:00:00`).toISOString() : null,
    tagIds: Array.isArray(v.tagIds) ? v.tagIds : [],
  };
}

export default function EditJobForm({ open, jobId, onSuccess, onCancel }) {
  const [tags, setTags] = useState([]);
  const [values, setValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open || !jobId) {
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError("");
      setSubmitError("");
      setValues(null);
      setErrors({});

      try {
        const [job, allTags] = await Promise.all([getJobById(jobId), getAllTags()]);
        if (cancelled) return;

        setTags(allTags);
        const sm = job.salaryMin ?? job.SalaryMin;
        const sx = job.salaryMax ?? job.SalaryMax;

        setValues({
          title: job.title ?? job.Title ?? "",
          description: job.description ?? job.Description ?? "",
          companyName: job.companyName ?? job.CompanyName ?? "",
          location: job.location ?? job.Location ?? "",
          requirements: job.requirements ?? job.Requirements ?? "",
          experience: job.experience ?? job.Experience ?? 0,
          jobType: jobTypeFromApi(job.jobType ?? job.JobType),
          field: fieldFromApi(job.field ?? job.Field),
          isRemote: Boolean(job.isRemote ?? job.IsRemote),
          isPrivate: Boolean(job.isPrivate ?? job.IsPrivate),
          salaryMin: sm != null ? String(sm) : "",
          salaryMax: sx != null ? String(sx) : "",
          jobWebsiteUrl: job.jobWebsiteUrl ?? job.JobWebsiteUrl ?? "",
          jobImageUrl: job.jobImageUrl ?? job.JobImageUrl ?? "",
          status: jobStatusStringToApiValue(job.status ?? job.Status),
          deadline: toDateInputValue(job.deadline ?? job.Deadline),
          tagIds: resolveTagIdsFromJob({ tags: job.tags ?? job.Tags }, allTags),
        });
      } catch (e) {
        if (!cancelled) {
          setLoadError(e?.message || "טעינת המשרה נכשלה.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, jobId]);

  const set = (name, val) => {
    setValues((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const next = validate(values);
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      setIsSubmitting(true);
      await updateJob(jobId, buildUpdatePayload(values));
      onSuccess?.();
    } catch (err) {
      setSubmitError(err?.message || "השמירה נכשלה.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  if (isLoading) {
    return (
      <Stack alignItems="center" py={3}>
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          טוען…
        </Typography>
      </Stack>
    );
  }

  if (loadError) {
    return <Alert severity="error">{loadError}</Alert>;
  }

  if (!values) {
    return null;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 0.5 }}>
      <Stack spacing={2}>
        {submitError ? <Alert severity="error">{submitError}</Alert> : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="שם המשרה"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              error={Boolean(errors.title)}
              helperText={errors.title || " "}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="שם המעסיק / חברה"
              value={values.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              error={Boolean(errors.companyName)}
              helperText={errors.companyName || " "}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              required
              label="תיאור"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              multiline
              rows={4}
              error={Boolean(errors.description)}
              helperText={errors.description || " "}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="מיקום"
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
              error={Boolean(errors.location)}
              helperText={errors.location || " "}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="דרישות"
              value={values.requirements}
              onChange={(e) => set("requirements", e.target.value)}
              error={Boolean(errors.requirements)}
              helperText={errors.requirements || " "}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="שנות ניסיון"
              value={values.experience}
              onChange={(e) => set("experience", e.target.value)}
              inputProps={{ min: 0 }}
              error={Boolean(errors.experience)}
              helperText={errors.experience || " "}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="סוג משרה"
              value={values.jobType}
              onChange={(e) => set("jobType", Number(e.target.value))}
            >
              {JOB_TYPE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label="תחום"
              value={values.field}
              onChange={(e) => set("field", Number(e.target.value))}
            >
              {FIELD_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="שכר מינ׳ (אופציונלי)"
              value={values.salaryMin}
              onChange={(e) => set("salaryMin", e.target.value)}
              error={Boolean(errors.salaryMin)}
              helperText={errors.salaryMin || " "}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="שכר מקס׳ (אופציונלי)"
              value={values.salaryMax}
              onChange={(e) => set("salaryMax", e.target.value)}
              error={Boolean(errors.salaryMax)}
              helperText={errors.salaryMax || " "}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              required
              label="מועד אחרון להגשה"
              value={values.deadline}
              onChange={(e) => set("deadline", e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={Boolean(errors.deadline)}
              helperText={errors.deadline || " "}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="אתר משרה (URL)"
              value={values.jobWebsiteUrl}
              onChange={(e) => set("jobWebsiteUrl", e.target.value)}
              error={Boolean(errors.jobWebsiteUrl)}
              helperText={errors.jobWebsiteUrl || " "}
            />
          </Grid>
          <Grid size={12}>
            <JobImageField
              value={values.jobImageUrl}
              onChange={(url) => set("jobImageUrl", url)}
              disabled={isSubmitting}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="סטטוס"
              value={values.status}
              onChange={(e) => set("status", Number(e.target.value))}
            >
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.isRemote}
                    onChange={(e) => set("isRemote", e.target.checked)}
                  />
                }
                label="עבודה מהבית / מרחוק"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.isPrivate}
                    onChange={(e) => set("isPrivate", e.target.checked)}
                  />
                }
                label="משרה פרטית (לא בלוח הציבורי)"
              />
            </Stack>
          </Grid>
          <Grid size={12}>
            <FormControl fullWidth>
              <InputLabel id="edit-job-tags-label">תגיות</InputLabel>
              <Select
                labelId="edit-job-tags-label"
                multiple
                value={values.tagIds}
                onChange={(e) =>
                  set("tagIds", typeof e.target.value === "string" ? [] : e.target.value)
                }
                input={<OutlinedInput label="תגיות" />}
                renderValue={(selected) => {
                  const s = selected || [];
                  if (!s.length) return "—";
                  return (
                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                      {s
                        .map((id) => tags.find((t) => (t.tagId ?? t.TagId) === id))
                        .filter(Boolean)
                        .map((t) => (
                          <Chip
                            key={t.tagId ?? t.TagId}
                            size="small"
                            label={t.tagName ?? t.TagName}
                            color="secondary"
                            variant="outlined"
                          />
                        ))}
                    </Box>
                  );
                }}
              >
                {tags.map((t) => {
                  const id = t.tagId ?? t.TagId;
                  const name = t.tagName ?? t.TagName;
                  return (
                    <MenuItem key={id} value={id}>
                      <Chip size="small" label={name} color="secondary" variant="outlined" />
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5} pt={1}>
          <Button
            type="button"
            variant="outlined"
            className="btn btn--secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            ביטול
          </Button>
          <Button
            type="submit"
            variant="contained"
            className="btn btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "שומר…" : "שמירה"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
