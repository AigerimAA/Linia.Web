import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface CustomThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export const CustomThemeToggle: React.FC<CustomThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl group"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon 
          size={20} 
          className="text-[#d5224a] transition-transform duration-300 group-hover:rotate-12" 
          strokeWidth={2}
        />
      ) : (
        <Sun 
          size={20} 
          className="text-[#d5224a] transition-transform duration-300 group-hover:rotate-12" 
          strokeWidth={2.5}
        />
      )}
    </button>
  );
};