import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { TimePicker } from '../../../components/ui/TimePicker';
import { ApiError } from '../../../lib/api';
import { useFieldError } from '../../../i18n/useFieldError';
import type { Habit, TargetDay } from '../../../types/api.types';
import { useCreateHabit, useUpdateHabit } from '../hooks/useHabits';
import { habitFormSchema, TARGET_DAY_OPTIONS, type HabitFormValues } from '../schemas/habit.schema';

export interface HabitFormModalProps {
  open: boolean;
  onClose: () => void;
  habit?: Habit | null;
}

export function HabitFormModal({ open, onClose, habit }: HabitFormModalProps) {
  const { t } = useTranslation();
  return (
    <Modal open={open} onClose={onClose} title={habit ? t('habits.editTitle') : t('habits.newTitle')}>
      {/* Remount per habit so the form starts from that habit's values. */}
      <HabitForm key={habit?.id ?? 'new'} habit={habit} onClose={onClose} />
    </Modal>
  );
}

function HabitForm({ habit, onClose }: { habit?: Habit | null; onClose: () => void }) {
  const { t } = useTranslation();
  const translateError = useFieldError();
  const [formError, setFormError] = useState<string | null>(null);
  const createMutation = useCreateHabit();
  const updateMutation = useUpdateHabit();

  const {
    register,
    handleSubmit,
    setError,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      title: habit?.title ?? '',
      target_days: habit?.target_days ?? [],
      reminder_time: habit?.reminder_time ?? '',
    },
  });

  const selected = useWatch({ control, name: 'target_days' });

  const toggleDay = (day: TargetDay) => {
    const current = getValues('target_days');
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setValue('target_days', next, { shouldValidate: true });
  };

  const onSubmit = (values: HabitFormValues) => {
    setFormError(null);

    const onError = (error: unknown) => {
      if (error instanceof ApiError) {
        for (const field of error.fieldErrors) {
          if (field.field === 'title') {
            setError('title', { message: field.message });
          } else if (field.field.startsWith('target_days')) {
            setError('target_days', { message: field.message });
          } else if (field.field === 'reminder_time') {
            setError('reminder_time', { message: field.message });
          }
        }
        setFormError(error.message);
        toast.error(error.message);
        return;
      }
      setFormError(t('common.genericError'));
      toast.error(t('common.genericError'));
    };

    if (habit) {
      updateMutation.mutate(
        {
          id: habit.id,
          payload: {
            title: values.title,
            target_days: values.target_days,
            reminder_time: values.reminder_time || null,
          },
        },
        {
          onSuccess: () => {
            toast.success(t('habits.toast.updated'));
            onClose();
          },
          onError,
        },
      );
      return;
    }

    createMutation.mutate(
      {
        title: values.title,
        target_days: values.target_days,
        reminder_time: values.reminder_time || null,
      },
      {
        onSuccess: () => {
          toast.success(t('habits.toast.created'));
          onClose();
        },
        onError,
      },
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {formError && (
        <p className="rounded-[6px] bg-[#ffd4d4] px-3 py-2 text-body-sm text-ink">{formError}</p>
      )}

      <Input
        label={t('habits.field.title')}
        placeholder={t('habits.field.titlePlaceholder')}
        error={translateError(errors.title?.message)}
        {...register('title')}
      />

      <div className="flex flex-col gap-2">
        <span className="text-body-sm font-medium text-ink">{t('habits.field.targetDays')}</span>
        <div className="flex flex-wrap gap-2">
          {TARGET_DAY_OPTIONS.map((day) => {
            const active = selected.includes(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={active}
                onClick={() => toggleDay(day)}
                className={
                  active
                    ? 'rounded-[6px] bg-monday-violet px-3 py-1.5 text-caption font-medium text-snow'
                    : 'rounded-[6px] border border-pebble bg-snow px-3 py-1.5 text-caption font-medium text-slate hover:border-monday-violet'
                }
              >
                {t(`habits.days.${day}`)}
              </button>
            );
          })}
        </div>
        {errors.target_days && (
          <p className="text-caption text-[#e05c5c]">{translateError(errors.target_days.message)}</p>
        )}
      </div>

      <Controller
        control={control}
        name="reminder_time"
        render={({ field }) => (
          <TimePicker
            label={t('habits.field.reminder')}
            value={field.value ?? ''}
            onChange={field.onChange}
            clearable
            error={translateError(errors.reminder_time?.message)}
          />
        )}
      />

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={isPending}>
          {habit ? t('habits.saveChanges') : t('habits.create')}
        </Button>
      </div>
    </form>
  );
}
