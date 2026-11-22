import { useState } from 'react';
import { AlarmClock, Check, Pin, PinOff, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/Badge';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { cn, formatDate, formatDateTime } from '../../../lib/utils';
import type { Note } from '../../../types/api.types';
import { useDeleteNote, useUpdateNote } from '../hooks/useNotes';
import { tagTone } from '../tagLabels';

export interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

export function NoteCard({ note, onEdit }: NoteCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
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
    deleteMutation.mutate(note.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        toast.success('Catatan dihapus');
      },
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
        <div className="min-w-0">
          <h3 className="break-words text-body font-medium text-ink">{note.title}</h3>
          {note.tag && (
            <Badge className={cn('mt-1', tagTone(note.tag))}>{note.tag}</Badge>
          )}
        </div>
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

      <NoteContent content={note.content} />

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-pebble pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-caption text-iron">{formatDate(note.updated_at)}</span>
          {note.remind_at && (
            <Badge tone="info" className="gap-1">
              <AlarmClock size={12} />
              {formatDateTime(note.remind_at)}
            </Badge>
          )}
        </div>
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
            onClick={() => setConfirmOpen(true)}
            aria-label={`Delete ${note.title}`}
            className="rounded-full p-2 text-slate transition-colors hover:bg-cloud hover:text-[#e2445c]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus catatan?"
        description={`"${note.title}" akan dihapus permanen.`}
        isLoading={deleteMutation.isPending}
      />
    </article>
  );
}

const CHECKLIST_LINE = /^- \[( |x|X)\]\s+(.*)$/;
const MAX_LINES = 8;

/** Note body preview: `- [ ]` / `- [x]` lines render as checkboxes, the rest as text. */
function NoteContent({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="flex flex-col gap-1 text-body-sm text-slate">
      {lines.slice(0, MAX_LINES).map((line, index) => {
        const match = line.match(CHECKLIST_LINE);
        if (match) {
          const checked = match[1].toLowerCase() === 'x';
          return (
            <div key={index} className="flex items-start gap-2">
              <span
                className={cn(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border',
                  checked
                    ? 'border-monday-violet bg-monday-violet text-snow'
                    : 'border-pebble bg-snow text-transparent',
                )}
              >
                <Check size={12} />
              </span>
              <span
                className={cn('min-w-0 break-words', checked && 'text-iron line-through')}
              >
                {match[2]}
              </span>
            </div>
          );
        }
        if (!line.trim()) return <span key={index} className="h-1" aria-hidden="true" />;
        return (
          <p key={index} className="break-words whitespace-pre-line">
            {line}
          </p>
        );
      })}
      {lines.length > MAX_LINES && <span className="text-caption text-iron">…</span>}
    </div>
  );
}