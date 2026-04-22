import axios from 'axios';
import type { Board } from '../types/drawing.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthHeader = (nickname: string) => {
  api.defaults.headers.common['X-Nickname'] = nickname;
};

export const boardApi = {
  getAll: () => api.get<Board[]>('/board'),
  getById: (id: string) => api.get<Board>(`/board/${id}`),
  create: (name: string) => api.post<{ boardId: string }>('/board', { name }),
  updateThumbnail: (id: string, thumbnailUrl: string) =>
    api.patch(`/board/${id}/thumbnail`, { thumbnailUrl }),
  changeRole: (id: string, nickname: string, role: string) =>
    api.patch(`/board/${id}/members/${nickname}/role`, { role }),
  addPage: (boardId: string) => api.post<{ pageId: string }>(`/boards/${boardId}/pages`),
  deletePage: (boardId: string, pageId: string) =>
    api.delete(`/boards/${boardId}/pages/${pageId}`),
};

export const healthApi = {
  check: () => api.get('/health'),
};