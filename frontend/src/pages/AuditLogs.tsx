import { Search, History, ShieldAlert, Users, Terminal, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';

const mockLogs = [
  {
    timestamp: '2026-07-14 09:32:15',
    user: { name: 'Sarah Vance', role: 'Super Admin', initials: 'SV' },
    action: 'Modified logo to logo-only-bigoutsource.svg',
    category: 'Branding',
    ip: '10.10.60.222',
    status: 'success'
  },
  {
    timestamp: '2026-07-14 09:12:44',
    user: { name: 'Sarah Vance', role: 'Super Admin', initials: 'SV' },
    action: 'Changed branding name to Big Outsource CSAT',
    category: 'Branding',
    ip: '10.10.60.222',
    status: 'success'
  },
  {
    timestamp: '2026-07-14 08:58:31',
    user: { name: 'Tony Stark', role: 'Solutions Onboarding Manager', initials: 'TS' },
    action: 'Launched Survey Campaign: "SDK Developer Onboarding Feedback"',
    category: 'Surveys',
    ip: '10.10.60.45',
    status: 'success'
  },
  {
    timestamp: '2026-07-14 08:32:10',
    user: { name: 'Sarah Vance', role: 'Super Admin', initials: 'SV' },
    action: 'Archived Survey Campaign: "Account Executive Q1 Relationship Survey"',
    category: 'Surveys',
    ip: '10.10.60.222',
    status: 'success'
  },
  {
    timestamp: '2026-07-13 17:15:22',
    user: { name: 'System Gateway', role: 'Security daemon', initials: 'SG' },
    action: 'Failed SSH login attempt - Invalid password credentials',
    category: 'Security',
    ip: '192.203.44.11',
    status: 'failed'
  },
  {
    timestamp: '2026-07-13 14:02:11',
    user: { name: 'David Miller', role: 'CS Support Lead', initials: 'DM' },
    action: 'Updated Personnel details for: Diana Prince',
    category: 'Personnel',
    ip: '10.10.60.102',
    status: 'success'
  },
  {
    timestamp: '2026-07-13 11:58:05',
    user: { name: 'Sarah Vance', role: 'Super Admin', initials: 'SV' },
    action: 'Updated Webhook Alert routing to: #csat-alerts',
    category: 'Settings',
    ip: '10.10.60.222',
    status: 'success'
  }
];

export function AuditLogs() {
  return (
    <div className="h-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Quick stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Events</div>
            <div className="text-2xl font-bold text-gray-900">1,284</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Failed Attempts</div>
            <div className="text-2xl font-bold text-gray-900">3</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Operators</div>
            <div className="text-2xl font-bold text-gray-900">4</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gateway Status</div>
            <div className="text-2xl font-bold text-emerald-600">Online</div>
          </div>
        </div>
      </div>

      {/* Main logs section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
        
        {/* Search & Filter Header */}
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search audit trail..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="flex gap-3">
            <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer">
              <option>All Categories</option>
              <option>Branding</option>
              <option>Surveys</option>
              <option>Security</option>
              <option>Personnel</option>
              <option>Settings</option>
            </select>
            <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer">
              <option>Any Status</option>
              <option>Success</option>
              <option>Failed</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Action Event</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {mockLogs.map((log, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-medium text-gray-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs">
                        {log.user.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 leading-tight">{log.user.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium mt-0.5">{log.user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium max-w-xs md:max-w-md truncate">
                    {log.action}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      log.category === 'Security' ? 'bg-red-50 text-red-600 border-red-100' :
                      log.category === 'Branding' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      log.category === 'Surveys' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      log.category === 'Personnel' ? 'bg-teal-50 text-teal-600 border-teal-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {log.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">
                    {log.ip}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex justify-center">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors mx-auto cursor-pointer">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
          <span>Showing 7 of 1,284 entries.</span>
          <div className="flex gap-2">
            <button className="px-2 py-1 border border-gray-200 rounded disabled:opacity-50 font-medium">Prev</button>
            <button className="px-2 py-1 border border-gray-200 rounded disabled:opacity-50 font-medium">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
}
