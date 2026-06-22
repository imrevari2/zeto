import type { FC } from "react";
import { useState, useMemo } from "react";
import { useGetFilesList } from "../api/generated";
import {
  Chip,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import EdfFileDetailsDialog from "./EdfFileDetailsDialog";
import { EdfFileStatus } from "../api/generated.schemas";
import TableSkeletonRows from "./TableSkeletonRows";
import ErrorMessage from "./ErrorMessage";
import { getErrorStatus, getErrorMessage } from "../api/errorUtils";
import { formatDate } from "../utils/formatDate";

const EdfFilesTable: FC = () => {
  const { data, isLoading, isError, error } = useGetFilesList();
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const sortedData = useMemo(
    () =>
      [...(data ?? [])].sort((a, b) => {
        if (!a.recordingDate && !b.recordingDate) return 0;
        if (!a.recordingDate) return 1;
        if (!b.recordingDate) return -1;

        return order === "asc"
          ? a.recordingDate.localeCompare(b.recordingDate)
          : b.recordingDate.localeCompare(a.recordingDate);
      }),
    [data, order]
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const STATUS_COLOR = {
    VALID: "success",
    MISSING_METADATA: "secondary",
    INCONSISTENT_HEADER: "warning",
    CORRUPT: "error",
  } as const;

  const openFileDetails = (fileName: string, status: EdfFileStatus): void => {
    if (
      status === EdfFileStatus.VALID ||
      status === EdfFileStatus.MISSING_METADATA
    ) {
      setSelectedFile(fileName);
    }
  };

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ErrorMessage
          status={getErrorStatus(error)}
          message={getErrorMessage(error)}
        />
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: 600, color: "#0f3d3e" }}
        >
          EDF fájlok
        </Typography>
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="EDF files table">
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#0f3d3e",
                  "& th": {
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    letterSpacing: "0.5px",
                  },
                }}
              >
                <TableCell>File name</TableCell>
                <TableCell align="right" sortDirection={order}>
                  <TableSortLabel
                    active
                    direction={order}
                    onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
                    sx={{
                      color: "#fff !important",
                      "& .MuiTableSortLabel-icon": {
                        color: "#fff !important",
                      },
                    }}
                  >
                    Recording date
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableSkeletonRows rows={3} columns={3} />
              ) : (
                sortedData.map(({ fileName, recordingDate, status }, index) => (
                  <TableRow
                    onClick={() => openFileDetails(fileName, status)}
                    key={fileName + index}
                    sx={{
                      cursor:
                        status === EdfFileStatus.VALID ||
                        status === EdfFileStatus.MISSING_METADATA
                          ? "pointer"
                          : "default",
                      "&:nth-of-type(odd)": { backgroundColor: "#f5f9f9" },
                      "&:hover": { backgroundColor: "#e0eeee" },
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 500 }}
                    >
                      {fileName}
                    </TableCell>
                    <TableCell align="right">
                      {formatDate(recordingDate)}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={status}
                        color={STATUS_COLOR[status] ?? "default"}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <EdfFileDetailsDialog
          fileName={selectedFile}
          isOpen={selectedFile !== null}
          onClose={() => setSelectedFile(null)}
        />
      </Container>
    </>
  );
};

EdfFilesTable.displayName = "EdfFilesTable";

export default EdfFilesTable;
