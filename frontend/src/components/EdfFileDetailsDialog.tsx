import type { FC } from "react";
import { useGetFileByName } from "../api/generated";
import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getErrorStatus, getErrorMessage } from "../api/errorUtils";
import ErrorMessage from "./ErrorMessage";
import DetailRow from "./DetailRow";
import { formatDate } from "../utils/formatDate";
import EdfChannelsSection from "./EdfChannelsSection";

interface EdfFileDetailsProps {
  fileName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const EdfFileDetailsDialog: FC<EdfFileDetailsProps> = ({
  fileName,
  isOpen,
  onClose,
}) => {
  const { data, isLoading, isError, error } = useGetFileByName(
    { name: fileName ?? "" },
    { query: { enabled: !!fileName } }
  );
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: "#0f3d3e",
          color: "#fff",
          fontWeight: 700,
          pr: 6,
        }}
      >
        {fileName}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "#fff" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {!isError && (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                rowGap: 1,
                columnGap: 2,
                mt: 1,
              }}
            >
              <DetailRow
                label="Recording date"
                value={formatDate(data?.recordingDate)}
                isLoading={isLoading}
              />
              <DetailRow
                label="Patient"
                value={data?.patientName ?? "—"}
                isLoading={isLoading}
              />
              <DetailRow
                label="Channels"
                value={data?.numberOfChannels}
                isLoading={isLoading}
              />
              <DetailRow
                label="Length"
                value={`${data?.recordingLengthSeconds} sec`}
                isLoading={isLoading}
              />
              <DetailRow
                label="Annotations"
                value={data?.numberOfAnnotations}
                isLoading={isLoading}
              />
            </Box>
            <EdfChannelsSection
              fileName={fileName!}
              channels={data?.channels}
              disabled={isLoading}
            />
          </>
        )}
        {isError && (
          <ErrorMessage
            status={getErrorStatus(error)}
            message={getErrorMessage(error)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

EdfFileDetailsDialog.displayName = "EdfFileDetailsDialog";

export default EdfFileDetailsDialog;
