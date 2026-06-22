import { Box, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";

interface ErrorProps {
  status?: number;
  message?: string;
}

const STATUS_TEXT: Record<number, string> = {
  404: "Not found",
  422: "File is corrupt or unreadable",
  500: "Server error",
};

const ErrorMessage = ({ status, message }: ErrorProps) => (
  <Box sx={{ textAlign: "center", py: 6, color: "error.main" }}>
    <ErrorOutlineIcon sx={{ fontSize: 56, mb: 1 }} />
    <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 1 }}>
      {status ?? "Error"}
    </Typography>
    <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>
      {message ?? STATUS_TEXT[status ?? 0] ?? "Something went wrong."}
    </Typography>
  </Box>
);

export default ErrorMessage;
