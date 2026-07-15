import { Search, UserPlus, Edit2, Trash2, X, Sparkles, RotateCcw, Building, ArrowUpDown, ArrowUp, ArrowDown, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export function Personnel() {
  const { user, canManage, isGlobal } = useAuth();
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDept, setSelectedDept] = useState('All Departments');
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
    } catch (e: any) {
      try {
        const parsed = JSON.parse(e.message);
        setError(parsed.error || 'An error occurred');
      } catch {
        setError(e.message);
      }
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleProvision = async () => {
    const finalDeptId = isGlobal() ? provDeptId : user?.department_id;
    const finalRoleId = isGlobal() ? provRoleId : roles.find(r => r.name === 'PERSONNEL')?.id;
    if (!provName || !provEmail || !finalRoleId || !finalDeptId || !provJobTitle) return alert('Fill all fields');
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
    } catch (e: any) {
      alert(e.message);
    }
  };

  let filteredPersonnel = personnel.filter(p => {
    if (selectedDept !== 'All Departments' && p.department?.name !== selectedDept) return false;
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

  return (
    <div className="h-full max-w-6xl mx-auto relative">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Personnel Directory</h2>
          </div>
          <p className="text-gray-500 text-sm">Assign agents, manage roles, and review departments.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {activeTab === 'Members' && canManage() && (
            <button onClick={() => setShowProvisionModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-blue-200">
              <UserPlus className="w-4 h-4" /> Provision New Personnel
            </button>
          )}
          {activeTab === 'Departments' && isGlobal() && (
            <button onClick={() => setShowDeptModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-blue-200">
              <Building className="w-4 h-4" /> Add Department
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6 border-b border-gray-200 mb-8">
        <button 
          onClick={() => setActiveTab('Members')}
          className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'Members' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Members
          {activeTab === 'Members' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>}
        </button>
        {isGlobal() && (
          <button 
            onClick={() => setActiveTab('Departments')}
            className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'Departments' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Departments
            {activeTab === 'Departments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>}
          </button>
        )}
      </div>

      {activeTab === 'Members' && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name, role or email..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Filter Dept:</span>
            <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 font-medium cursor-pointer">
              <option value="All Departments">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-600 transition-colors w-max" onClick={() => handleSort('name')}>
                    Team Operator
                    {sortConfig.key === 'name' ? (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-600 transition-colors w-max" onClick={() => handleSort('department')}>
                    Department & Role
                    {sortConfig.key === 'department' ? (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-600 transition-colors w-max" onClick={() => handleSort('email')}>
                    Email Contact
                    {sortConfig.key === 'email' ? (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Administrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan={4} className="text-center p-4">Loading...</td></tr>}
              {!loading && filteredPersonnel.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm border border-blue-100">
                        {person.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{person.name}</div>
                        {person.job_title && (
                          <div className="text-xs text-gray-400 font-medium">
                            {person.job_title}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900 text-sm">
                      {person.role?.name === 'DEPARTMENT ADMIN' && person.department?.code 
                        ? `${person.department.code} Admin`.toUpperCase() 
                        : person.role?.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{person.department?.name || 'Global Access'}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-500">{person.email}</div>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Provision New Personnel</h3>
              <button onClick={() => setShowProvisionModal(false)}><X className="w-5 h-5 text-gray-500 hover:text-gray-900" /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Name</label>
                <input type="text" value={provName} onChange={e => setProvName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input type="email" value={provEmail} onChange={e => setProvEmail(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div className={!isGlobal() ? "col-span-2" : ""}>
                <label className="block text-sm font-semibold mb-1">Job Title</label>
                <input type="text" value={provJobTitle} onChange={e => setProvJobTitle(e.target.value)} placeholder="e.g. Senior Agent" className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              {isGlobal() && (
                <div>
                  <label className="block text-sm font-semibold mb-1">Role</label>
                  <select value={provRoleId} onChange={e => setProvRoleId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                    <option value="">Select a role...</option>
                    {roles.filter(r => r.name !== 'SUPER ADMIN').map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {isGlobal() && (
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Department</label>
                  <select value={provDeptId} onChange={e => setProvDeptId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                    <option value="">Select a department...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <button onClick={handleProvision} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded mt-6 hover:bg-blue-700 transition-colors">
              Provision Personnel
            </button>
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
