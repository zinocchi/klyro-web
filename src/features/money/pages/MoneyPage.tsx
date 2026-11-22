import { useMemo, useState } from 'react';
import { Download, Plus, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { toMonthKey } from '../../../lib/utils';
import type { Transaction } from '../../../types/api.types';
import { BudgetTrackerCard } from '../components/BudgetTrackerCard';
import { CategoryBreakdownCard } from '../components/CategoryBreakdownCard';
import { MonthSelector } from '../components/MonthSelector';
import { SummaryCards } from '../components/SummaryCards';
import { TransactionFilters } from '../components/TransactionFilters';
import { TransactionFormModal } from '../components/TransactionFormModal';
import { TransactionList } from '../components/TransactionList';
import { useTransactionSummary, useTransactions } from '../hooks/useTransactions';
import { TYPE_LABEL } from '../moneyLabels';

function downloadCsv(transactions: Transaction[], month: string) {
  const cell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const lines = [
    'Tanggal,Tipe,Kategori,Nominal,Catatan',
    ...transactions.map((tx) =>
      [tx.date.slice(0, 10), TYPE_LABEL[tx.type], tx.category, tx.amount, tx.note ?? '']
        .map(cell)
        .join(','),
    ),
  ];
  const blob = new Blob([`\ufeff${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `klyro-transaksi-${month}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function MoneyPage() {
  const { t } = useTranslation();
  const [month, setMonth] = useState(toMonthKey());
  const [type, setType] = useState<'' | 'INCOME' | 'EXPENSE'>('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  // One request per month; type/category/search filtering stays client-side so the
  // category breakdown always reflects the whole month.
  const listQuery = useTransactions({ month });
  const summaryQuery = useTransactionSummary(month);

  const monthTransactions = useMemo(
    () => listQuery.data?.transactions ?? [],
    [listQuery.data],
  );

  const transactions = useMemo(() => {
    const term = search.trim().toLowerCase();
    const categoryTerm = category.trim().toLowerCase();
    return monthTransactions.filter((tx) => {
      if (type && tx.type !== type) return false;
      if (categoryTerm && !tx.category.toLowerCase().includes(categoryTerm)) return false;
      if (term && !`${tx.category} ${tx.note ?? ''}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [monthTransactions, type, category, search]);

  // Offer every category the user has used this month as filter suggestions.
  const knownCategories = (() => {
    const unique = new Set(monthTransactions.map((t) => t.category));
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
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            variant="secondary"
            onClick={() => downloadCsv(transactions, month)}
            disabled={transactions.length === 0}
            className="w-full sm:w-auto"
          >
            <Download size={16} />
            {t('money.export')}
          </Button>
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus size={16} />
            Transaksi
          </Button>
        </div>
      </header>

      <MonthSelector value={month} onChange={setMonth} />

      <SummaryCards summary={summaryQuery.data?.summary} isLoading={summaryQuery.isPending} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BudgetTrackerCard
          month={month}
          totalExpense={summaryQuery.data?.summary.total_expense ?? 0}
        />
        <CategoryBreakdownCard transactions={monthTransactions} />
      </div>

      <TransactionFilters
        value={{ type: type || undefined, category, search }}
        categories={knownCategories}
        onChange={(next) => {
          setType(next.type ?? '');
          setCategory(next.category);
          setSearch(next.search);
        }}
        onReset={() => {
          setType('');
          setCategory('');
          setSearch('');
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
      ) : transactions.length === 0 && monthTransactions.length > 0 ? (
        <p className="rounded-[24px] border border-mist bg-snow p-8 text-center text-body-sm text-slate">
          {t('money.noMatch')}
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