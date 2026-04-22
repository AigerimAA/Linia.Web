import React, { useCallback, useEffect, useRef } from 'react';
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
  boardId,
  nickname,
  theme,
  onToggleTheme,
  onLeave,
}) => {
  const currentPageIdRef = useRef<string | null>(null);

  const { isConnected, elements, cursors, currentPageId, isLoading, sendElement, sendCursor } = useSignalR(boardId, nickname);

  useEffect(() => {
    currentPageIdRef.current = currentPageId;
    console.log('📍 CurrentPageId updated in Ref:', currentPageId);
  }, [currentPageId]);

  const handleElementAdded = useCallback((fabricObj: any, backendType: string) => {
    const currentId = currentPageIdRef.current;
    
    if (!currentId) {
      console.error('❌ BLOCKED: Cannot send element because currentPageId is NULL!');
      return;
    }

    console.log('🚀 Sending to backend...', { type: backendType, pageId: currentId });
    sendElement(fabricObj, currentId, backendType);
  }, [sendElement]); 

  const {
    selectedTool, setSelectedTool,
    selectedColor, setSelectedColor,
    strokeWidth, setStrokeWidth,
    zoom,
    loadElements,
    clearCanvas,
    exportToJPEG,
  } = useCanvas(handleElementAdded, false);

  React.useEffect(() => {
    if (elements.length > 0) {
      loadElements(elements);
    }
  }, [elements, loadElements]);

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

  if (isLoading || !currentPageId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#d5224a] border-t-transparent"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading board & Page ID...</p>
          <p className="text-xs text-gray-400 mt-2">Current ID: {currentPageId || 'Waiting...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        id="drawing-canvas"
        style={{ display: 'block', position: 'fixed', top: 0, left: 0, zIndex: 1 }}
      />
      
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