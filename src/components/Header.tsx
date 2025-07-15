import React from 'react';
import { Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  title: string;
  showMenu?: boolean;
}

export function Header({ title, showMenu = true }: HeaderProps) {
  const { dispatch } = useApp();

  const handleMenuClick = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          {showMenu && (
            <button
              onClick={handleMenuClick}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors md:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
}