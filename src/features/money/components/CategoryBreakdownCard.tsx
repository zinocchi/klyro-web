import { useTranslation } from 'react-i18next';
import { PieChart } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { formatIDR } from '../../../lib/utils';
import type { Transaction } from '../../../types/api.types';

export interface CategoryBreakdownCardProps {
  transactions: Transaction[];
}

const PALETTE = [
  '#6161ff',
  '#ff8940',
  '#e98dfe',
  '#abf0ff',
  '#8181ff',
  '#bcfe90',
  '#fcd0f8',
  '#dbdbff',
];

const RADIUS = 56;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CategoryBreakdownCard({ transactions }: CategoryBreakdownCardProps) {
  const { t } = useTranslation();

  const groups = (() => {
    const totals = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type !== 'EXPENSE') continue;
      totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount);
    }
    return Array.from(totals, ([category, amount]) => ({ category, amount })).sort(
      (a, b) => b.amount - a.amount,
    );
  })();

  const total = groups.reduce((sum, group) => sum + group.amount, 0);
  const segments = groups.map((group, index) => {
    const length = total === 0 ? 0 : (group.amount / total) * CIRCUMFERENCE;
    const offset = groups
      .slice(0, index)
      .reduce((sum, previous) => sum + (previous.amount / total) * CIRCUMFERENCE, 0);
    return { ...group, color: PALETTE[index % PALETTE.length], length, offset };
  });

  return (
    <Card className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-subheading font-medium text-ink">{t('money.categories.title')}</h2>
        <PieChart size={20} className="shrink-0 text-slate" />
      </div>

      {total === 0 ? (
        <p className="py-6 text-center text-body-sm text-slate">{t('money.categories.empty')}</p>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            <svg
              viewBox="0 0 160 160"
              className="h-36 w-36"
              role="img"
              aria-label={t('money.categories.title')}
            >
              <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="#f5f6f8" strokeWidth="18" />
              <g transform="rotate(-90 80 80)">
                {segments.map((segment) => (
                  <circle
                    key={segment.category}
                    cx="80"
                    cy="80"
                    r={RADIUS}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="18"
                    strokeDasharray={`${segment.length} ${CIRCUMFERENCE - segment.length}`}
                    strokeDashoffset={-segment.offset}
                  />
                ))}
              </g>
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <span className="text-caption text-slate">{t('money.categories.total')}</span>
              <span className="break-words text-body-sm font-medium text-ink">
                {formatIDR(total)}
              </span>
            </div>
          </div>

          <ul className="flex w-full min-w-0 flex-col gap-2">
            {groups.map((group, index) => (
              <li key={group.category} className="flex items-center gap-2 text-body-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
                />
                <span className="min-w-0 flex-1 truncate text-ink">{group.category}</span>
                <span className="shrink-0 text-caption text-slate">
                  {Math.round((group.amount / total) * 100)}%
                </span>
                <span className="shrink-0 font-medium text-ink">{formatIDR(group.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
