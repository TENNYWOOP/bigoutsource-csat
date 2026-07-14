import { useState, useEffect } from 'react';
import { ShieldCheck, Server } from 'lucide-react';
import { useAuth } from '../lib/auth';

export function Settings() {
  const { isGlobal } = useAuth();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const handleToggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  if (!isGlobal()) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
          <p className="text-gray-500">Only Super Admins can access administrative settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Administrative Settings</h2>
            <span className="text-[10px] font-bold tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase border border-blue-200">
              Root Workspace
            </span>
          </div>
          <p className="text-gray-500 text-sm">Configure security baselines and visual aesthetics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-6 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Workspace Aesthetics
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Dark Theme Mode</h4>
                <p className="text-xs text-gray-500 mt-0.5">Toggle between light and dark workspace modes.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isDark} onChange={handleToggleTheme} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-6 uppercase tracking-wider">
              <Server className="w-4 h-4" /> System Preferences
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                System Target CSAT Benchmark
              </label>
              <input type="range" min="0" max="100" defaultValue="85" className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>

            <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
              <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
                Commit Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
