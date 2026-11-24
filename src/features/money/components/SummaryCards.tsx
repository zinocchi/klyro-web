import { useTranslation } from 'react-i18next';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { cn, formatIDR } from '../../../lib/utils';
import type { TransactionSummary } from '../../../types/api.types';

export interface SummaryCardsProps {
  summary?: TransactionSummary;
  isLoading?: boolean;
}

interface MetricProps {
  label: string;
  value: number;
  tone: string;
  icon: React.ReactNode;
  loading?: boolean;
}

function Metric({ label, value, tone, icon, loading }: MetricProps) {
  return (
    <div className={cn('flex flex-col gap-2 rounded-[24px] p-6', tone)}>
      <div className="flex items-center gap-2 text-slate">{icon}</div>
      <p className="break-words text-subheading font-medium text-ink">
        {loading ? '—' : formatIDR(value)}
      </p>
      <p className="text-body-sm font-medium text-ink">{label}</p>
    </div>
  );
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Metric
        label={t('money.summary.income')}
        value={summary?.total_income ?? 0}
        tone="bg-mint"
        icon={<ArrowDownLeft size={20} />}
        loading={isLoading}
      />
      <Metric
        label={t('money.summary.expense')}
        value={summary?.total_expense ?? 0}
        tone="bg-sky"
        icon={<ArrowUpRight size={20} />}
        loading={isLoading}
      />
      <Metric
        label={t('money.summary.balance')}
        value={summary?.balance ?? 0}
        tone="bg-lavender"
        icon={<Wallet size={20} />}
        loading={isLoading}
      />
    </div>
  );
}