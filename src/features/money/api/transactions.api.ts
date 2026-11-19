import api from '../../../lib/axios';
import { unwrap } from '../../../lib/api';
import type {
  ApiResponse,
  CreateTransactionRequest,
  DeletedData,
  TransactionData,
  TransactionQueryParams,
  TransactionSummaryData,
  TransactionSummaryQueryParams,
  TransactionsData,
  UpdateTransactionRequest,
} from '../../../types/api.types';

export function listTransactions(params: TransactionQueryParams = {}) {
  return unwrap<TransactionsData>(
    api.get<ApiResponse<TransactionsData>>('/transactions', { params }),
  );
}

export function getTransactionSummary(params: TransactionSummaryQueryParams = {}) {
  return unwrap<TransactionSummaryData>(
    api.get<ApiResponse<TransactionSummaryData>>('/transactions/summary', { params }),
  );
}

export function createTransaction(payload: CreateTransactionRequest) {
  return unwrap<TransactionData>(
    api.post<ApiResponse<TransactionData>>('/transactions', payload),
  );
}

export function updateTransaction(id: string, payload: UpdateTransactionRequest) {
  return unwrap<TransactionData>(
    api.patch<ApiResponse<TransactionData>>(`/transactions/${id}`, payload),
  );
}

export function deleteTransaction(id: string) {
  return unwrap<DeletedData>(api.delete<ApiResponse<DeletedData>>(`/transactions/${id}`));
}