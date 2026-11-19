import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateNoteRequest, NoteQueryParams, UpdateNoteRequest } from '../../../types/api.types';
import { createNote, deleteNote, listNotes, updateNote } from '../api/notes.api';

export const noteKeys = {
  all: ['notes'] as const,
  list: (params: NoteQueryParams) => ['notes', 'list', params] as const,
};

export function useNotes(params: NoteQueryParams = {}) {
  return useQuery({
    queryKey: noteKeys.list(params),
    queryFn: () => listNotes(params),
  });
}

function useInvalidateNotes() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: noteKeys.all });
}

export function useCreateNote() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: (payload: CreateNoteRequest) => createNote(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateNote() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateNoteRequest }) =>
      updateNote(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteNote() {
  const invalidate = useInvalidateNotes();
  return useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: invalidate,
  });
}