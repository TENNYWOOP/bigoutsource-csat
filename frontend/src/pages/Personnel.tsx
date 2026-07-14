import { Search, UserPlus, Edit2, Trash2, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

const personnel = [
  { id: 'p-1', initials: 'DM', name: 'David Miller', role: 'CS Support Lead', dept: 'Support', email: 'dmiller@bigoutsource.com', status: 'Active' },
  { id: 'p-2', initials: 'SV', name: 'Sarah Vance', role: 'Director of Customer Experience', dept: 'Product', email: 'svance@bigoutsource.com', status: 'Active' },
  { id: 'p-3', initials: 'EH', name: 'Ethan Hunt', role: 'Lead Systems Architect', dept: 'Engineering', email: 'ehunt@bigoutsource.com', status: 'Active' },
  { id: 'p-4', initials: 'DP', name: 'Diana Prince', role: 'Enterprise Accounts Lead', dept: 'Sales', email: 'dprince@bigoutsource.com', status: 'Active' },
  { id: 'p-5', initials: 'TS', name: 'Tony Stark', role: 'Solutions Onboarding Manager', dept: 'Sales', email: 'tstark@bigoutsource.com', status: 'Inactive' },
];

export function Personnel() {
  return (
    <div className="h-full max-w-6xl mx-auto">
      {/* Header Area */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Personnel Directory</h2>
            <span className="text-[10px] font-bold tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase border border-emerald-200">
              Staff Management Access
            </span>
          </div>
          <p className="text-gray-500 text-sm">Assign agents, review departments, and audit operator status directly from this directory.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-blue-200">
          <UserPlus className="w-4 h-4" />
          Provision New Member
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, role or email..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Filter Dept:</span>
            <select className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 font-medium cursor-pointer">
              <option>All Departments</option>
              <option>Support</option>
              <option>Product</option>
              <option>Engineering</option>
              <option>Sales</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Team Operator</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Department & Role</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email Contact</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status State</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Administrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {personnel.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm border border-blue-100">
                        {person.initials}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{person.name}</div>
                        <div className="text-xs text-gray-400 font-medium">ID: {person.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900 text-sm">{person.role}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{person.dept}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      {person.email}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
                      person.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                    )}>
                      {person.status === 'Active' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {person.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
