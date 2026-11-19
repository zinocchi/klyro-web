import { useEffect, useState } from 'react';
import { Pin, PinOff, Plus, Search, StickyNote } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { cn } from '../../../lib/utils';
import type { Note } from '../../../types/api.types';
import { NoteCard } from '../components/NoteCard';
import { NoteFormModal } from '../components/NoteFormModal';
import { useNotes } from '../hooks/useNotes';

const SEARCH_DEBOUNCE_MS = 300;

export function NotesPage() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);
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
          <h1 className="break-words text-heading-sm font-medium text-ink">Notes</h1>
          <p className="mt-1 text-body-sm text-slate">Simpan ide dan catatan cepat.</p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus size={16} />
          Catatan
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
            placeholder="Cari judul atau isi catatan…"
            aria-label="Cari catatan"
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
          Yang disematkan
        </button>
      </div>

      {query.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" label="Memuat catatan" />
        </div>
      ) : query.isError ? (
        <p className="rounded-[24px] border border-mist bg-snow p-8 text-center text-body-sm text-[#e05c5c]">
          Gagal memuat catatan. {query.error?.message}
        </p>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<StickyNote size={32} />}
          title={debounced || pinnedOnly ? 'Tidak ada catatan cocok' : 'Belum ada catatan'}
          description={
            debounced || pinnedOnly
              ? 'Coba kata kunci lain atau matikan filter sematan.'
              : 'Buat catatan pertama untuk menyimpan ide.'
          }
          action={
            <Button onClick={openCreate} className="w-full sm:w-auto">
              <Plus size={16} />
              Catatan
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={openEdit} />
          ))}
        </div>
      )}

      <NoteFormModal open={modalOpen} onClose={() => setModalOpen(false)} note={editing} />
    </div>
  );
}