// src/components/Toolbar/Toolbar.tsx
import React from 'react';
import {
  Pencil,
  Square,
  Circle,
  Type,
  Eraser,
  Minus,
  Download,
  Trash2,
} from 'lucide-react';
import { ColorPicker } from './ColorPicker';

interface ToolbarProps {
  selectedTool: string;
  onToolChange: (tool: string) => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onClear: () => void;
  onExport: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const tools = [
  { id: 'pen', icon: Pencil, label: 'Pen' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'line', icon: Minus, label: 'Line' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolChange,
  selectedColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onClear,
  onExport,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-4 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`p-2 rounded-xl transition-all duration-200 ${
                selectedTool === tool.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={tool.label}
            >
              <Icon size={20} />
            </button>
          );
        })}

        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1" />

        <ColorPicker color={selectedColor} onChange={onColorChange} />

        <div className="flex items-center gap-2 px-2 border-l border-gray-200 dark:border-gray-700 ml-2">
          {[2, 6, 12].map((value) => (
            <button
              key={value}
              onClick={() => onStrokeWidthChange(value)}
              className={`group relative flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                strokeWidth === value 
                  ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div 
                className={`rounded-full transition-colors ${
                  strokeWidth === value ? 'bg-blue-500' : 'bg-gray-400'
                }`}
                style={{ 
                  width: value === 2 ? '4px' : value === 6 ? '8px' : '14px', 
                  height: value === 2 ? '4px' : value === 6 ? '8px' : '14px' 
                }} 
              />
              <span className="absolute -top-8 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-white text-[10px] px-2 py-1 rounded">
                {value}px
              </span>
            </button>
          ))}
        </div>

        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1" />

        <button
          onClick={onClear}
          className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          title="Clear board"
        >
          <Trash2 size={20} />
        </button>

        <button
          onClick={onExport}
          className="p-2 rounded-xl text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
          title="Export as JPEG"
        >
          <Download size={20} />
        </button>
      </div>
    </div>
  );
};