import { useState, useEffect, useRef } from 'react';
import { Bell, Loader2, UserPlus, Building, Trash2, BarChart2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

interface TopbarProps {
  title: string;
}

const getNotificationIcon = (desc: string) => {
  if (desc.includes('Provisioned')) {
    return <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0"><UserPlus className="w-4 h-4" /></div>;
  }
  if (desc.includes('Created department')) {
    return <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Building className="w-4 h-4" /></div>;
  }
  if (desc.includes('Deleted')) {
    return <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0"><Trash2 className="w-4 h-4" /></div>;
  }
  if (desc.includes('Launched Survey Campaign') || desc.includes('Updated')) {
    return <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><BarChart2 className="w-4 h-4" /></div>;
  }
  return <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center shrink-0"><Bell className="w-4 h-4" /></div>;
};

const formatActionText = (text: string) => {
  const parts = text.split(':');
  if (parts.length > 1) {
    const boldPart = parts[0];
    const rest = parts.slice(1).join(':');
    return <><span className="font-bold">{boldPart}:</span>{rest}</>;
  }
  return text;
};

export function Topbar({ title }: TopbarProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await api.get('/notifications');
        const loadedNotifications = data || [];
        setNotifications(loadedNotifications);

        if (loadedNotifications.length > 0) {
          const lastSeen = localStorage.getItem('last_seen_notifications');
          const newestTime = new Date(loadedNotifications[0].timestamp).getTime();

          if (!lastSeen || newestTime > parseInt(lastSeen)) {
            setHasUnread(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="relative" ref={dropdownRef}>
          <button
            className="text-gray-400 hover:text-gray-600 relative p-2"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) {
                setHasUnread(false);
                if (notifications.length > 0) {
                  const newestTime = new Date(notifications[0].timestamp).getTime();
                  localStorage.setItem('last_seen_notifications', newestTime.toString());
                }
              }
            }}
          >
            <Bell className="w-5 h-5" />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
                {hasUnread && (
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{notifications.length} New</span>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 flex justify-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500">
                    No new notifications.
                  </div>
                ) : (
                  <div className="bg-gray-50/50 p-2 flex flex-col gap-3">
                    {notifications.map((notif: any) => (
                      <div key={notif.id} className="bg-white border border-gray-100 shadow-md rounded-lg p-3 hover:shadow-lg hover:border-gray-200 transition-all cursor-default flex items-start gap-3">
                        {getNotificationIcon(notif.action_description)}
                        <div>
                          <p className="text-sm text-gray-800 mb-1 leading-snug">{formatActionText(notif.action_description)}</p>
                          <p className="text-xs text-gray-400 font-medium">
                            {new Date(notif.timestamp).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
