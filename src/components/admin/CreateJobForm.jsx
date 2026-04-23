import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { createJob } from "./adminService";

const initialFormData = {
  title: "",
  description: "",
  companyName: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  employmentType: "",
  category: "",
  startDate: "",
  expirationDate: "",
  contactEmail: "",
  contactPhone: "",
  requiredExperience: "",
  educationLevel: "",
  positionsAvailable: "",
};

const requiredFields = [
  "title",
  "description",
  "companyName",
  "location",
  "employmentType",
  "startDate",
  "expirationDate",
  "contactEmail",
  "positionsAvailable",
];

const selectOptions = {
  employmentType: ["משרה מלאה", "משרה חלקית", "התמחות", "זמנית"],
  category: ["טכנולוגיה", "חינוך", "אדמיניסטרציה", "בריאות", "אחר"],
  educationLevel: ["תיכון", "דיפלומה", "תואר ראשון", "תואר שני", "ללא דרישה"],
};

function validateForm(formData) {
  const errors = {};

  requiredFields.forEach((field) => {
    if (!String(formData[field] ?? "").trim()) {
      errors[field] = "שדה חובה.";
    }
  });

  if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
    errors.contactEmail = "יש להזין כתובת אימייל תקינה.";
  }

  const salaryMin = Number(formData.salaryMin);
  const salaryMax = Number(formData.salaryMax);
  if (formData.salaryMin && Number.isNaN(salaryMin)) {
    errors.salaryMin = "שכר מינימום חייב להיות מספר.";
  }
  if (formData.salaryMax && Number.isNaN(salaryMax)) {
    errors.salaryMax = "שכר מקסימום חייב להיות מספר.";
  }
  if (!Number.isNaN(salaryMin) && !Number.isNaN(salaryMax) && salaryMin > salaryMax) {
    errors.salaryMax = "שכר מקסימום חייב להיות גדול משכר מינימום.";
  }

  const positions = Number(formData.positionsAvailable);
  if (formData.positionsAvailable && (!Number.isInteger(positions) || positions < 1)) {
    errors.positionsAvailable = "מספר המשרות חייב להיות מספר שלם וחיובי.";
  }

  if (formData.startDate && formData.expirationDate) {
    const start = new Date(formData.startDate);
    const expiry = new Date(formData.expirationDate);
    if (start > expiry) {
      errors.expirationDate = "תאריך הסיום חייב להיות אחרי תאריך ההתחלה.";
    }
  }

  return errors;
}

export default function CreateJobForm({ onSuccess }) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const formFields = useMemo(
    () => [
      { name: "title", label: "שם המשרה", xs: 12, md: 6 },
      { name: "companyName", label: "שם החברה", xs: 12, md: 6 },
      { name: "description", label: "תיאור", xs: 12, multiline: true, rows: 4 },
      { name: "location", label: "מיקום", xs: 12, md: 6 },
      { name: "employmentType", label: "סוג העסקה", xs: 12, md: 6, select: true },
      { name: "category", label: "קטגוריה", xs: 12, md: 6, select: true },
      { name: "educationLevel", label: "רמת השכלה", xs: 12, md: 6, select: true },
      { name: "requiredExperience", label: "ניסיון נדרש", xs: 12, md: 6 },
      { name: "salaryMin", label: "שכר מינימום", xs: 12, md: 6, type: "number" },
      { name: "salaryMax", label: "שכר מקסימום", xs: 12, md: 6, type: "number" },
      { name: "positionsAvailable", label: "מספר משרות פנויות", xs: 12, md: 6, type: "number" },
      { name: "startDate", label: "תאריך התחלה", xs: 12, md: 6, type: "date" },
      { name: "expirationDate", label: "תאריך סיום פרסום", xs: 12, md: 6, type: "date" },
      { name: "contactEmail", label: "אימייל ליצירת קשר", xs: 12, md: 6, type: "email" },
      { name: "contactPhone", label: "טלפון ליצירת קשר", xs: 12, md: 6 },
    ],
    []
  );

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    const nextErrors = validateForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createJob(formData);
      setFormData(initialFormData);
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      setSubmitError("לא ניתן ליצור משרה כרגע. נסי שוב בעוד מספר רגעים.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          מלאי את פרטי המשרה. יש להשלים את כל שדות החובה לפני שליחה.
        </Typography>

        {submitError && <Alert severity="error">{submitError}</Alert>}

        <Grid container spacing={2}>
          {formFields.map((field) => (
            <Grid key={field.name} size={{ xs: field.xs, md: field.md }}>
              <TextField
                fullWidth
                name={field.name}
                label={field.label}
                value={formData[field.name]}
                onChange={handleFieldChange(field.name)}
                error={Boolean(errors[field.name])}
                helperText={errors[field.name] || " "}
                required={requiredFields.includes(field.name)}
                multiline={Boolean(field.multiline)}
                rows={field.rows}
                select={Boolean(field.select)}
                type={field.type || "text"}
                InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
              >
                {field.select
                  ? (selectOptions[field.name] || []).map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))
                  : null}
              </TextField>
            </Grid>
          ))}
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
            {isSubmitting ? "יוצר..." : "יצירת משרה"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
