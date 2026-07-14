import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await api.get('/me');
          setUser(data.user);
        } catch (e) {
          console.error(e);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email: string) => {
    const data = await api.post('/auth/login', { email });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const hasPermission = (permissionKey: string) => {
    if (!user) return false;
    if (user.role?.is_global) return true; // Super Admins have all permissions
    const perms = user.role?.permissions?.map((p: any) => p.permission.key) || [];
    return perms.includes(permissionKey);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
