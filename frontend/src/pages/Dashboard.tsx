import { Users, CheckCircle, Star, ArrowRight, Building } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';

export function Dashboard() {
  const { isGlobal } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('all');
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const url = selectedDept === 'all' ? '/analytics' : `/analytics?departmentId=${selectedDept}`;
        const data = await api.get(url);
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, [selectedDept]);

  useEffect(() => {
    if (isGlobal()) {
      api.get('/departments').then(setDepartments).catch(console.error);
    }
  }, [isGlobal]);

  const chartData = stats?.chartData || [];

  const recentRatings = stats?.recentRatings || [];

  return (
    <div className="flex gap-6 h-full">
      {/* Left Column - Main Content */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Total Responses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Volume Indicator</div>
                <h3 className="text-xl font-bold text-gray-900">Total Responses</h3>
                <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-gray-100 flex items-center justify-center text-[8px]">📅</span> Monthly Recurrence
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-3 mt-auto">
              <span className="text-4xl font-bold text-gray-900">{stats?.totalResponses || 0}</span>
              <span className="text-sm font-medium text-emerald-500">+0.0% vs Last</span>
            </div>
          </div>

          {/* Average CSAT */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Quality Score</div>
                <h3 className="text-xl font-bold text-gray-900">Average CSAT</h3>
                <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-gray-100 flex items-center justify-center text-[8px]">📈</span> Key Performance Index
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-3 mt-auto">
              <span className="text-4xl font-bold text-gray-900">{stats?.averageCsat?.toFixed(1) || 0}%</span>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">CSAT This Month <span className="text-blue-500 text-sm bg-blue-50 px-2 py-0.5 rounded-md ml-2 font-semibold">Current</span></h3>
              <p className="text-sm text-gray-500 mt-1">Hourly feedback aggregated into historical daily indices.</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              CSAT Score %
            </div>
          </div>
          
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(val) => `${val}%`} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{r: 6}} fill="url(#colorUv)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Right Column - Recent Ratings */}
      <div className="w-[380px] bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[calc(100vh-8rem)]">
        
        {isGlobal() && (
          <div className="mb-6 pb-6 border-b border-gray-100">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Building className="w-3.5 h-3.5" /> Department Filter
            </label>
            <select 
              value={selectedDept} 
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2.5 font-medium cursor-pointer transition-colors hover:border-gray-300 outline-none"
            >
              <option value="all">All Departments (Company Wide)</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Recent Ratings</h3>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{recentRatings.length} total</span>
        </div>
        
        {/* Rating List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {recentRatings.length === 0 && <div className="text-sm text-gray-500 italic">No recent ratings found.</div>}
          {recentRatings.map((rating: any, idx: number) => (
            <div key={idx} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className={cn(
                  "text-sm font-bold px-2 py-0.5 rounded-md",
                  rating.score >= 9 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                )}>
                  {rating.score?.toFixed(1)}
                </span>
              </div>
              
              <div className="mb-2">
                <h4 className="font-bold text-gray-900 text-sm">{rating.name} <span className="font-normal text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded ml-1">{rating.dept}</span></h4>
              </div>
              
              <p className="text-sm text-gray-500 italic mb-4 line-clamp-2">
                "{rating.comment}"
              </p>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 flex items-center gap-1">
                  <span className="w-3 h-3 border border-gray-300 rounded-full flex items-center justify-center text-[8px]">🕒</span> {new Date(rating.time).toLocaleDateString()}
                </span>
                <button className="text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-700">
                  View details <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
