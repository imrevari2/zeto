import { useState, type FC } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { EdfChannel } from "../api/generated.schemas";
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Box,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import SignalChart from "./SignalChart";

interface EdfChannelsProps {
  fileName: string;
  channels?: EdfChannel[];
  disabled: boolean;
}

const EdfChannelsSection: FC<EdfChannelsProps> = ({
  fileName,
  channels,
  disabled,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  console.log(fileName);
  return (
    <Accordion sx={{ mt: 2 }} disabled={disabled}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ backgroundColor: "#f1f7f7" }}
      >
        <Typography sx={{ fontWeight: 600, color: "#0f3d3e" }}>
          Channels
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: 2,
            alignItems: "start",
          }}
        >
          <ToggleButtonGroup
            orientation="vertical"
            exclusive
            value={selectedChannel}
            onChange={(_, value) => value !== null && setSelectedChannel(value)}
            sx={{ maxHeight: 360, overflow: "auto" }}
          >
            {channels?.map((channel, index) => (
              <ToggleButton
                key={index}
                value={index}
                sx={{
                  justifyContent: "flex-start",
                  "&.Mui-selected": {
                    backgroundColor: "#0f3d3e",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#0c3030" },
                  },
                }}
              >
                {channel.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Box
            sx={{
              height: 320,
              overflowX: "auto",
              overflowY: "hidden",
              display: "flex",
              alignItems: "center",
              border: "1px solid #cfe0e0",
              borderRadius: 1,
              p: 1,
            }}
          >
            {selectedChannel === null ? (
              <Typography color="text.secondary">
                Select a channel to display
              </Typography>
            ) : (
              <SignalChart fileName={fileName} channel={selectedChannel} />
            )}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

EdfChannelsSection.displayName = "EdfChannelsSection";

export default EdfChannelsSection;
