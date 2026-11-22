import { z } from 'zod';

export const noteFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Judul wajib diisi')
    .max(150, 'Judul terlalu panjang'),
  content: z
    .string()
    .trim()
    .min(1, 'Isi catatan wajib diisi')
    .max(5000, 'Isi catatan terlalu panjang'),
  is_pinned: z.boolean(),
  tag: z.string().trim().max(50, 'Tag terlalu panjang').optional().or(z.literal('')),
  /** `datetime-local` value, converted to ISO on submit. */
  remind_at: z.string().optional(),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;

export const noteFilterSchema = z.object({
  search: z.string().trim().max(200).optional(),
  pinnedOnly: z.boolean(),
});

export type NoteFilterValues = z.infer<typeof noteFilterSchema>;