import { ShieldCheck, Server, Bell, CheckCircle2 } from 'lucide-react';

export function Settings() {
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
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Super Admin Full Name
              </label>
              <input 
                type="text" 
                defaultValue="Sarah Vance"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
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
                defaultValue="superadmin@omnicsat.co"
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

        {/* Right Column - Audit */}
        <div className="w-[320px] bg-[#111827] rounded-xl p-6 text-white shadow-lg relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="flex items-center gap-2 mb-4 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Privileges Audit
          </div>
          
          <h3 className="text-lg font-bold mb-2">Super Admin Role</h3>
          <p className="text-blue-100 text-xs leading-relaxed mb-8">
            As detailed in your structural permissions, your user key holds root-level privileges across the environment.
          </p>
          
          <div className="space-y-4 mb-8">
            {[
              'Can view all departments',
              'Can edit personnel directory',
              'Can edit survey campaigns',
              'Can provision API keys'
            ].map((privilege, i) => (
              <div key={i} className="flex items-start justify-between gap-4">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                  <span className="text-sm text-gray-200">{privilege}</span>
                </div>
                <span className="text-[10px] font-bold tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Audit Log Status</div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20 w-fit">
              <CheckCircle2 className="w-4 h-4" />
              Secure Logging: VERIFIED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
