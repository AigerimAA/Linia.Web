import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const presetColors = [
  '#000000', '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00',
  '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
  '#8B4513', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
      >
        <div
          className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: color }}
        />
        <Palette size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 w-52">
          
          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Custom color</p>
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-8 cursor-pointer rounded border border-gray-300"
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Presets</p>
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  onChange(preset);
                  setIsOpen(false);
                }}
                className="w-8 h-8 rounded-full transition-transform hover:scale-110 shadow-sm border border-gray-300"
                style={{ backgroundColor: preset }}
              >
                {color === preset && <Check size={14} className="text-white mx-auto" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};