import { Search, UserPlus, Edit2, Trash2, Building, X } from 'lucide-react';
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
  
  // Modals state
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showProvisionModal, setShowProvisionModal] = useState(false);

  // New Dept Form
  const [newDeptName, setNewDeptName] = useState('');

  // Provision Form
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
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
    if (!newDeptName.trim()) return;
    try {
      await api.post('/departments', { name: newDeptName });
      setNewDeptName('');
      fetchData();
    } catch (e: any) {
      alert(e.message);
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
    if (!provName || !provEmail || !provRoleId || !provDeptId) return alert('Fill all fields');
    try {
      await api.post('/personnel', {
        name: provName,
        email: provEmail,
        role_id: provRoleId,
        department_id: provDeptId
      });
      setShowProvisionModal(false);
      setProvName('');
      setProvEmail('');
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredPersonnel = personnel.filter(p => {
    if (selectedDept === 'All Departments') return true;
    return p.department?.name === selectedDept;
  });

  return (
    <div className="h-full max-w-6xl mx-auto relative">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Personnel Directory</h2>
          </div>
          <p className="text-gray-500 text-sm">Assign agents, manage roles, and review departments.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {isGlobal() && (
            <button onClick={() => setShowDeptModal(true)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors border border-gray-200">
              <Building className="w-4 h-4" /> Departments
            </button>
          )}
          {canManage() && (
            <button onClick={() => setShowProvisionModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-blue-200">
              <UserPlus className="w-4 h-4" /> Provision New Member
            </button>
          )}
        </div>
      </div>

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
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Team Operator</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Department & Role</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email Contact</th>
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
                        <div className="text-xs text-gray-400 font-medium">ID: {person.id.split('-')[0]}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900 text-sm">{person.role?.name}</div>
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

      {/* Departments Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[500px] max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Manage Departments</h3>
              <button onClick={() => setShowDeptModal(false)}><X className="w-5 h-5 text-gray-500 hover:text-gray-900" /></button>
            </div>
            <div className="flex gap-2 mb-6">
              <input type="text" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} placeholder="New department..." className="flex-1 border rounded px-3 py-2" />
              <button onClick={handleCreateDept} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {departments.map(d => (
                <div key={d.id} className="p-3 bg-gray-50 rounded border flex justify-between items-center group">
                  <span className="font-semibold text-sm">{d.name}</span>
                  <button 
                    onClick={() => handleDeleteDept(d.id)}
                    className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Provision Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Provision New Member</h3>
              <button onClick={() => setShowProvisionModal(false)}><X className="w-5 h-5 text-gray-500 hover:text-gray-900" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Name</label>
                <input type="text" value={provName} onChange={e => setProvName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input type="email" value={provEmail} onChange={e => setProvEmail(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Role</label>
                <select value={provRoleId} onChange={e => setProvRoleId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="">Select a role...</option>
                  {roles.filter(r => r.name !== 'SUPER ADMIN').map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Department</label>
                <select value={provDeptId} onChange={e => setProvDeptId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" disabled={!isGlobal()}>
                  <option value="">Select a department...</option>
                  {departments.filter(d => isGlobal() || d.id === user?.department_id).map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleProvision} className="w-full bg-blue-600 text-white font-semibold py-2 rounded mt-2 hover:bg-blue-700">Provision Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
