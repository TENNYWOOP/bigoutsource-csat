import { useState, useEffect, useRef } from 'react';
import { Bell, Loader2, UserPlus, Check, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

interface TopbarProps {
  title: string;
}

const formatActionTextForEIMS = (desc: string) => {
  if (!desc) return '';
  return desc.charAt(0).toLowerCase() + desc.slice(1);
};

export function Topbar({ title }: TopbarProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
              <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-white">
                <h3 className="font-extrabold text-base text-[#0f172a]">Notifications</h3>
                <div className="flex items-center gap-2">
                  <button onClick={fetchNotifications} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setNotifications([]);
                      setHasUnread(false);
                    }}
                    className="px-3 py-1 border border-gray-200 rounded-lg text-[11px] font-bold text-[#0f172a] hover:bg-gray-50 transition-colors"
                  >
                    CLEAR ALL
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto p-3 bg-white space-y-3">
                {loading ? (
                  <div className="p-8 flex justify-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((notif: any) => (
                    <div key={notif.id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 hover:border-gray-300 transition-all cursor-default relative">
                      {/* Checkmark Top Right */}
                      <div className="absolute top-4 right-4 text-gray-300">
                        <Check className="w-4 h-4" />
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#f1f5f9] text-[#3b82f6] flex items-center justify-center shrink-0">
                          <UserPlus className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 pr-6">
                          <h4 className="font-extrabold text-[#0f172a] text-[14px] leading-tight">{notif.user?.name || 'System Admin'}</h4>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">{notif.user?.role?.name || 'ADMIN'}</p>
                          
                          <p className="text-[11px] font-bold text-gray-400 mt-1.5">
                            {new Date(notif.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                          </p>
                          
                          <p className="text-[13px] text-[#334155] font-semibold mt-2.5 mb-3 leading-snug">
                            {notif.user?.name || 'System Admin'} {formatActionTextForEIMS(notif.action_description)}
                          </p>
                          
                          {notif.user && (
                            <button 
                              onClick={() => setSelectedUser(notif.user)}
                              className="bg-[#0f172a] text-white px-4 py-1.5 rounded-md text-[12px] font-bold hover:bg-[#1e293b] transition-colors"
                            >
                              View profile
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
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

      {/* Quick View Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative">
            <button 
              onClick={() => setSelectedUser(null)} 
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="bg-[#f8fafc] p-8 flex flex-col items-center justify-center border-b border-gray-100">
              <div className="w-20 h-20 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-3xl mb-4 shadow-lg shadow-blue-500/20">
                {selectedUser.name?.charAt(0) || 'U'}
              </div>
              <h3 className="text-xl font-extrabold text-[#0f172a]">{selectedUser.name}</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{selectedUser.role?.name || 'ADMIN'}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-sm font-semibold text-[#334155]">{selectedUser.email}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Department</p>
                  <p className="text-sm font-semibold text-[#334155]">{selectedUser.department?.name || 'Global'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 text-right">Status</p>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${
                      selectedUser.status === 'ACTIVE' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedUser.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 bg-white border border-gray-200 text-[#0f172a] font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
