import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationFetchProps } from '../types';
export function useMutationFetch<SucessDataKeyTypes, TypesOfDataToSentBackend>({
  mutationFn,
  onSuccess,
  onError,
  invalidate = [],
}: UseMutationFetchProps<SucessDataKeyTypes, TypesOfDataToSentBackend>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data, dataToSentBackend) => {
      invalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      onSuccess?.(data, dataToSentBackend);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
}
