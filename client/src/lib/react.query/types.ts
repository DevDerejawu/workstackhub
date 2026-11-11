import type { QueryKey } from "@tanstack/react-query";
import type{ ApiSuccessResponse } from "../../api/types";

export interface UseQueryFetchProps<SuccessDataKeyTypes> {
  queryKey: unknown[];
  queryFn: () => Promise<ApiSuccessResponse<SuccessDataKeyTypes>>;
  enabled?: boolean;
  staleTime?: number;
}

export interface UseMutationFetchProps< SuccessDataKeyTypes,TypesOfDataToSentBackend > {
  mutationFn: (dataToSentBackend: TypesOfDataToSentBackend) => Promise<ApiSuccessResponse<SuccessDataKeyTypes>>;
  onSuccess?: (data: ApiSuccessResponse<SuccessDataKeyTypes>, dataToSentBackend: TypesOfDataToSentBackend) => void;
  onError?: (error: Error) => void;
  invalidate?: QueryKey[];
}