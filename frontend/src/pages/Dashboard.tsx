import { Users, CheckCircle, Star, Building } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { motion } from 'motion/react';

export function Dashboard() {
  const { isGlobal } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [isRawDataOpen, setIsRawDataOpen] = useState(false);
  
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
  const distributionData = stats?.ratingDistribution 
    ? Object.entries(stats.ratingDistribution).map(([rating, count]) => ({ rating: `${rating} Star`, count: count as number }))
    : [];

  const exportCSV = () => {
    if (recentRatings.length === 0) return;
    const headers = ['Date', 'Survey', 'Rating', 'Comment'];
    const csvContent = [
      headers.join(','),
      ...recentRatings.map((r: any) => `"${new Date(r.submittedAt).toLocaleString()}","${r.surveyTitle}",${r.rating},"${(r.comment || '').replace(/"/g, '""')}"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'csat_raw_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Left Column - Main Content */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Total Responses */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col transition-shadow hover:shadow-lg"
          >
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
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{stats?.totalResponses || 0}</span>
              <span className="text-sm font-medium text-emerald-500">+0.0% vs Last</span>
            </div>
          </motion.div>

          {/* Average CSAT */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col transition-shadow hover:shadow-lg"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Quality Score</div>
                <h3 className="text-xl font-bold text-gray-900">Top-Box CSAT</h3>
                <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-gray-100 flex items-center justify-center text-[8px]">📈</span> % of 4 and 5 Star Ratings
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-3 mt-auto">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{stats?.averageCsat?.toFixed(1) || 0}%</span>
            </div>
          </motion.div>
        </div>

        {/* Chart Area */}
        <div className="grid grid-cols-2 gap-6 flex-1 min-h-[300px]">
          {/* Trend Line Chart */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col transition-shadow hover:shadow-lg"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">CSAT This Month <span className="text-blue-500 text-sm bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md ml-2 font-semibold">Current</span></h3>
                <p className="text-sm text-gray-500 mt-1">Hourly feedback aggregated into historical daily indices.</p>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(val) => `${val}%`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Distribution Bar Chart */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col transition-shadow hover:shadow-lg"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rating Distribution</h3>
                <p className="text-sm text-gray-500 mt-1">Breakdown of all responses by star rating.</p>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="rating" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} allowDecimals={false} />
                  <Tooltip cursor={{fill: '#F3F4F6'}} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={parseInt(entry.rating) >= 4 ? '#10B981' : (parseInt(entry.rating) === 3 ? '#FBBF24' : '#EF4444')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Right Column - Recent Ratings */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-[380px] bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-[calc(100vh-8rem)]"
      >
        
        {isGlobal() && (
          <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
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
          <button 
            onClick={() => setIsRawDataOpen(true)}
            className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors"
          >
            View Raw Data
          </button>
        </div>
        
        {/* Rating List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {recentRatings.length === 0 && <div className="text-sm text-gray-500 italic">No recent ratings found.</div>}
          {recentRatings.map((rating: any, idx: number) => (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              key={idx} 
              className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:border-gray-200 transition-all shadow-sm hover:shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-3.5 h-3.5", i < (rating.rating || 0) ? "fill-current" : "text-gray-300")} />
                  ))}
                </div>
                <span className={cn(
                  "text-sm font-bold px-2 py-0.5 rounded-md",
                  rating.rating >= 4 ? "bg-emerald-50 text-emerald-600" : (rating.rating === 3 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600")
                )}>
                  {rating.rating?.toFixed(1)}
                </span>
              </div>
              
              <div className="mb-2">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{rating.surveyTitle}</h4>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4 line-clamp-2">
                "{rating.comment || "No comment provided."}"
              </p>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 flex items-center gap-1">
                  <span className="w-3 h-3 border border-gray-300 rounded-full flex items-center justify-center text-[8px]">🕒</span> {new Date(rating.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Raw Data Modal */}
      {isRawDataOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-extrabold text-lg text-[#0f172a]">Raw Rating Data</h3>
                <p className="text-sm text-gray-500">Detailed list of all recent customer responses.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={exportCSV}
                  className="px-4 py-1.5 bg-[#0f172a] rounded-lg text-xs font-bold text-white hover:bg-[#1e293b] transition-colors"
                >
                  Export CSV
                </button>
                <button onClick={() => setIsRawDataOpen(false)} className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-[#0f172a] hover:bg-gray-50 transition-colors">
                  Close
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-200 sticky top-0">
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Survey Name</th>
                    <th className="py-3 px-6 text-center">Rating</th>
                    <th className="py-3 px-6 w-1/2">Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-sm text-gray-700">
                  {recentRatings.map((rating: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-6 whitespace-nowrap">{new Date(rating.submittedAt).toLocaleString()}</td>
                      <td className="py-3 px-6 font-medium text-gray-900">{rating.surveyTitle}</td>
                      <td className="py-3 px-6 text-center">
                        <span className={cn(
                          "inline-block font-bold px-2 py-0.5 rounded text-xs",
                          rating.rating >= 4 ? "bg-emerald-50 text-emerald-600" : (rating.rating === 3 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600")
                        )}>
                          {rating.rating} ★
                        </span>
                      </td>
                      <td className="py-3 px-6">{rating.comment || <span className="text-gray-400 italic">No comment</span>}</td>
                    </tr>
                  ))}
                  {recentRatings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 italic">No raw data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
