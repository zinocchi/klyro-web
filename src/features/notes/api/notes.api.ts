import api from '../../../lib/axios';
import { unwrap } from '../../../lib/api';
import type {
  ApiResponse,
  CreateNoteRequest,
  DeletedData,
  NoteData,
  NoteQueryParams,
  NotesData,
  UpdateNoteRequest,
} from '../../../types/api.types';

export function listNotes(params: NoteQueryParams = {}) {
  return unwrap<NotesData>(api.get<ApiResponse<NotesData>>('/notes', { params }));
}

export function createNote(payload: CreateNoteRequest) {
  return unwrap<NoteData>(api.post<ApiResponse<NoteData>>('/notes', payload));
}

export function updateNote(id: string, payload: UpdateNoteRequest) {
  return unwrap<NoteData>(api.patch<ApiResponse<NoteData>>(`/notes/${id}`, payload));
}

export function deleteNote(id: string) {
  return unwrap<DeletedData>(api.delete<ApiResponse<DeletedData>>(`/notes/${id}`));
}