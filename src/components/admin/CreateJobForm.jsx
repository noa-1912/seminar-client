/**
 * Create job form (manager). POSTs CreateJobDto-shaped payload to POST /api/jobs.
 */
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { createJob, getAllTags } from "./adminService";
import JobImageField from "./JobImageField";
import { FIELD_OPTIONS, JOB_TYPE_OPTIONS } from "./jobFormConstants";

const initial = {
  title: "",
  description: "",
  companyName: "",
  location: "",
  requirements: "",
  experience: 0,
  jobType: 0,
  field: 0,
  isRemote: false,
  isPrivate: false,
  salaryMin: "",
  salaryMax: "",
  jobWebsiteUrl: "",
  jobImageUrl: "",
  deadline: "",
  tagIds: [],
};

function validate(v) {
  const errors = {};
  if (!String(v.title).trim()) errors.title = "שדה חובה";
  if (!String(v.description).trim()) errors.description = "שדה חובה";
  if (!String(v.companyName).trim()) errors.companyName = "שדה חובה";
  if (!String(v.location).trim()) errors.location = "שדה חובה";
  if (!String(v.requirements).trim()) errors.requirements = "שדה חובה";
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

function buildCreatePayload(v) {
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
    deadline: new Date(`${v.deadline}T12:00:00`).toISOString(),
    tagIds: Array.isArray(v.tagIds) ? v.tagIds : [],
  };
}

export default function CreateJobForm({ onSuccess }) {
  const [form, setForm] = useState(initial);
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let c = true;
    getAllTags()
      .then((t) => c && setTags(t))
      .catch(() => {});
    return () => {
      c = false;
    };
  }, []);

  const set = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      setIsSubmitting(true);
      await createJob(buildCreatePayload(form));
      setForm(initial);
      onSuccess?.();
    } catch (err) {
      setSubmitError(err?.message || "לא ניתן ליצור משרה כרגע.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
      <Stack spacing={2}>
        {submitError ? <Alert severity="error">{submitError}</Alert> : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="שם המשרה"
              value={form.title}
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
              value={form.companyName}
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
              value={form.description}
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
              value={form.location}
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
              value={form.requirements}
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
              value={form.experience}
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
              value={form.jobType}
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
              value={form.field}
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
              value={form.salaryMin}
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
              value={form.salaryMax}
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
              value={form.deadline}
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
              value={form.jobWebsiteUrl}
              onChange={(e) => set("jobWebsiteUrl", e.target.value)}
              error={Boolean(errors.jobWebsiteUrl)}
              helperText={errors.jobWebsiteUrl || " "}
            />
          </Grid>
          <Grid size={12}>
            <JobImageField
              value={form.jobImageUrl}
              onChange={(url) => set("jobImageUrl", url)}
              disabled={isSubmitting}
            />
          </Grid>
          <Grid size={12}>
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isRemote}
                    onChange={(e) => set("isRemote", e.target.checked)}
                  />
                }
                label="עבודה מהבית / מרחוק"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isPrivate}
                    onChange={(e) => set("isPrivate", e.target.checked)}
                  />
                }
                label="משרה פרטית (לא בלוח הציבורי)"
              />
            </Stack>
          </Grid>
          <Grid size={12}>
            <FormControl fullWidth>
              <InputLabel id="create-tags-label">תגיות</InputLabel>
              <Select
                labelId="create-tags-label"
                multiple
                value={form.tagIds}
                onChange={(e) =>
                  set("tagIds", typeof e.target.value === "string" ? [] : e.target.value)
                }
                input={<OutlinedInput label="תגיות" />}
                renderValue={(selected) => {
                  if (!selected.length) return "—";
                  return selected
                    .map((id) => tags.find((t) => (t.tagId ?? t.TagId) === id))
                    .filter(Boolean)
                    .map((t) => t.tagName ?? t.TagName)
                    .join(", ");
                }}
              >
                {tags.map((t) => {
                  const id = t.tagId ?? t.TagId;
                  return (
                    <MenuItem key={id} value={id}>
                      {t.tagName ?? t.TagName}
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
            onClick={() => onSuccess?.()}
          >
            ביטול
          </Button>
          <Button
            type="submit"
            variant="contained"
            className="btn btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "יוצר…" : "יצירת משרה"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
