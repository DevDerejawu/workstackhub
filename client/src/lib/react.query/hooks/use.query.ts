import { useQuery } from '@tanstack/react-query';
import type { UseQueryFetchProps } from '../types';
export function useQueryFetch<TData = unknown>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 5 * 60 * 1000,
}: UseQueryFetchProps<TData>) {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime,
  });
}