import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { ApiError } from '../../../lib/api';
import { cn, toDateTimeInputValue } from '../../../lib/utils';
import type { Note } from '../../../types/api.types';
import { useCreateNote, useUpdateNote } from '../hooks/useNotes';
import { noteFormSchema, type NoteFormValues } from '../schemas/note.schema';
import { NOTE_TAGS } from '../tagLabels';

export interface NoteFormModalProps {
  open: boolean;
  onClose: () => void;
  note?: Note | null;
}

export function NoteFormModal({ open, onClose, note }: NoteFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={note ? 'Edit catatan' : 'Catatan baru'}>
      {/* Remount per note so the form starts from that note's values. */}
      <NoteForm key={note?.id ?? 'new'} note={note} onClose={onClose} />
    </Modal>
  );
}

function NoteForm({ note, onClose }: { note?: Note | null; onClose: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: note?.title ?? '',
      content: note?.content ?? '',
      is_pinned: note?.is_pinned ?? false,
      tag: note?.tag ?? '',
      remind_at: toDateTimeInputValue(note?.remind_at),
    },
  });

  const isPinned = useWatch({ control, name: 'is_pinned' });
  const tag = useWatch({ control, name: 'tag' });

  const onSubmit = (values: NoteFormValues) => {
    setFormError(null);

    const onError = (error: unknown) => {
      if (error instanceof ApiError) {
        for (const field of error.fieldErrors) {
          if (field.field === 'title' || field.field === 'content') {
            setError(field.field, { message: field.message });
          }
        }
        setFormError(error.message);
        toast.error(error.message);
        return;
      }
      setFormError('Terjadi kesalahan');
      toast.error('Terjadi kesalahan');
    };

    if (note) {
      updateMutation.mutate(
        {
          id: note.id,
          payload: {
            title: values.title,
            content: values.content,
            is_pinned: values.is_pinned,
            tag: values.tag?.trim() || null,
            remind_at: values.remind_at ? new Date(values.remind_at).toISOString() : null,
          },
        },
        {
          onSuccess: () => {
            toast.success('Catatan diperbarui');
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
        content: values.content,
        is_pinned: values.is_pinned,
        tag: values.tag?.trim() || null,
        remind_at: values.remind_at ? new Date(values.remind_at).toISOString() : null,
      },
      {
        onSuccess: () => {
          toast.success('Catatan dibuat');
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
        label="Judul"
        placeholder="Rencana minggu ini"
        error={errors.title?.message}
        {...register('title')}
      />

      <div className="flex flex-col gap-2">
        <Input
          label="Tag"
          placeholder="Pilih atau tulis tag sendiri…"
          maxLength={50}
          error={errors.tag?.message}
          {...register('tag')}
        />
        <div className="flex flex-wrap gap-2">
          {NOTE_TAGS.map((preset) => {
            const active = (tag ?? '').toLowerCase() === preset.toLowerCase();
            return (
              <button
                key={preset}
                type="button"
                aria-pressed={active}
                onClick={() => setValue('tag', active ? '' : preset, { shouldValidate: true })}
                className={cn(
                  'rounded-full px-3 py-1 text-caption font-medium transition-colors',
                  active
                    ? 'bg-monday-violet text-snow'
                    : 'border border-pebble bg-snow text-slate hover:border-monday-violet',
                )}
              >
                {preset}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="note-content" className="text-body-sm font-medium text-ink">
          Isi
        </label>
        <textarea
          id="note-content"
          rows={6}
          placeholder="Tulis apa saja…"
          className={cn(
            'w-full rounded-[6px] border border-pebble bg-snow px-4 py-3 text-body-sm text-ink',
            'placeholder:text-iron focus:border-monday-violet focus:outline-none focus:ring-1 focus:ring-monday-violet',
            errors.content && 'border-[#e05c5c]',
          )}
          {...register('content')}
        />
        {errors.content && (
          <p className="text-caption text-[#e05c5c]">{errors.content.message}</p>
        )}
      </div>

      <Input
        type="datetime-local"
        label="Pengingat catatan (opsional)"
        error={errors.remind_at?.message}
        {...register('remind_at')}
      />

      <button
        type="button"
        aria-pressed={isPinned}
        onClick={() => setValue('is_pinned', !isPinned)}
        className={cn(
          'min-h-[44px] w-full rounded-[6px] text-body-sm font-medium transition-colors sm:w-auto sm:self-start sm:px-4',
          isPinned
            ? 'bg-periwinkle-wash text-ink'
            : 'border border-pebble bg-snow text-slate hover:border-monday-violet',
        )}
      >
        {isPinned ? 'Disematkan' : 'Sematkan catatan'}
      </button>

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
          {note ? 'Simpan' : 'Buat catatan'}
        </Button>
      </div>
    </form>
  );
}