import { isAxiosError } from "axios";

export const getErrorStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined;

export const getErrorMessage = (error: unknown): string | undefined => {
  if (!isAxiosError(error)) {
    return undefined;
  }
  const data = error.response?.data;
  return data?.message ?? data?.error ?? error.message;
};
