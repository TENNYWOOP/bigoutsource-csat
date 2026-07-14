import { useState, useEffect } from 'react';
import { ShieldCheck, Server, Bell } from 'lucide-react';

export function Settings() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

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

  return (
    <div className="h-full max-w-5xl mx-auto">
      {/* Header Area */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Administrative Settings</h2>
            <span className="text-[10px] font-bold tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase border border-blue-200">
              Root Workspace
            </span>
          </div>
          <p className="text-gray-500 text-sm">Configure security baselines, benchmark key performance indices (KPIs), and manage alerting webhooks.</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left Column - Forms */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Core Workspace Properties */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-6 uppercase tracking-wider">
              <Server className="w-4 h-4" /> Core Workspace Properties
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  System Target CSAT Benchmark
                </label>
                <span className="text-sm font-bold text-blue-600">85%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                defaultValue="85"
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-400 mt-2">Scores dipping below this value will immediately flag alert statuses.</p>
            </div>
          </div>

          {/* Theme Customization */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-6 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Workspace Aesthetics
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Dark Theme Mode</h4>
                <p className="text-xs text-gray-500 mt-0.5">Toggle between light and dark workspace modes.</p>
              </div>
              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isDark}
                  onChange={handleToggleTheme}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Alert Routing Webhooks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-6 uppercase tracking-wider">
              <Bell className="w-4 h-4" /> Alert Routing Webhooks
            </div>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Immediate Dispatch Email
              </label>
              <input 
                type="email" 
                defaultValue="superadmin@bigoutsource.com"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Slack Dispatch Integration</h4>
                <p className="text-xs text-gray-500 mt-0.5">Post real-time bad reviews (≤ 3★) directly into channel #csat-alerts.</p>
              </div>
              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end mt-2">
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-md">
              <Server className="w-4 h-4" />
              Commit System Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
