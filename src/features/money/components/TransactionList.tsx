import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDate, formatIDR } from '../../../lib/utils';
import type { Transaction } from '../../../types/api.types';
import { useDeleteTransaction } from '../hooks/useTransactions';
import { TYPE_LABEL, TYPE_TONE } from '../moneyLabels';

export interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onEdit }: TransactionListProps) {
  const remove = useDeleteTransaction();

  const handleDelete = (transaction: Transaction) => {
    if (!window.confirm(`Hapus transaksi "${transaction.category}"?`)) return;
    remove.mutate(transaction.id, {
      onSuccess: () => toast.success('Transaksi dihapus'),
      onError: () => toast.error('Gagal menghapus transaksi'),
    });
  };

  return (
    <ul className="divide-y divide-pebble rounded-[24px] border border-mist bg-snow shadow-[var(--shadow-card)]">
      {transactions.map((transaction) => {
        const income = transaction.type === 'INCOME';
        return (
          <li
            key={transaction.id}
            className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-cloud sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center rounded-[6px] px-2 py-0.5 text-caption font-medium',
                    TYPE_TONE[transaction.type],
                  )}
                >
                  {transaction.category}
                </span>
                <span className="text-caption text-iron">{TYPE_LABEL[transaction.type]}</span>
                <span className="text-caption text-iron">{formatDate(transaction.date)}</span>
              </div>
              {transaction.note && (
                <p className="mt-1 break-words text-body-sm text-slate">{transaction.note}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <p
                className={cn(
                  'whitespace-nowrap text-body font-medium',
                  income ? 'text-[#2a5c4e]' : 'text-[#c2410c]',
                )}
              >
                {income ? '+' : '−'}
                {formatIDR(transaction.amount)}
              </p>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(transaction)}
                  aria-label={`Edit ${transaction.category}`}
                  className="rounded-full p-2 text-slate transition-colors hover:bg-snow hover:text-monday-violet"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(transaction)}
                  aria-label={`Delete ${transaction.category}`}
                  className="rounded-full p-2 text-slate transition-colors hover:bg-snow hover:text-[#e05c5c]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}