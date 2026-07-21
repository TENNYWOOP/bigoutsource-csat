import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  History
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';

interface SidebarProps {
  isCollapsed?: boolean;
  setIsCollapsed?: (val: boolean) => void;
}

export function Sidebar({ isCollapsed = false, setIsCollapsed }: SidebarProps) {
  const location = useLocation();
  const { user, logout, canManage, isGlobal } = useAuth();

  const navItems = [
    { name: 'Survey summary', path: '/', icon: LayoutDashboard },
    { name: 'Surveys', path: '/surveys', icon: ClipboardList },
    ...(canManage() ? [{ name: 'Personnel', path: '/personnel', icon: Users }] : []),
    ...(canManage() ? [{ name: 'Audit Logs', path: '/audit-logs', icon: History }] : []),
    ...(isGlobal() ? [{ name: 'Settings', path: '/settings', icon: Settings }] : []),
  ];

  const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <aside className={cn("bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col fixed left-0 top-0 transition-all duration-300", isCollapsed ? "w-20" : "w-64")}>
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-transparent mb-4 mt-2 overflow-hidden">
        <div className="flex items-center gap-3">
          <img src="/logo-only-bigoutsource.svg" alt="Big Outsource CSAT Logo" className="w-8 h-8 object-contain shrink-0" />
          {!isCollapsed && <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight whitespace-nowrap">Big Outsource CSAT</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {!isCollapsed && (
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-4 px-2 uppercase tracking-wider">
            Management
          </div>
        )}
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-gray-900 dark:bg-blue-600 text-white" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-gray-300 dark:text-blue-200" : "text-gray-400 dark:text-gray-500")} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout (Bottom) */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-9 h-9 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-sm border border-gray-200 dark:border-gray-700">
              {initials}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold text-gray-900 dark:text-white leading-none truncate">{user?.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-medium truncate">
                {user?.role?.name === 'DEPARTMENT ADMIN' && user?.department?.code 
                  ? `${user.department.code} Admin` 
                  : user?.role?.name === 'SUPER ADMIN' ? 'Super Admin' : user?.role?.name}
              </span>
            </div>
          </div>
        )}
        
        <div className={cn("flex items-center justify-between px-2", isCollapsed && "flex-col gap-4")}>
          <button 
            onClick={logout} 
            title={isCollapsed ? "Log out" : undefined}
            className="flex items-center gap-2 text-sm text-red-500 font-medium hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Log out</span>}
          </button>
          
          <button 
            onClick={() => setIsCollapsed?.(!isCollapsed)}
            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
