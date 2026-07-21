import { Search, ArrowUpDown, AlertCircle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { api } from '../lib/api';

export function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Filter States
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
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

  return (
    <div className="h-full max-w-[90rem] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Filters & Search Row (Outside Card) */}
      <div className="flex flex-col md:flex-row flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/60 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-slate-600 focus:border-gray-800 dark:focus:border-slate-500 shadow-sm transition-all"
          />
        </div>

        {/* Date Range */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/60 rounded-xl shadow-sm focus-within:border-gray-800 dark:focus-within:border-slate-500 transition-colors px-1">
          <div className="relative group">
            <button 
              onClick={() => startDateRef.current?.showPicker()}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span>{startDate ? new Date(startDate).toLocaleDateString() : 'Start Date'}</span>
              <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            </button>
            <input 
              ref={startDateRef}
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="absolute bottom-0 left-0 w-0 h-0 opacity-0 pointer-events-none"
            />
          </div>
          <span className="text-gray-300 dark:text-slate-600 font-black">-</span>
          <div className="relative group">
            <button 
              onClick={() => endDateRef.current?.showPicker()}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span>{endDate ? new Date(endDate).toLocaleDateString() : 'End Date'}</span>
              <Calendar className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            </button>
            <input 
              ref={endDateRef}
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="absolute bottom-0 right-0 w-0 h-0 opacity-0 pointer-events-none"
            />
          </div>
        </div>

        {/* Action Dropdown */}
        <div className="relative min-w-[150px]">
          <select 
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/60 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-200 appearance-none focus:outline-none focus:border-gray-800 dark:focus:border-slate-500 shadow-sm cursor-pointer transition-colors"
          >
            <option value="All Actions">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
        </div>

        {/* Entity Dropdown */}
        <div className="relative min-w-[150px]">
          <select 
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/60 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-200 appearance-none focus:outline-none focus:border-gray-800 dark:focus:border-slate-500 shadow-sm cursor-pointer transition-colors"
          >
            <option value="All Entities">All Entities</option>
            {uniqueEntities.map(entity => (
              <option key={entity} value={entity}>{entity}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
        </div>

        {/* User Dropdown */}
        <div className="relative min-w-[150px]">
          <select 
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/60 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-200 appearance-none focus:outline-none focus:border-gray-800 dark:focus:border-slate-500 shadow-sm cursor-pointer transition-colors"
          >
            <option value="All Users">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[20px] shadow-sm flex flex-col overflow-hidden border border-gray-200 dark:border-slate-700/60">

        {/* Security Notice */}
        <div className="mx-6 mt-6 mb-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-800 dark:text-red-400">Security Notice</h4>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1 font-medium">Audit logs display privileged system activities including edits, additions, and access logs. These records are immutable.</p>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto p-6 pt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-100 dark:border-slate-700/60">
                <th className="py-4 pr-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer select-none" onClick={() => toggleSort('timestamp')}>
                  <div className="flex items-center gap-2">TIMESTAMP <SortIcon columnKey="timestamp" /></div>
                </th>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer select-none" onClick={() => toggleSort('user')}>
                  <div className="flex items-center gap-2">OPERATOR <SortIcon columnKey="user" /></div>
                </th>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer select-none" onClick={() => toggleSort('category')}>
                  <div className="flex items-center gap-2">ACTION <SortIcon columnKey="category" /></div>
                </th>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer select-none" onClick={() => toggleSort('category')}>
                  <div className="flex items-center gap-2">TARGET ENTITY <SortIcon columnKey="category" /></div>
                </th>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest cursor-pointer select-none" onClick={() => toggleSort('action_description')}>
                  <div className="flex items-center gap-2">DETAILS</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
              {loading && <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm font-medium">Loading records...</td></tr>}
              {!loading && sortedLogs.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm font-medium">No matching audit logs found.</td></tr>}
              {!loading && sortedLogs.map((log) => {
                const logDate = new Date(log.timestamp);
                const dateStr = logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = logDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                
                const hasDetails = !!log.details;
                const isExpanded = expandedLogId === log.id;

                let parsedDetails = null;
                if (hasDetails) {
                  try {
                    parsedDetails = JSON.parse(log.details);
                  } catch (e) {}
                }

                return (
                  <React.Fragment key={log.id}>
                    <tr className={`group transition-colors ${isExpanded ? 'bg-blue-50/40 dark:bg-blue-900/20' : 'hover:bg-gray-50/30 dark:hover:bg-slate-800/50'}`}>
                      {/* Timestamp */}
                      <td className="py-6 pr-6 align-top">
                        <div className="font-bold text-gray-900 dark:text-slate-200 text-sm">{dateStr}</div>
                        <div className="text-[11px] text-gray-400 dark:text-slate-500 font-bold mt-1">{timeStr}</div>
                      </td>
                      
                      {/* Operator */}
                      <td className="py-6 px-6 align-top">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 shadow-sm">
                            {log.user?.name?.slice(0, 2) || 'SU'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-slate-200 text-sm">{log.user?.name || 'System User'}</div>
                            <div className="text-[11px] text-gray-400 dark:text-slate-500 font-bold mt-1 truncate max-w-[150px]">
                              {log.user?.email || log.user?.role?.name || 'admin@csat.system'}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Action */}
                      <td className="py-6 px-6 align-top">
                        <span className="inline-block px-4 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-[10px] font-black text-gray-600 dark:text-slate-300 uppercase tracking-widest shadow-sm">
                          {log.category || 'SYSTEM'}
                        </span>
                      </td>
                      
                      {/* Target Entity */}
                      <td className="py-6 px-6 align-top">
                        <div className="font-bold text-gray-900 dark:text-slate-200 text-sm">
                          {log.category === 'Surveys' ? 'Surveys' : (log.category === 'Security' ? 'Access' : 'System Accounts')}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">
                          {log.category || 'GENERAL'}
                        </div>
                      </td>
                      
                      {/* Details */}
                      <td className="py-6 px-6 align-top max-w-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest mb-2">
                              DESCRIPTION
                            </div>
                            <div className="text-xs text-gray-600 dark:text-slate-300 font-semibold leading-relaxed">
                              {log.action_description}
                            </div>
                          </div>
                          {hasDetails && (
                            <button 
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-900/50 shadow-sm transition-colors flex-shrink-0"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && parsedDetails && (
                      <tr className="bg-blue-50/20 dark:bg-blue-900/10 border-b border-gray-100 dark:border-slate-700/60">
                        <td colSpan={5} className="py-6 px-8">
                          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/60 shadow-sm overflow-hidden">
                            <div className="bg-gray-50/80 dark:bg-slate-900/50 px-4 py-3 border-b border-gray-100 dark:border-slate-700/60">
                              <h4 className="text-[11px] font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest">Modification Details</h4>
                            </div>
                            <div className="p-5 overflow-x-auto">
                              <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                  <tr>
                                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider w-1/4">Field</th>
                                    <th className="pb-3 pr-6 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider w-1/3">Previous Value</th>
                                    <th className="pb-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider w-1/3">New Value</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                  {Object.keys(parsedDetails.before || {}).map(key => {
                                    const beforeVal = parsedDetails.before[key];
                                    const afterVal = parsedDetails.after?.[key];
                                    return (
                                      <tr key={key}>
                                        <td className="py-3 pr-6 font-bold text-gray-800 dark:text-slate-200 capitalize">{key.replace('_id', ' ID')}</td>
                                        <td className="py-3 pr-6">
                                          <span className="inline-block px-3 py-1 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-md text-xs font-semibold line-through opacity-80">
                                            {String(beforeVal || 'None')}
                                          </span>
                                        </td>
                                        <td className="py-3">
                                          <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 rounded-md text-xs font-semibold">
                                            {String(afterVal || 'None')}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
