import { Search, UserPlus, Edit2, Trash2, X, Sparkles, RotateCcw, Building, ArrowUpDown, ArrowUp, ArrowDown, Users, ChevronDown, Shield, ShieldAlert, UserCheck, ShieldCheck, List } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';

export function Personnel() {
  const { user, canManage, isGlobal } = useAuth();
  const toast = useToast();
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc' | null}>({ key: '', direction: null });
  const [deptSearchQuery, setDeptSearchQuery] = useState('');
  const [deptSortDirection, setDeptSortDirection] = useState<'asc' | 'desc' | null>(null);
  
  // Tabs & Modals state
  const [activeTab, setActiveTab] = useState<'Members' | 'Departments'>('Members');
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);

  // New Dept Form
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [isCodeEdited, setIsCodeEdited] = useState(false);
  const [error, setError] = useState('');

  // Provision Form
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provJobTitle, setProvJobTitle] = useState('');
  const [provRoleId, setProvRoleId] = useState('');
  const [provDeptId, setProvDeptId] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Edit Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRoleId, setEditRoleId] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pData, dData, rData] = await Promise.all([
        api.get('/personnel'),
        api.get('/departments'),
        api.get('/roles')
      ]);
      setPersonnel(pData);
      setDepartments(dData);
      setRoles(rData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDept = async () => {
    setError('');
    if (!newDeptName.trim() || !newDeptCode.trim()) return setError('Name and Code are required');
    try {
      await api.post('/departments', { name: newDeptName.trim(), code: newDeptCode.trim().toUpperCase() });
      setNewDeptName('');
      setNewDeptCode('');
      setIsCodeEdited(false);
      setShowDeptModal(false);
      fetchData();
      toast.success('Department created successfully!');
    } catch (e: any) {
      try {
        const parsed = JSON.parse(e.message);
        toast.error(parsed.error || 'An error occurred');
      } catch {
        toast.error(e.message || 'Failed to create department');
      }
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchData();
      toast.success('Department deleted successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete department');
    }
  };

  const handleProvision = async () => {
    const finalDeptId = isGlobal() ? provDeptId : user?.department_id;
    const finalRoleId = isGlobal() ? provRoleId : roles.find(r => r.name === 'PERSONNEL')?.id;
    if (!provName || !provEmail || !finalRoleId || !finalDeptId || !provJobTitle) {
      toast.error('Fill all fields');
      return;
    }
    try {
      await api.post('/personnel', {
        name: provName,
        email: provEmail,
        job_title: provJobTitle,
        role_id: finalRoleId,
        department_id: finalDeptId
      });
      setShowProvisionModal(false);
      setProvName('');
      setProvEmail('');
      setProvJobTitle('');
      fetchData();
      toast.success('Personnel provisioned successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to provision personnel');
    }
  };

  const handleStartEdit = (person: any) => {
    setEditingId(person.id);
    setEditName(person.name);
    setEditRoleId(person.role_id);
    setEditDeptId(person.department_id || '');
    setEditStatus(person.status || 'ACTIVE');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim() || !editRoleId) {
      toast.error('Name and Role are required.');
      return;
    }
    try {
      await api.put(`/personnel/${id}`, {
        name: editName.trim(),
        role_id: editRoleId,
        department_id: editDeptId || null,
        status: editStatus
      });
      setEditingId(null);
      fetchData();
      toast.success('Personnel updated successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save edits');
    }
  };

  const handleDeletePersonnel = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/personnel/${id}`);
      fetchData();
      toast.success('Personnel deleted successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete personnel');
    }
  };

  let filteredPersonnel = personnel.filter(p => {
    if (selectedDept !== 'All Departments' && p.department?.name !== selectedDept) return false;
    if (selectedStatus !== 'All Statuses' && (p.status || 'ACTIVE') !== selectedStatus) return false;
    return true;
  });

  if (sortConfig.key && sortConfig.direction) {
    filteredPersonnel.sort((a, b) => {
      let aVal = '';
      let bVal = '';
      if (sortConfig.key === 'name') {
        aVal = a.name || '';
        bVal = b.name || '';
      } else if (sortConfig.key === 'department') {
        aVal = (a.department?.name || '') + (a.role?.name || '');
        bVal = (b.department?.name || '') + (b.role?.name || '');
      } else if (sortConfig.key === 'email') {
        aVal = a.email || '';
        bVal = b.email || '';
      }

      if (aVal.toLowerCase() < bVal.toLowerCase()) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal.toLowerCase() > bVal.toLowerCase()) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  let filteredDepartments = departments.filter(d => {
    if (deptSearchQuery && !d.name.toLowerCase().includes(deptSearchQuery.toLowerCase())) return false;
    return true;
  });

  if (deptSortDirection) {
    filteredDepartments.sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) return deptSortDirection === 'asc' ? -1 : 1;
      if (a.name.toLowerCase() > b.name.toLowerCase()) return deptSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const handleDeptSort = () => {
    if (deptSortDirection === 'asc') setDeptSortDirection('desc');
    else if (deptSortDirection === 'desc') setDeptSortDirection(null);
    else setDeptSortDirection('asc');
  };

  const totalAccounts = personnel.length;
  const totalSuperAdmins = personnel.filter(p => p.role?.name === 'SUPER ADMIN').length;
  const totalAdmins = personnel.filter(p => p.role?.name === 'DEPARTMENT ADMIN').length;
  const totalAgents = personnel.filter(p => p.role?.name === 'PERSONNEL').length;

  return (
    <div className="h-full w-full">
      {/* Pill Tabs */}
      <div className="flex items-center mb-6">
        <div className="bg-white rounded-xl p-1.5 flex shadow-sm border border-gray-100/60">
          <button 
            onClick={() => setActiveTab('Members')}
            className={`px-6 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === 'Members' ? 'bg-[#15233E] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Members
          </button>
          {isGlobal() && (
            <button 
              onClick={() => setActiveTab('Departments')}
              className={`px-6 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === 'Departments' ? 'bg-[#15233E] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Departments
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search accounts..." className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 shadow-sm rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-700" />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="appearance-none bg-white border border-gray-100 shadow-sm text-gray-700 text-xs font-bold rounded-xl pl-5 pr-10 py-3 cursor-pointer outline-none hover:bg-gray-50 transition-colors">
              <option value="All Departments">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="appearance-none bg-white border border-gray-100 shadow-sm text-gray-700 text-xs font-bold rounded-xl pl-5 pr-10 py-3 cursor-pointer outline-none hover:bg-gray-50 transition-colors">
              <option value="All Statuses">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          
          {activeTab === 'Members' && canManage() && (
            <button onClick={() => setShowProvisionModal(true)} className="flex items-center gap-2 bg-[#15233E] hover:bg-[#1a2b4c] text-white px-6 py-3 rounded-xl text-xs font-bold transition-colors shadow-sm ml-2">
              <UserPlus className="w-4 h-4" /> Register Account
            </button>
          )}
          {activeTab === 'Departments' && isGlobal() && (
            <button onClick={() => setShowDeptModal(true)} className="flex items-center gap-2 bg-[#15233E] hover:bg-[#1a2b4c] text-white px-6 py-3 rounded-xl text-xs font-bold transition-colors shadow-sm ml-2">
              <Building className="w-4 h-4" /> Add Department
            </button>
          )}
        </div>
      </div>

      {activeTab === 'Members' && (
      <>
        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-[13px] leading-tight">Active Accounts</div>
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{totalAccounts} TOTAL</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-600 flex items-center justify-center shrink-0 border border-gray-100">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-[13px] leading-tight">Super Admins</div>
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{totalSuperAdmins} TOTAL</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-[13px] leading-tight">Admins</div>
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{totalAdmins} TOTAL</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-[13px] leading-tight">Viewers</div>
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{totalAgents} TOTAL</div>
            </div>
          </div>
        </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-0 overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-600 transition-colors w-max" onClick={() => handleSort('name')}>
                    USER
                    {sortConfig.key === 'name' ? (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-50" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-600 transition-colors w-max" onClick={() => handleSort('department')}>
                    ROLE
                    {sortConfig.key === 'department' ? (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-50" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-600 transition-colors w-max" onClick={() => handleSort('email')}>
                    DEPARTMENT
                    {sortConfig.key === 'email' ? (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-50" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">STATUS</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={4} className="text-center p-4">Loading...</td></tr>}
              {!loading && filteredPersonnel.map((person) => {
                const isEditing = editingId === person.id;
                return (
                  <tr key={person.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-700 font-bold flex items-center justify-center text-sm border border-gray-200 shadow-sm shrink-0">
                          {person.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        {isEditing ? (
                          <div className="flex-1 min-w-[150px]">
                            <input 
                              type="text" 
                              value={editName} 
                              onChange={e => setEditName(e.target.value)} 
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 transition-all duration-200"
                            />
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-1.5">{person.email}</div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{person.name}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">{person.email}</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <select 
                          value={editRoleId} 
                          onChange={e => setEditRoleId(e.target.value)} 
                          className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-all duration-200 cursor-pointer"
                        >
                          {roles.map(r => (
                            <option key={r.id} value={r.id} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">{r.name}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-bold text-gray-600 text-[11px] uppercase tracking-wider">
                            {person.role?.name === 'DEPARTMENT ADMIN' && person.department?.code 
                              ? `${person.department.code} ADMIN` 
                              : person.role?.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <select 
                          value={editDeptId} 
                          onChange={e => setEditDeptId(e.target.value)} 
                          className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-all duration-200 cursor-pointer"
                        >
                          <option value="" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">Global Access</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">{d.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-semibold text-gray-700 text-[13px]">
                          {person.department?.name || 'Global Access'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <select 
                          value={editStatus} 
                          onChange={e => setEditStatus(e.target.value)} 
                          className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-all duration-200 cursor-pointer"
                        >
                          <option value="ACTIVE" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">ACTIVE</option>
                          <option value="INACTIVE" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">INACTIVE</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${person.status === 'INACTIVE' ? 'text-red-500' : 'text-emerald-600'}`}>
                          {person.status || 'ACTIVE'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2 text-xs font-semibold">
                          <button 
                            onClick={() => handleSaveEdit(person.id)} 
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] rounded-xl transition-all duration-200 cursor-pointer"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingId(null)} 
                            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl transition-all duration-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canManage() && (
                            <>
                              <button 
                                onClick={() => handleStartEdit(person)}
                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors bg-white shadow-sm"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors bg-white shadow-sm"
                                title="View Details"
                              >
                                <List className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors bg-white shadow-sm"
                                title="Re-assign"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeletePersonnel(person.id, person.name)}
                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors bg-white shadow-sm"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
      {activeTab === 'Departments' && isGlobal() && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900">Manage Departments</h3>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search departments..." 
                value={deptSearchQuery}
                onChange={e => setDeptSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
              />
            </div>
          </div>
          
          <div className="overflow-hidden border border-gray-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-700 transition-colors w-max" onClick={handleDeptSort}>
                      Department Name
                      {deptSortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : 
                       deptSortDirection === 'desc' ? <ArrowDown className="w-3.5 h-3.5 text-blue-600" /> : 
                       <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500">No departments found.</td>
                  </tr>
                ) : (
                  filteredDepartments.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => {
                      setSelectedDept(d.name);
                      setActiveTab('Members');
                    }}>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{d.name}</span>
                        {d.code && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase">{d.code}</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDept(d.name);
                            setActiveTab('Members');
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100 mr-1"
                          title="View Members"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDept(d.id);
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Department"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provision Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-[440px] flex flex-col shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            <button onClick={() => { setShowProvisionModal(false); setCurrentStep(1); }} className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center mb-8 text-center mt-2">
              <img src="/logo-only-bigoutsource.svg" alt="Big Outsource" className="w-16 h-16 mb-5" />
              <h3 className="text-[22px] font-black text-gray-900 tracking-tight mb-2">Create an Account</h3>
              <p className="text-sm font-medium text-gray-500">Fill in the details to request system access.</p>
            </div>
            
            {/* Horizontal Stepper */}
            <div className="flex items-center justify-center mb-10 px-4">
              <div className="flex flex-col items-center gap-2 relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 bg-white ${currentStep === 1 ? 'border-gray-900 text-gray-900' : 'border-gray-900 text-gray-900'}`}>
                  {currentStep > 1 ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ) : '1'}
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">User<br/>Information</div>
              </div>
              
              <div className={`w-48 h-[2px] mx-3 -mt-6 ${currentStep > 1 ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
              
              <div className="flex flex-col items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-white ${currentStep === 2 ? 'border-gray-900 text-gray-900' : 'border-gray-300 text-gray-400'}`}>
                  2
                </div>
                <div className={`text-[9px] font-black uppercase tracking-widest text-center leading-tight ${currentStep === 2 ? 'text-gray-900' : 'text-gray-400'}`}>Work<br/>Details</div>
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 min-h-[220px]">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-black text-gray-800 uppercase tracking-widest mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                      <input 
                        type="text" 
                        value={provName} 
                        onChange={e => setProvName(e.target.value)} 
                        placeholder="e.g. Niño Dela Cruz" 
                        className={`w-full border rounded-xl pl-10 pr-3 py-3 text-sm font-semibold text-gray-800 placeholder:text-red-300 focus:outline-none transition-shadow ${provName.length > 0 && provName.length < 2 ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'}`} 
                      />
                    </div>
                    {provName.length > 0 && provName.length < 2 && (
                      <div className="text-[11px] font-bold text-red-500 mt-2">Full name must be at least 2 characters.</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-gray-800 uppercase tracking-widest mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      </div>
                      <input 
                        type="email" 
                        value={provEmail} 
                        onChange={e => setProvEmail(e.target.value)} 
                        placeholder="name@bigoutsource.com" 
                        className={`w-full border rounded-xl pl-10 pr-3 py-3 text-sm font-semibold text-gray-800 placeholder:text-red-300 focus:outline-none transition-shadow ${provEmail.length > 0 && !provEmail.includes('@') ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'}`} 
                      />
                    </div>
                    {provEmail.length > 0 && !provEmail.includes('@') && (
                      <div className="text-[11px] font-bold text-red-500 mt-2">Enter a valid email address.</div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  {isGlobal() && (
                    <div>
                      <label className="block text-[11px] font-black text-gray-800 uppercase tracking-widest mb-2">Department</label>
                      <div className="relative">
                        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${!provDeptId ? 'text-red-400' : 'text-gray-400'}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                        </div>
                        <select 
                          value={provDeptId} 
                          onChange={e => setProvDeptId(e.target.value)} 
                          className={`w-full border rounded-xl pl-10 pr-10 py-3 text-sm font-semibold text-gray-800 focus:outline-none appearance-none bg-transparent transition-shadow cursor-pointer ${!provDeptId ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-400' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
                        >
                          <option value="" disabled className="text-gray-400">Select department</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id} className="text-gray-800">{d.name}</option>
                          ))}
                        </select>
                        <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${!provDeptId ? 'text-red-400' : 'text-gray-400'}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                      </div>
                      {!provDeptId && (
                        <div className="text-[11px] font-bold text-red-500 mt-2">Select a department.</div>
                      )}
                    </div>
                  )}

                  {isGlobal() && (
                    <div>
                      <label className="block text-[11px] font-black text-gray-800 uppercase tracking-widest mb-2">Role</label>
                      <div className="relative">
                        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${!provRoleId ? 'text-red-400' : 'text-gray-400'}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        </div>
                        <select 
                          value={provRoleId} 
                          onChange={e => setProvRoleId(e.target.value)} 
                          className={`w-full border rounded-xl pl-10 pr-10 py-3 text-sm font-semibold text-gray-800 focus:outline-none appearance-none bg-transparent transition-shadow cursor-pointer ${!provRoleId ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-400' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
                        >
                          <option value="" disabled className="text-gray-400">Select role</option>
                          {roles.filter(r => r.name !== 'SUPER ADMIN').map(r => (
                            <option key={r.id} value={r.id} className="text-gray-800">{r.name}</option>
                          ))}
                        </select>
                        <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${!provRoleId ? 'text-red-400' : 'text-gray-400'}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                      </div>
                      {!provRoleId && (
                        <div className="text-[11px] font-bold text-red-500 mt-2">Select a role.</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => {
                  if (currentStep === 1) {
                    setShowProvisionModal(false);
                  } else {
                    setCurrentStep(1);
                  }
                }} 
                className="flex-1 py-3.5 rounded-xl border border-transparent bg-gray-50 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
              
              {currentStep === 1 ? (
                <button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!provName || !provEmail || provEmail.length === 0 || !provEmail.includes('@')}
                  className="flex-1 py-3.5 rounded-xl bg-[#838994] text-white text-sm font-bold hover:bg-[#6b717b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button 
                  onClick={() => { handleProvision(); setCurrentStep(1); }}
                  disabled={isGlobal() && (!provRoleId || !provDeptId)}
                  className="flex-1 py-3.5 rounded-xl bg-[#838994] text-white text-sm font-bold hover:bg-[#6b717b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Account
                </button>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* New Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add New Department</h3>
              <button onClick={() => {
                setShowDeptModal(false);
                setError('');
              }}><X className="w-5 h-5 text-gray-500 hover:text-gray-900" /></button>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold border border-red-100 flex items-center gap-2">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Department Name</label>
                  <input 
                    type="text" 
                    value={newDeptName} 
                    onChange={e => {
                      const val = e.target.value;
                      setNewDeptName(val);
                      if (!isCodeEdited) {
                        const words = val.trim().split(/\s+/).filter(w => w.length > 0);
                        if (words.length >= 2) {
                          const initial1 = words[0][0] || '';
                          const initial2 = words[1][0] || '';
                          const initial3 = words.length >= 3 ? (words[2][0] || '') : '';
                          setNewDeptCode((initial1 + initial2 + initial3).substring(0, 3));
                        } else if (words.length === 1) {
                          setNewDeptCode(words[0].substring(0, 3));
                        } else {
                          setNewDeptCode(val.substring(0, 3));
                        }
                      }
                    }} 
                    placeholder="e.g. Human Resource"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleCreateDept()}
                  />
                </div>
                <div className="col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-semibold text-gray-900">Code</label>
                    {!isCodeEdited && newDeptCode ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100" title="Auto-suggested from name">
                        <Sparkles className="w-3 h-3" /> Auto
                      </span>
                    ) : isCodeEdited ? (
                      <button 
                        onClick={() => {
                          setIsCodeEdited(false);
                          const val = newDeptName;
                          const words = val.trim().split(/\s+/).filter(w => w.length > 0);
                          if (words.length >= 2) {
                            const initial1 = words[0][0] || '';
                            const initial2 = words[1][0] || '';
                            const initial3 = words.length >= 3 ? (words[2][0] || '') : '';
                            setNewDeptCode((initial1 + initial2 + initial3).substring(0, 3));
                          } else if (words.length === 1) {
                            setNewDeptCode(words[0].substring(0, 3));
                          } else {
                            setNewDeptCode(val.substring(0, 3));
                          }
                        }}
                        className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-1.5 py-0.5 rounded border border-transparent hover:border-blue-100 transition-colors"
                        title="Reset to auto-suggest"
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> Reset
                      </button>
                    ) : null}
                  </div>
                  <input 
                    type="text" 
                    maxLength={3}
                    value={newDeptCode.toUpperCase()} 
                    onChange={e => {
                      setNewDeptCode(e.target.value.substring(0, 3));
                      setIsCodeEdited(true);
                    }} 
                    placeholder="e.g. HR"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase" 
                    onKeyDown={e => e.key === 'Enter' && handleCreateDept()}
                  />
                </div>
              </div>
              <button onClick={handleCreateDept} className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg mt-2 hover:bg-blue-700 transition-colors">
                Create Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
