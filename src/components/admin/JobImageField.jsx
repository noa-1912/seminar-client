/**
 * JobImageField
 * -------------
 * Reusable image input for job forms.
 *
 * Supports two paths:
 * - Upload local image file to backend storage.
 * - Provide direct HTTPS image URL manually.
 *
 * Output:
 * - Emits a canonical image URL through `onChange`.
 * - Used by both create and edit job forms.
 */
import { useRef, useState } from "react";
import { Box, Button, Stack, TextField } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { uploadJobImage } from "./adminService";

/**
 * @param {Object} props
 * @param {string} props.value Current image URL.
 * @param {(url: string) => void} props.onChange Emits new image URL.
 * @param {boolean} props.disabled Disables control interactions.
 */
export default function JobImageField({ value, onChange, disabled }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError("");
    setUploading(true);
    try {
      const { url } = await uploadJobImage(file);
      onChange(url);
    } catch (err) {
      setUploadError(err?.message || "העלאה נכשלה.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFile}
        disabled={disabled || uploading}
      />
      <Button
        type="button"
        variant="outlined"
        size="small"
        startIcon={<CloudUploadIcon />}
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
      >
        {uploading ? "מעלה…" : "העלאת תמונה"}
      </Button>
      {uploadError ? (
        <Box component="span" sx={{ color: "error.main", fontSize: "0.75rem" }}>
          {uploadError}
        </Box>
      ) : null}
      <TextField
        fullWidth
        size="small"
        label="או קישור לתמונה (URL)"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="https://…"
        helperText="https בלבד"
      />
      {value ? (
        <Box
          sx={{
            maxWidth: 280,
            borderRadius: 1,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            component="img"
            src={value}
            alt=""
            sx={{ width: "100%", display: "block", maxHeight: 160, objectFit: "cover" }}
            onError={(ev) => {
              ev.target.style.display = "none";
            }}
          />
        </Box>
      ) : null}
    </Stack>
  );
}
