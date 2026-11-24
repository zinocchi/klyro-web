import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pin, PinOff, Plus, Search, StickyNote } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { cn } from '../../../lib/utils';
import type { Note } from '../../../types/api.types';
import { NoteCard } from '../components/NoteCard';
import { NoteFormModal } from '../components/NoteFormModal';
import { useNotes } from '../hooks/useNotes';
import { TAG_LABEL_KEYS, tagTone } from '../tagLabels';

const SEARCH_DEBOUNCE_MS = 300;

export function NotesPage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [tag, setTag] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useNotes({
    search: debounced || undefined,
    is_pinned: pinnedOnly ? true : undefined,
  });

  const notes = query.data?.notes ?? [];
  const tags = [...new Set(notes.map((n) => n.tag).filter((t): t is string => Boolean(t)))];
  const visible = tag ? notes.filter((n) => n.tag === tag) : notes;

  /** Preset tags have a translation; free-form tags render as typed. */
  const tagLabel = (value: string) => {
    const key = TAG_LABEL_KEYS[value.trim().toLowerCase()];
    return key && i18n.exists(key) ? t(key) : value;
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditing(note);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-heading-sm font-medium text-ink">{t('notes.title')}</h1>
          <p className="mt-1 text-body-sm text-slate">{t('notes.subtitle')}</p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus size={16} />
          {t('notes.newNote')}
        </Button>
      </header>

      <div className="flex flex-col gap-3 rounded-[24px] border border-mist bg-snow p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-iron"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('notes.searchPlaceholder')}
            aria-label={t('notes.search')}
            className="min-h-[44px] w-full rounded-[6px] border border-pebble bg-snow py-3 pr-4 pl-10 text-body-sm text-ink placeholder:text-iron focus:border-monday-violet focus:outline-none focus:ring-1 focus:ring-monday-violet"
          />
        </div>

        <button
          type="button"
          aria-pressed={pinnedOnly}
          onClick={() => setPinnedOnly((v) => !v)}
          className={cn(
            'flex min-h-[44px] items-center justify-center gap-2 rounded-full px-4 text-body-sm font-medium transition-opacity',
            pinnedOnly
              ? 'bg-monday-violet text-snow'
              : 'border border-slate text-ink hover:bg-cloud',
          )}
        >
          {pinnedOnly ? <Pin size={16} /> : <PinOff size={16} />}
          {t('notes.pinned')}
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={tag === null}
            onClick={() => setTag(null)}
            className={cn(
              'rounded-full px-3 py-1 text-caption font-medium transition-colors',
              tag === null
                ? 'bg-monday-violet text-snow'
                : 'border border-pebble bg-snow text-slate hover:border-monday-violet',
            )}
          >
            {t('notes.tagAll')}
          </button>
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tag === t}
              onClick={() => setTag(tag === t ? null : t)}
              className={cn(
                'rounded-full px-3 py-1 text-caption font-medium transition-colors',
                tag === t ? 'bg-monday-violet text-snow' : tagTone(t),
              )}
            >
              {tagLabel(t)}
            </button>
          ))}
        </div>
      )}

      {query.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : query.isError ? (
        <p className="rounded-[24px] border border-mist bg-snow p-8 text-center text-body-sm text-[#e05c5c]">
          {t('notes.loadError')} {query.error?.message}
        </p>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<StickyNote size={32} />}
          title={debounced || pinnedOnly || tag ? t('notes.noMatch') : t('notes.empty')}
          description={
            debounced || pinnedOnly || tag
              ? t('notes.noMatchDescription')
              : t('notes.emptyDescription')
          }
          action={
            <Button onClick={openCreate} className="w-full sm:w-auto">
              <Plus size={16} />
              {t('notes.newNote')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={openEdit} />
          ))}
        </div>
      )}

      <NoteFormModal open={modalOpen} onClose={() => setModalOpen(false)} note={editing} />
    </div>
  );
}