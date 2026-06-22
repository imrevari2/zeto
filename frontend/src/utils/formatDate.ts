export const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US") : "—";
