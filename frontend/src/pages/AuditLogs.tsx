import { Search, ArrowUpDown, AlertCircle } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { api } from '../lib/api';

export function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAction, setSelectedAction] = useState('All Actions');
  const [selectedEntity, setSelectedEntity] = useState('All Entities');
  const [selectedUser, setSelectedUser] = useState('All Users');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.get('/audit-logs');
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Extract unique values for dropdowns
  const uniqueActions = useMemo(() => {
    const actions = new Set<string>();
    logs.forEach(log => {
      if (log.category) actions.add(log.category);
    });
    return Array.from(actions).sort();
  }, [logs]);

  const uniqueEntities = useMemo(() => {
    const entities = new Set<string>();
    logs.forEach(log => {
      const entity = log.category === 'Surveys' ? 'Surveys' : (log.category === 'Security' ? 'Access' : 'System Accounts');
      entities.add(entity);
    });
    return Array.from(entities).sort();
  }, [logs]);

  const uniqueUsers = useMemo(() => {
    const users = new Set<string>();
    logs.forEach(log => {
      if (log.user?.name) users.add(log.user.name);
    });
    return Array.from(users).sort();
  }, [logs]);

  // Apply Filters
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = 
          log.action_description?.toLowerCase().includes(q) ||
          log.user?.name?.toLowerCase().includes(q) ||
          log.category?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 2. Date Range
      if (startDate || endDate) {
        const logDate = new Date(log.timestamp);
        logDate.setHours(0, 0, 0, 0);

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (logDate < start) return false;
        }

        if (endDate) {
          const end = new Date(endDate);
          end.setHours(0, 0, 0, 0);
          if (logDate > end) return false;
        }
      }

      // 3. Action
      if (selectedAction !== 'All Actions') {
        if (log.category !== selectedAction) return false;
      }

      // 4. Entity
      if (selectedEntity !== 'All Entities') {
        const entity = log.category === 'Surveys' ? 'Surveys' : (log.category === 'Security' ? 'Access' : 'System Accounts');
        if (entity !== selectedEntity) return false;
      }

      // 5. User
      if (selectedUser !== 'All Users') {
        if (log.user?.name !== selectedUser) return false;
      }

      return true;
    });
  }, [logs, searchQuery, startDate, endDate, selectedAction, selectedEntity, selectedUser]);

  // Apply Sorting
  const sortedLogs = useMemo(() => {
    if (!sortConfig) return filteredLogs;
    return [...filteredLogs].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'user') {
        aVal = a.user?.name || '';
        bVal = b.user?.name || '';
      }
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredLogs, sortConfig]);

  const toggleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return null;
      }
      return { key, direction: 'asc' };
    });
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => (
    <ArrowUpDown className={`w-3 h-3 ${sortConfig?.key === columnKey ? 'text-gray-900' : 'text-gray-300'}`} />
  );

  // Common Dropdown Styling
  const selectStyle = "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 appearance-none focus:outline-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_16px_center] bg-no-repeat pr-10";

  return (
    <div className="h-full max-w-[90rem] mx-auto space-y-6 animate-in fade-in duration-200">
      
      <div className="bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden border border-gray-100">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="p-4 flex flex-col md:flex-row flex-wrap gap-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex-[1.5] min-w-[280px]">
            <div className="flex items-center justify-between w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus-within:ring-1 focus-within:ring-gray-300 shadow-sm">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Start Date</span>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs text-gray-700 bg-transparent outline-none cursor-pointer font-semibold leading-none"
                />
              </div>
              <span className="text-gray-200 mx-1 flex-shrink-0 font-bold">-</span>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">End Date</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs text-gray-700 bg-transparent outline-none cursor-pointer font-semibold leading-none text-right"
                />
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <select 
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className={selectStyle}
            >
              <option value="All Actions">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <select 
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className={selectStyle}
            >
              <option value="All Entities">All Entities</option>
              {uniqueEntities.map(entity => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <select 
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className={selectStyle}
            >
              <option value="All Users">All Users</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mx-6 mt-6 mb-2 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-800">Security Notice</h4>
            <p className="text-xs text-red-600 mt-1 font-medium">Audit logs display privileged system activities including edits, additions, and access logs. These records are immutable.</p>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto p-6 pt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="py-4 pr-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer select-none" onClick={() => toggleSort('timestamp')}>
                  <div className="flex items-center gap-2">TIMESTAMP <SortIcon columnKey="timestamp" /></div>
                </th>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer select-none" onClick={() => toggleSort('user')}>
                  <div className="flex items-center gap-2">OPERATOR <SortIcon columnKey="user" /></div>
                </th>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer select-none" onClick={() => toggleSort('category')}>
                  <div className="flex items-center gap-2">ACTION <SortIcon columnKey="category" /></div>
                </th>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer select-none" onClick={() => toggleSort('category')}>
                  <div className="flex items-center gap-2">TARGET ENTITY <SortIcon columnKey="category" /></div>
                </th>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer select-none" onClick={() => toggleSort('action_description')}>
                  <div className="flex items-center gap-2">DETAILS</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm font-medium">Loading records...</td></tr>}
              {!loading && sortedLogs.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm font-medium">No matching audit logs found.</td></tr>}
              {!loading && sortedLogs.map((log) => {
                const logDate = new Date(log.timestamp);
                const dateStr = logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = logDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                
                return (
                  <tr key={log.id} className="group hover:bg-gray-50/30 transition-colors">
                    {/* Timestamp */}
                    <td className="py-6 pr-6 align-top">
                      <div className="font-bold text-gray-900 text-sm">{dateStr}</div>
                      <div className="text-[11px] text-gray-400 font-bold mt-1">{timeStr}</div>
                    </td>
                    
                    {/* Operator */}
                    <td className="py-6 px-6 align-top">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-600 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 shadow-sm">
                          {log.user?.name?.slice(0, 2) || 'SU'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{log.user?.name || 'System User'}</div>
                          <div className="text-[11px] text-gray-400 font-bold mt-1 truncate max-w-[150px]">
                            {log.user?.email || log.user?.role?.name || 'admin@csat.system'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Action */}
                    <td className="py-6 px-6 align-top">
                      <span className="inline-block px-4 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-black text-gray-600 uppercase tracking-widest shadow-sm">
                        {log.category || 'SYSTEM'}
                      </span>
                    </td>
                    
                    {/* Target Entity */}
                    <td className="py-6 px-6 align-top">
                      <div className="font-bold text-gray-900 text-sm">
                        {log.category === 'Surveys' ? 'Surveys' : (log.category === 'Security' ? 'Access' : 'System Accounts')}
                      </div>
                      <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                        {log.category || 'GENERAL'}
                      </div>
                    </td>
                    
                    {/* Details */}
                    <td className="py-6 px-6 align-top max-w-sm">
                      <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
                        DESCRIPTION
                      </div>
                      <div className="text-xs text-gray-600 font-semibold leading-relaxed">
                        {log.action_description}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
