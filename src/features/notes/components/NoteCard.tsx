import { Pin, PinOff, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDate } from '../../../lib/utils';
import type { Note } from '../../../types/api.types';
import { useDeleteNote, useUpdateNote } from '../hooks/useNotes';

export interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

export function NoteCard({ note, onEdit }: NoteCardProps) {
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const togglePin = () => {
    updateMutation.mutate(
      { id: note.id, payload: { is_pinned: !note.is_pinned } },
      {
        onSuccess: () => toast.success(note.is_pinned ? 'Catatan dilepas' : 'Catatan disematkan'),
        onError: () => toast.error('Gagal memperbarui catatan'),
      },
    );
  };

  const handleDelete = () => {
    if (!window.confirm(`Hapus catatan "${note.title}"?`)) return;
    deleteMutation.mutate(note.id, {
      onSuccess: () => toast.success('Catatan dihapus'),
      onError: () => toast.error('Gagal menghapus catatan'),
    });
  };

  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-[24px] border bg-snow p-5 shadow-[var(--shadow-card)]',
        note.is_pinned ? 'border-monday-violet' : 'border-mist',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 break-words text-body font-medium text-ink">{note.title}</h3>
        <button
          type="button"
          onClick={togglePin}
          disabled={updateMutation.isPending}
          aria-pressed={note.is_pinned}
          aria-label={note.is_pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}
          className={cn(
            'shrink-0 rounded-full p-2 transition-colors',
            note.is_pinned
              ? 'text-monday-violet hover:bg-cloud'
              : 'text-slate hover:bg-cloud hover:text-ink',
          )}
        >
          {note.is_pinned ? <Pin size={16} /> : <PinOff size={16} />}
        </button>
      </div>

      <p className="line-clamp-5 whitespace-pre-line break-words text-body-sm text-slate">
        {note.content}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-pebble pt-3">
        <span className="text-caption text-iron">{formatDate(note.updated_at)}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(note)}
            aria-label={`Edit ${note.title}`}
            className="rounded-full p-2 text-slate transition-colors hover:bg-cloud hover:text-monday-violet"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Delete ${note.title}`}
            className="rounded-full p-2 text-slate transition-colors hover:bg-cloud hover:text-[#e05c5c]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}