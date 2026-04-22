import React, { useState } from 'react';
import { BoardList } from './components/BoardList/BoardList';
import { BoardCanvas } from './components/BoardCanvas';
import { CustomThemeToggle } from './components/Common/CustomThemeToggle';
import { useTheme } from './hooks/useTheme';
import { setAuthHeader } from './services/api';

const App: React.FC = () => {
  const [nickname, setNickname] = useState<string | null>(null);
  const [inputNickname, setInputNickname] = useState('');
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

if (!nickname) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-between relative">
      <CustomThemeToggle theme={theme} onToggle={toggleTheme} />
      
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-96">
          <div className="flex justify-center my-2">
            <img src="/logo.svg" alt="Linia" className="w-48 h-48 object-contain" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">Drawing Board</p>
          
          <input
            type="text"
            placeholder="Enter your nickname"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#d5224a] mb-3"
            value={inputNickname}
            onChange={(e) => setInputNickname(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && inputNickname.trim()) {
                setNickname(inputNickname.trim());
                setAuthHeader(inputNickname.trim());
              }
            }}
          />
          
          <button
            onClick={() => {
              if (inputNickname.trim()) {
                setNickname(inputNickname.trim());
                setAuthHeader(inputNickname.trim());
              }
            }}
            className="w-full py-2.5 bg-[#d5224a] text-white rounded-lg font-medium transition-all duration-200 hover:bg-[#b81d3f] focus:outline-none focus:ring-2 focus:ring-[#d5224a] focus:ring-offset-2"
          >
            Start Drawing
          </button>
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
        © 2026 Linia | Drawing Board
        <br />
        Built with ASP.NET Core + React + SignalR
      </footer>
    </div>
  );
}
  if (!currentBoardId) {
    return (
      <>
        <CustomThemeToggle theme={theme} onToggle={toggleTheme} />
        <BoardList onSelectBoard={setCurrentBoardId} nickname={nickname} />
      </>
    );
  }

  return (
    <BoardCanvas
      boardId={currentBoardId}
      nickname={nickname}
      theme={theme}
      onToggleTheme={toggleTheme}
      onLeave={() => setCurrentBoardId(null)}
    />
  );
};

export default App;