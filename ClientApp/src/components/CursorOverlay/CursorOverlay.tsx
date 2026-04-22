import React from 'react';
import type { Cursor } from '../../types/drawing.types';

interface CursorOverlayProps {
  cursors: Cursor[];
  zoom: number;
}

export const CursorOverlay: React.FC<CursorOverlayProps> = ({ cursors }) => {
  const colors = [
    '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#AF52DE'
  ];

  return (
    <>
      {cursors.map((cursor) => {
        const colorIndex = cursor.nickname.length % colors.length;
        const cursorColor = colors[colorIndex];

        return (
          <div
            key={cursor.nickname}
            className="fixed pointer-events-none z-50 transition-transform duration-100"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 3L19 12L12 13L9 20L5 3Z"
                fill={cursorColor}
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div
              className="absolute top-6 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap shadow-md"
              style={{
                backgroundColor: cursorColor,
                color: '#ffffff'
              }}
            >
              {cursor.nickname}
            </div>
          </div>
        );
      })}
    </>
  );
};