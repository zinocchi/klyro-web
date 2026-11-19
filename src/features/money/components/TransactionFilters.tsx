import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { TYPE_LABEL } from '../moneyLabels';
import type { TransactionFilterValues } from '../schemas/transaction.schema';
import type { TransactionType } from '../../../types/api.types';

export interface TransactionFiltersProps {
  value: Pick<TransactionFilterValues, 'type' | 'category'>;
  categories: string[];
  onChange: (value: Pick<TransactionFilterValues, 'type' | 'category'>) => void;
  onReset: () => void;
}

export function TransactionFilters({
  value,
  categories,
  onChange,
  onReset,
}: TransactionFiltersProps) {
  const hasFilters = Boolean(value.type || value.category);

  return (
    <div className="grid grid-cols-1 gap-3 rounded-[24px] border border-mist bg-snow p-4 shadow-[var(--shadow-card)] sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
      <Select
        label="Tipe"
        value={value.type ?? ''}
        onChange={(e) =>
          onChange({
            ...value,
            type: (e.target.value || undefined) as TransactionType | undefined,
          })
        }
      >
        <option value="">Semua tipe</option>
        <option value="INCOME">{TYPE_LABEL.INCOME}</option>
        <option value="EXPENSE">{TYPE_LABEL.EXPENSE}</option>
      </Select>

      <Input
        label="Kategori"
        list="transaction-categories"
        placeholder="Semua kategori"
        value={value.category ?? ''}
        onChange={(e) => onChange({ ...value, category: e.target.value })}
      />
      <datalist id="transaction-categories">
        {categories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>

      <Button
        variant="secondary"
        onClick={onReset}
        disabled={!hasFilters}
        className="w-full lg:w-auto"
      >
        Reset
      </Button>
    </div>
  );
}