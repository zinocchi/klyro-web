import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';
import { DatePicker } from '../../../components/ui/DatePicker';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { ApiError } from '../../../lib/api';
import { cn, formatIDR, toDateKey } from '../../../lib/utils';
import type { Transaction, TransactionType } from '../../../types/api.types';
import { useCreateTransaction, useUpdateTransaction } from '../hooks/useTransactions';
import { CATEGORY_PRESETS, TYPE_LABEL } from '../moneyLabels';
import { transactionFormSchema, type TransactionFormValues } from '../schemas/transaction.schema';

export interface TransactionFormModalProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

export function TransactionFormModal({ open, onClose, transaction }: TransactionFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={transaction ? 'Edit transaksi' : 'Transaksi baru'}>
      {/* Remount per record so the form starts from that record's values. */}
      <TransactionForm
        key={transaction?.id ?? 'new'}
        transaction={transaction}
        onClose={onClose}
      />
    </Modal>
  );
}

function TransactionForm({
  transaction,
  onClose,
}: {
  transaction?: Transaction | null;
  onClose: () => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: transaction
      ? {
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          note: transaction.note ?? '',
          date: transaction.date.slice(0, 10),
        }
      : {
          type: 'EXPENSE',
          amount: Number.NaN,
          category: '',
          note: '',
          date: toDateKey(),
        },
  });

  const type = useWatch({ control, name: 'type' });
  const category = useWatch({ control, name: 'category' });
  const amount = useWatch({ control, name: 'amount' });
  const presets = CATEGORY_PRESETS[type];

  const onSubmit = (values: TransactionFormValues) => {
    setFormError(null);
    const payload = {
      type: values.type,
      amount: values.amount,
      category: values.category,
      note: values.note || undefined,
      date: values.date || undefined,
    };

    const onError = (error: unknown) => {
      if (error instanceof ApiError) {
        for (const field of error.fieldErrors) {
          if (field.field in values) {
            setError(field.field as keyof TransactionFormValues, { message: field.message });
          }
        }
        setFormError(error.message);
        toast.error(error.message);
        return;
      }
      setFormError('Terjadi kesalahan');
      toast.error('Terjadi kesalahan');
    };

    if (transaction) {
      updateMutation.mutate(
        { id: transaction.id, payload },
        {
          onSuccess: () => {
            toast.success('Transaksi diperbarui');
            onClose();
          },
          onError,
        },
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Transaksi ditambahkan');
        onClose();
      },
      onError,
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {formError && (
        <p className="rounded-[6px] bg-[#ffd4d4] px-3 py-2 text-body-sm text-ink">{formError}</p>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-body-sm font-medium text-ink">Tipe</span>
        <div className="grid grid-cols-2 gap-2">
          {(['EXPENSE', 'INCOME'] as TransactionType[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={type === option}
              onClick={() => setValue('type', option, { shouldValidate: true })}
              className={cn(
                'min-h-[44px] rounded-[6px] text-body-sm font-medium transition-colors',
                type === option
                  ? 'bg-monday-violet text-snow'
                  : 'border border-pebble bg-snow text-slate hover:border-monday-violet',
              )}
            >
              {TYPE_LABEL[option]}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Nominal (Rp)"
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        placeholder="25000"
        error={errors.amount?.message}
        {...register('amount', { valueAsNumber: true })}
      />
      <p className="-mt-2 text-caption text-iron">
        {Number.isFinite(amount) && amount > 0 ? formatIDR(amount) : 'Masukkan nominal rupiah tanpa titik'}
      </p>

      <div className="flex flex-col gap-2">
        <span className="text-body-sm font-medium text-ink">Kategori</span>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-pressed={category === preset}
              onClick={() => setValue('category', preset, { shouldValidate: true })}
              className={cn(
                'min-h-[36px] rounded-[6px] px-3 text-caption font-medium transition-colors',
                category === preset
                  ? 'bg-periwinkle-wash text-ink'
                  : 'bg-cloud text-slate hover:text-ink',
              )}
            >
              {preset}
            </button>
          ))}
        </div>
        <Input
          placeholder="Atau ketik kategori lain"
          error={errors.category?.message}
          {...register('category')}
        />
      </div>

      <Input
        label="Catatan"
        placeholder="Opsional"
        error={errors.note?.message}
        {...register('note')}
      />

      <Controller
        control={control}
        name="date"
        render={({ field }) => (
          <DatePicker
            label="Tanggal"
            placeholder="Pilih tanggal"
            clearable
            maxDate={toDateKey()}
            value={field.value ?? ''}
            onChange={field.onChange}
            error={errors.date?.message}
          />
        )}
      />

      <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          Batal
        </Button>
        <Button type="submit" isLoading={isPending} className="w-full sm:w-auto">
          {transaction ? 'Simpan' : 'Tambah'}
        </Button>
      </div>
    </form>
  );
}