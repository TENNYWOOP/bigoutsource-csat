import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Star, 
  ClipboardList, 
  Users, 
  Settings,
  LogOut,
  ChevronLeft,
  History
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';

export function Sidebar() {
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();

  const navItems = [
    { name: 'Survey summary', path: '/', icon: LayoutDashboard },
    ...(hasPermission('view_surveys') ? [{ name: 'Surveys', path: '/surveys', icon: ClipboardList }] : []),
    ...(hasPermission('view_personnel') ? [{ name: 'Personnel', path: '/personnel', icon: Users }] : []),
    ...(hasPermission('view_audit_logs') ? [{ name: 'Audit Logs', path: '/audit-logs', icon: History }] : []),
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-transparent mb-4 mt-2">
        <div className="flex items-center gap-3">
          <img src="/logo-only-bigoutsource.svg" alt="Big Outsource CSAT Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-gray-900 text-lg tracking-tight">Big Outsource CSAT</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 mb-4 px-2 uppercase tracking-wider">
          Management
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-gray-900 text-white" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-gray-300" : "text-gray-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout (Bottom) */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-sm border border-gray-200">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</span>
            <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">{user?.role?.name}</span>
          </div>
        </div>
        <button onClick={logout} className="flex items-center justify-between w-full px-2 text-sm text-red-500 font-medium hover:text-red-600 transition-colors">
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </aside>
  );
}
