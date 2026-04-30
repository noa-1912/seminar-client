/**
 * CreateJobForm
 * -------------
 * Manager-facing form for creating new jobs.
 *
 * Features:
 * - Full CreateJobDto payload builder with client-side validation.
 * - Optional private-job flow with bulk invitations by student IDs.
 * - Tag selection with chip rendering for readability.
 * - Optional job image upload or direct URL entry.
 *
 * Integration:
 * - Creates jobs through `createJob()`.
 * - Sends invitation batches through `sendBulkInvitations()` when enabled.
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
  Chip,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { createJob, getAllTags, sendBulkInvitations } from "./adminService";
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
  sendPrivateInvitations: false,
  invitedStudentIdsRaw: "",
};

function parseStudentIds(rawValue) {
  const chunks = String(rawValue || "")
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const numbers = chunks
    .map((part) => Number(part))
    .filter((value) => Number.isInteger(value) && value > 0);

  return Array.from(new Set(numbers));
}

/** Returns field-level validation errors for form values. */
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
  if (v.sendPrivateInvitations) {
    const studentIds = parseStudentIds(v.invitedStudentIdsRaw);
    if (studentIds.length === 0) {
      errors.invitedStudentIdsRaw = "יש להזין לפחות מזהה תלמידה אחד";
    }
  }
  return errors;
}

/** Converts form state to backend CreateJobDto payload. */
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
  const [submitSuccess, setSubmitSuccess] = useState("");
  const invitedStudentsCount = parseStudentIds(form.invitedStudentIdsRaw).length;

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
    setSubmitSuccess("");
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      setIsSubmitting(true);
      const createdJob = await createJob(buildCreatePayload(form));

      if (form.sendPrivateInvitations) {
        const studentIds = parseStudentIds(form.invitedStudentIdsRaw);
        const createdJobId = createdJob?.jobId ?? createdJob?.JobId;
        if (!createdJobId) {
          throw new Error("המשרה נוצרה אך לא נמצא מזהה משרה לשליחת הזמנות.");
        }
        await sendBulkInvitations(createdJobId, studentIds);
      }

      setSubmitSuccess(
        form.sendPrivateInvitations
          ? "המשרה נוצרה וההזמנות הפרטיות נשלחו בהצלחה."
          : "המשרה נוצרה בהצלחה."
      );
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
        {submitSuccess ? <Alert severity="success">{submitSuccess}</Alert> : null}

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
                    onChange={(e) => {
                      const checked = e.target.checked;
                      set("isPrivate", checked);
                      if (!checked) {
                        set("sendPrivateInvitations", false);
                        set("invitedStudentIdsRaw", "");
                      }
                    }}
                  />
                }
                label="משרה פרטית (לא בלוח הציבורי)"
              />
            </Stack>
          </Grid>
          {form.isPrivate && (
            <>
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.sendPrivateInvitations}
                      onChange={(e) => set("sendPrivateInvitations", e.target.checked)}
                    />
                  }
                  label="שליחת הזמנות פרטיות לתלמידות מיד לאחר יצירת המשרה"
                />
              </Grid>
              {form.sendPrivateInvitations && (
                <Grid size={12}>
                  <Stack spacing={1}>
                    <TextField
                      fullWidth
                      required
                      label="מזהי תלמידות להזמנה"
                      placeholder="לדוגמה: 101, 102, 215"
                      value={form.invitedStudentIdsRaw}
                      onChange={(e) => set("invitedStudentIdsRaw", e.target.value)}
                      error={Boolean(errors.invitedStudentIdsRaw)}
                      helperText={
                        errors.invitedStudentIdsRaw ||
                        "אפשר להפריד בפסיקים או ברווחים. לדוגמה: 123, 456 789"
                      }
                    />
                    <Stack direction="row" justifyContent="flex-end">
                      <Chip
                        size="small"
                        color={invitedStudentsCount > 0 ? "primary" : "default"}
                        label={`תלמידות נבחרו: ${invitedStudentsCount}`}
                      />
                    </Stack>
                  </Stack>
                </Grid>
              )}
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  ההזמנות ישלחו רק לתלמידות עם מזהים תקינים במערכת.
                </Typography>
              </Grid>
            </>
          )}
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
                  return (
                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                      {selected
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
                  return (
                    <MenuItem key={id} value={id}>
                      <Chip
                        size="small"
                        label={t.tagName ?? t.TagName}
                        color="secondary"
                        variant="outlined"
                      />
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
