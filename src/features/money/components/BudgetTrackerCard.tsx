import { Link } from 'react-router-dom';
import { Gauge, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/ui/Card';
import { cn, formatIDR, toMonthKey } from '../../../lib/utils';
import { useAuthStore } from '../../../stores/authStore';
import { budgetTone } from '../moneyLabels';

export interface BudgetTrackerCardProps {
  month: string;
  totalExpense: number;
}

/** Days left in the month, today included — `null` when the month is not the current one. */
function daysLeftInMonth(month: string): number | null {
  if (month !== toMonthKey()) return null;
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate() + 1;
}

export function BudgetTrackerCard({ month, totalExpense }: BudgetTrackerCardProps) {
  const { t } = useTranslation();
  const budget = useAuthStore((s) => s.user?.monthly_budget ?? 0);

  if (!budget) {
    return (
      <Card className="flex flex-col gap-3 p-6">
        <Gauge size={20} className="text-slate" />
        <p className="text-subheading font-medium text-ink">{t('money.budget.unsetTitle')}</p>
        <p className="text-body-sm text-slate">{t('money.budget.unsetDescription')}</p>
        <Link
          to="/settings"
          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-monday-violet px-6 py-3 text-body-sm font-medium text-snow transition-opacity hover:opacity-90 sm:w-auto sm:self-start"
        >
          <Settings2 size={16} />
          {t('money.budget.setBudget')}
        </Link>
      </Card>
    );
  }

  const percent = (totalExpense / budget) * 100;
  const tone = budgetTone(percent);
  const remaining = budget - totalExpense;
  const daysLeft = daysLeftInMonth(month);
  const dailySafe = daysLeft !== null && remaining > 0 ? remaining / daysLeft : 0;

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-3">
        <Gauge size={20} className="text-slate" />
        <span
          className={cn(
            'rounded-[6px] px-2 py-0.5 text-caption font-medium',
            tone.badge,
          )}
        >
          {t(`money.budget.status.${tone.status}`)}
        </span>
      </div>

      <div>
        <h2 className="text-subheading font-medium text-ink">{t('money.budget.title')}</h2>
        <p className="mt-1 text-body-sm text-slate">
          {t('money.budget.usedOf', { amount: formatIDR(budget) })}
        </p>
      </div>

      <div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-cloud"
          role="progressbar"
          aria-label={t('money.budget.title')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
        >
          <div
            className={cn('h-full rounded-full transition-[width] duration-700 ease-out', tone.bar)}
            style={{ width: `${Math.min(100, Math.max(2, percent))}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-caption">
          <span className={cn('font-medium', tone.text)}>{Math.round(percent)}%</span>
          <span className="text-slate">
            {formatIDR(totalExpense)} / {formatIDR(budget)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-[16px] bg-cloud p-4">
          <p className="text-caption text-slate">
            {remaining >= 0 ? t('money.budget.remaining') : t('money.budget.over')}
          </p>
          <p
            className={cn(
              'mt-1 break-words text-subheading font-medium',
              remaining >= 0 ? 'text-ink' : 'text-[#e2445c]',
            )}
          >
            {formatIDR(Math.abs(remaining))}
          </p>
        </div>
        {daysLeft !== null && (
          <div className="rounded-[16px] bg-cloud p-4">
            <p className="text-caption text-slate">{t('money.budget.dailySafe')}</p>
            <p className="mt-1 break-words text-subheading font-medium text-ink">
              {formatIDR(dailySafe)}
            </p>
            <p className="mt-0.5 text-caption text-iron">
              {t('money.budget.dailySafeHint', { days: daysLeft })}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
