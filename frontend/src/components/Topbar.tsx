import { Bell } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const { user } = useAuth();

  const getDisplayRole = () => {
    if (user?.role?.name === 'DEPARTMENT ADMIN' && user?.department?.code) {
      return `${user.department.code} Admin`;
    }
    return user?.role?.name === 'SUPER ADMIN' ? 'Super Admin' : user?.role?.name;
  };

  const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-gray-400 hover:text-gray-600 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-900 leading-none">{user?.name || 'User'}</span>
            <span className="text-xs text-gray-500 mt-1">{getDisplayRole()}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-medium text-sm">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
