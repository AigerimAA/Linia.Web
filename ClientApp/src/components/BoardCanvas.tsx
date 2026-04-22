import React from 'react';
import { useSignalR } from '../hooks/useSignalR';
import { DrawingBoard } from './DrawingBoard';

interface BoardCanvasProps {
  boardId: string;
  nickname: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLeave: () => void;
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({
  boardId,
  nickname,
  theme,
  onToggleTheme,
  onLeave,
}) => {
  const { isConnected, elements, cursors, currentPageId, isLoading, sendElement, sendCursor } = useSignalR(boardId, nickname);

  if (isLoading || !currentPageId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#d5224a] border-t-transparent"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <DrawingBoard
      boardId={boardId}
      nickname={nickname}
      theme={theme}
      onToggleTheme={onToggleTheme}
      onLeave={onLeave}
      currentPageId={currentPageId}
      elements={elements}
      cursors={cursors}
      isConnected={isConnected}
      sendElement={sendElement}
      sendCursor={sendCursor}
    />
  );
};