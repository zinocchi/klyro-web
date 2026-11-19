import { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { toMonthKey } from '../../../lib/utils';
import type { Transaction } from '../../../types/api.types';
import { MonthSelector } from '../components/MonthSelector';
import { SummaryCards } from '../components/SummaryCards';
import { TransactionFilters } from '../components/TransactionFilters';
import { TransactionFormModal } from '../components/TransactionFormModal';
import { TransactionList } from '../components/TransactionList';
import { useTransactionSummary, useTransactions } from '../hooks/useTransactions';

export function MoneyPage() {
  const [month, setMonth] = useState(toMonthKey());
  const [type, setType] = useState<'' | 'INCOME' | 'EXPENSE'>('');
  const [category, setCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const listQuery = useTransactions({
    month,
    type: type || undefined,
    category: category.trim() || undefined,
  });
  const summaryQuery = useTransactionSummary(month);

  const transactions = listQuery.data?.transactions ?? [];

  // Offer every category the user has used this month as filter suggestions.
  const knownCategories = (() => {
    const unique = new Set(transactions.map((t) => t.category));
    return Array.from(unique).sort();
  })();

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (transaction: Transaction) => {
    setEditing(transaction);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-heading-sm font-medium text-ink">Money</h1>
          <p className="mt-1 text-body-sm text-slate">
            Catat pemasukan dan pengeluaran bulan ini.
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus size={16} />
          Transaksi
        </Button>
      </header>

      <MonthSelector value={month} onChange={setMonth} />

      <SummaryCards summary={summaryQuery.data?.summary} isLoading={summaryQuery.isPending} />

      <TransactionFilters
        value={{ type: type || undefined, category }}
        categories={knownCategories}
        onChange={(next) => {
          setType(next.type ?? '');
          setCategory(next.category ?? '');
        }}
        onReset={() => {
          setType('');
          setCategory('');
        }}
      />

      {listQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" label="Memuat transaksi" />
        </div>
      ) : listQuery.isError ? (
        <p className="rounded-[24px] border border-mist bg-snow p-8 text-center text-body-sm text-[#e05c5c]">
          Gagal memuat transaksi. {listQuery.error?.message}
        </p>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<Wallet size={32} />}
          title="Belum ada transaksi"
          description="Tambahkan pemasukan atau pengeluaran pertama bulan ini."
          action={
            <Button onClick={openCreate} className="w-full sm:w-auto">
              <Plus size={16} />
              Transaksi
            </Button>
          }
        />
      ) : (
        <TransactionList transactions={transactions} onEdit={openEdit} />
      )}

      <TransactionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        transaction={editing}
      />
    </div>
  );
}