import { useEffect, useRef, useState, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { BoardElement, Cursor } from '../types/drawing.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006';

export const useSignalR = (boardId: string | null, nickname: string) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!boardId || !nickname) return;
    let isMounted = true;

    const loadBoardAndConnect = async () => {
      try {
        const response = await fetch(`${API_URL}/api/board/${boardId}`);
        if (!response.ok) throw new Error('Board not found');
        const boardData = await response.json();
        
        if (boardData.pages?.length > 0) {
          setCurrentPageId(boardData.pages[0].id);
          const allElements = boardData.pages.flatMap((page: any) =>
            page.elements.map((el: any) => ({ ...el, pageId: page.id }))
          );
          setElements(allElements);
        }
        
        if (!connectionRef.current || connectionRef.current.state !== 'Connected') {
          const connection = new HubConnectionBuilder()
            .withUrl(`${API_URL}/drawingHub?nickname=${nickname}`)
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect([0, 2000, 5000, 10000, 15000])
            .build();

          connection.on('ReceiveElement', (element: BoardElement) => {
            setElements(prev => prev.some(e => e.id === element.id) ? prev : [...prev, element]);
          });
          connection.on('ReceiveElementDeleted', (id: string) => {
            setElements(prev => prev.filter(e => e.id !== id));
          });
          connection.on('ReceiveBoardCleared', () => setElements([]));
          connection.on('ReceiveCursor', (cursor: Cursor) => {
            setCursors(prev => [...prev.filter(c => c.nickname !== cursor.nickname), cursor]);
          });
          connection.on('ElementDrawn', (id: string) => console.log('✅ Element drawn:', id));
          connection.on('CommandFailed', (err: string) => console.error('❌ Server error:', err));

          await connection.start();
          await connection.invoke('JoinBoard', boardId);
          
          if (isMounted) {
            setIsConnected(true);
            setIsLoading(false);
            connectionRef.current = connection;
          }
        } else if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load board:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadBoardAndConnect();

    return () => {
      isMounted = false;
      if (connectionRef.current) {
        connectionRef.current.invoke('LeaveBoard', boardId).catch(() => {});
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
    };
  }, [boardId, nickname]);

  const sendElement = useCallback(async (element: any, pageId: string, elementType?: string) => {
    if (!connectionRef.current || !boardId || !pageId) return;
    try {
      await connectionRef.current.invoke('DrawElement', {
        boardId,
        pageId,
        type: elementType || element.type || 'path',
        jsonData: JSON.stringify(element),
        zIndex: 0
      });
    } catch (err) {
      console.error('Failed to send element:', err);
    }
  }, [boardId]);

  const sendCursor = useCallback(async (x: number, y: number) => {
    if (!connectionRef.current || !boardId) return;
    await connectionRef.current.invoke('SendCursor', { boardId, nickname, x, y }).catch(() => {});
  }, [boardId, nickname]);

  const deleteElement = useCallback(async (elementId: string) => {
    if (!connectionRef.current || !boardId) return;
    await connectionRef.current.invoke('DeleteElement', {
      boardId,
      pageId: currentPageId || 'temp',
      elementId,
      requestedBy: nickname
    }).catch(() => {});
  }, [boardId, currentPageId, nickname]);

  return { isConnected, elements, cursors, currentPageId, isLoading, sendElement, sendCursor, deleteElement };
};