import React, { useState, useEffect } from 'react';
import { Plus, Users, FileText, Trash2 } from 'lucide-react';
import { boardApi, setAuthHeader } from '../../services/api';
import type { Board } from '../../types/drawing.types';
import { BoardCardSkeleton } from '../Common/SkeletonLoader';
import { CreateBoardModal } from './CreateBoardModal';

interface BoardListProps {
  onSelectBoard: (boardId: string) => void;
  nickname: string;
}

export const BoardList: React.FC<BoardListProps> = ({ onSelectBoard, nickname }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setAuthHeader(nickname);
    loadBoards();
  }, [nickname]);

  const loadBoards = async () => {
    try {
      const response = await boardApi.getAll();
      setBoards(response.data);
    } catch (error) {
      console.error('Failed to load boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (name: string) => {
    try {
      const response = await boardApi.create(name);
      await loadBoards();
      onSelectBoard(response.data.boardId);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const handleDeleteBoard = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this board?')) return;
    try {
      await boardApi.delete(id);
      await loadBoards();
    } catch (error) {
      console.error('Failed to delete board:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Linia" className="w-8 h-8" />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Linia</h1>
            </div>
          </div>
          <BoardCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Linia" className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Linia</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome, {nickname}!</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition shadow-md"
          >
            <Plus size={20} />
            New Board
          </button>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 dark:text-gray-500 text-lg">No boards yet</div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Create your first board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => onSelectBoard(board.id)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                  {board.thumbnailUrl ? (
                    <img src={board.thumbnailUrl} alt={board.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText size={48} className="text-white/50" />
                    </div>
                  )}
                </div>
                <div className="p-4 relative">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{board.name}</h3>
                  <button
                    onClick={(e) => handleDeleteBoard(e, board.id)}
                    className="absolute top-3 right-3 p-1 text-red-400 hover:text-red-600 transition"
                    title="Delete board"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{board.membersCount}</span>
                    </div>
                    <div>{new Date(board.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateBoard}
      />
    </div>
  );
};