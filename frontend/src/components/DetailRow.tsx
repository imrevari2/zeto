import { Box, Skeleton, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface DetailRowProps {
  label: string;
  value: ReactNode;
  isLoading?: boolean;
}

const DetailRow = ({ label, value, isLoading }: DetailRowProps) => (
  <Box sx={{ display: "contents" }}>
    <Typography sx={{ fontWeight: 600, color: "text.secondary" }}>
      {label}
    </Typography>
    {isLoading ? <Skeleton /> : <Typography>{value}</Typography>}
  </Box>
);

export default DetailRow;
