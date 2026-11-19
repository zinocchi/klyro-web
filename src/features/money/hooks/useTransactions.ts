import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateTransactionRequest,
  TransactionQueryParams,
  UpdateTransactionRequest,
} from '../../../types/api.types';
import {
  createTransaction,
  deleteTransaction,
  getTransactionSummary,
  listTransactions,
  updateTransaction,
} from '../api/transactions.api';

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (filters: TransactionQueryParams) => ['transactions', 'list', filters] as const,
  summary: (month: string) => ['transactions', 'summary', month] as const,
};

export function useTransactions(filters: TransactionQueryParams = {}) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => listTransactions(filters),
  });
}

export function useTransactionSummary(month: string) {
  return useQuery({
    queryKey: transactionKeys.summary(month),
    queryFn: () => getTransactionSummary({ month }),
  });
}

function useInvalidateTransactions() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: transactionKeys.all });
}

export function useCreateTransaction() {
  const invalidate = useInvalidateTransactions();
  return useMutation({
    mutationFn: (payload: CreateTransactionRequest) => createTransaction(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateTransactions();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTransactionRequest }) =>
      updateTransaction(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateTransactions();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: invalidate,
  });
}