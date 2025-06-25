import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, searchTerm, onSearchChange }) => {
  const [showNotifications, setShowNotifications] = React.useState(false);
  return (
    <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          {typeof searchTerm === 'string' && typeof onSearchChange === 'function' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => onSearchChange(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          )}
          
          {/* Notifications */}
          <div className="relative">
            <button
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-56 bg-white/90 text-black rounded-lg shadow-lg p-4 z-10">
                <p className="text-center">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
