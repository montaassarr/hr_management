import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Settings,
  LogOut,
  User
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Employees', path: '/employees' },
    { icon: Building2, label: 'Departments', path: '/departments' },
    { icon: User, label: 'Users & Roles', path: '/users' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    // Clear auth state here if needed
    navigate('/login');
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-purple rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">HR</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">HRMSystem</h2>
              <p className="text-gray-400 text-sm">Management Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-purple text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
            <div className="w-8 h-8 bg-gradient-cyan rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">AD</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Admin User</p>
              <p className="text-gray-400 text-xs">admin@company.com</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
