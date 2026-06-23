import { type FC } from "react";
import { useGetChannelSignal } from "../api/generated";
import { Box, CircularProgress } from "@mui/material";
import type uPlot from "uplot";
import UplotReact from "uplot-react";
import { getErrorStatus, getErrorMessage } from "../api/errorUtils";
import ErrorMessage from "./ErrorMessage";

interface SignalChartProps {
  fileName: string;
  channel: number;
}

const SignalChart: FC<SignalChartProps> = ({ fileName, channel }) => {
  const { data, isLoading, isError, error } = useGetChannelSignal(
    { name: fileName, channel },
    { query: { enabled: !!fileName } }
  );
  if (isLoading)
    return (
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={64} />
      </Box>
    );
  if (isError)
    return (
      <ErrorMessage
        status={getErrorStatus(error)}
        message={getErrorMessage(error)}
      />
    );
  if (!data) return null;

  const samples = data.samples;
  const freq = data.samplingFrequency || 1;
  const xValues = samples.map((_, i) => i / freq);

  const chartData: uPlot.AlignedData = [xValues, samples];

  const options: uPlot.Options = {
    width: 700,
    height: 180,
    legend: { show: false },
    scales: { x: { time: false } },
    series: [
      { label: "Time (s)" },
      { label: data.channelName, stroke: "#0f3d3e", width: 1 },
    ],
  };

  return (
    <div style={{ position: "relative", top: "-200px" }}>
      <UplotReact options={options} data={chartData} />
    </div>
  );
};

SignalChart.displayName = "SignalChart";

export default SignalChart;
