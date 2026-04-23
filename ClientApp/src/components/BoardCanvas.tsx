import React, { useCallback, useRef, useEffect } from 'react';
import { useSignalR } from '../hooks/useSignalR';
import { useCanvas } from '../hooks/useCanvas';
import { Toolbar } from './Toolbar/Toolbar';
import { CursorOverlay } from './CursorOverlay/CursorOverlay';
import { CustomThemeToggle } from './Common/CustomThemeToggle';

interface BoardCanvasProps {
  boardId: string;
  nickname: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLeave: () => void;
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({
  boardId, nickname, theme, onToggleTheme, onLeave,
}) => {
  const currentPageIdRef = useRef<string | null>(null);
  const elementsLoadedRef = useRef(false);
  const addElementToCanvasRef = useRef<((el: any) => void) | null>(null);
  const assignElementIdRef = useRef<((id: string) => void) | null>(null);

  const {
    isConnected, elements, cursors, currentPageId, isLoading, sendElement, sendCursor, deleteElement,
  } = useSignalR(
    boardId,
    nickname,
    (newElement) => { addElementToCanvasRef.current?.(newElement); },
    (elementId) => { assignElementIdRef.current?.(elementId); }
  );

  const handleElementAdded = useCallback((fabricObj: any, backendType: string) => {
    const pageId = currentPageIdRef.current;
    if (!pageId) {
      console.error('No pageId!');
      return;
    }
    sendElement(fabricObj, pageId, backendType);
  }, []);

  const {
    selectedTool, setSelectedTool,
    selectedColor, setSelectedColor,
    strokeWidth, setStrokeWidth,
    zoom,
    loadInitialElements,
    addElementToCanvas,
    clearCanvas,
    exportToJPEG,
    assignElementId,
  } = useCanvas(handleElementAdded, deleteElement, false);


  useEffect(() => {
    currentPageIdRef.current = currentPageId;
  }, [currentPageId]);

  useEffect(() => {
  elementsLoadedRef.current = false;
}, [boardId]);

  useEffect(() => {
    addElementToCanvasRef.current = addElementToCanvas;
  }, [addElementToCanvas]);

  useEffect(() => {
    assignElementIdRef.current = assignElementId;
  }, [assignElementId]);

  useEffect(() => {
    if (elementsLoadedRef.current || elements.length === 0) return;
    console.log('Elements available:', elements.length);
    const timer = setTimeout(() => {
      console.log('Loading initial elements:', elements.length);
      loadInitialElements(elements);
      elementsLoadedRef.current = true;
    }, 300);
    return () => clearTimeout(timer);
  }, [elements, loadInitialElements]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (currentPageIdRef.current && isConnected) {
        sendCursor(e.clientX, e.clientY);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [sendCursor, isConnected]);

  const handleExport = () => {
    const dataUrl = exportToJPEG();
    const link = document.createElement('a');
    link.download = `board-${boardId}.jpeg`;
    link.href = dataUrl;
    link.click();
  };

  const handleDeleteBoard = async (e: React.MouseEvent, boardId: string) => {
  e.stopPropagation(); // чтобы не открывался борд
  if (!confirm('Delete this board?')) return;
  try {
    await boardApi.delete(boardId);
    await loadBoards();
  } catch (error) {
    console.error('Failed to delete board:', error);
  }
};

  if (isLoading || !currentPageId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#d5224a] border-t-transparent" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas id="drawing-canvas" style={{ display: 'block', position: 'fixed', top: 0, left: 0 }} />
      <CustomThemeToggle theme={theme} onToggle={onToggleTheme} />
      <CursorOverlay cursors={cursors} zoom={zoom} />
      <Toolbar
        selectedTool={selectedTool}
        onToolChange={setSelectedTool}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        onClear={clearCanvas}
        onExport={handleExport}
        theme={theme}
        onThemeToggle={onToggleTheme}
      />
      <div className="fixed top-4 left-4 z-50 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-lg px-3 py-2 shadow-md border border-gray-200 dark:border-gray-700">
          <img src="/logo.svg" alt="Linia" className="w-6 h-6" />
          <span className="font-semibold text-gray-800 dark:text-white">Linia</span>
        </div>
        <button
          onClick={onLeave}
          className="px-3 py-1.5 text-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          ← Boards
        </button>
        <div className="px-3 py-1.5 text-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-lg shadow-md">
          {nickname} {isConnected ? '🟢' : '🔴'}
        </div>
      </div>
    </div>
  );
};