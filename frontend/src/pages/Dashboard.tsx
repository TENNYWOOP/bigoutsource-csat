import { Users, CheckCircle, BarChart3, Settings2, Star, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

const data = [
  { name: 'Feb 1', value: 82 },
  { name: 'Feb 4', value: 80 },
  { name: 'Feb 7', value: 85 },
  { name: 'Feb 10', value: 55 },
  { name: 'Feb 14', value: 75 },
  { name: 'Feb 18', value: 72 },
  { name: 'Feb 22', value: 88 },
  { name: 'Feb 26', value: 85 },
  { name: 'Feb 28', value: 95 },
];

const recentRatings = [
  { name: 'Tetan', dept: 'Support', score: 4.2, comment: 'System response is optimal and ticket resolution times meet expected targets...', time: '07-07-26' },
  { name: 'Alice Thorne', dept: 'Engineering', score: 9.8, comment: 'Exceptional support from the engineering lead. Resolved our high-priority server...', time: 'Just now' },
  { name: 'Marcus Brody', dept: 'Sales', score: 10.0, comment: 'Very friendly and patient during onboarding. The walkthrough of the...', time: '2 hrs ago' },
];

export function Dashboard() {
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
                  <span className="w-3 h-3 rounded bg-gray-100 flex items-center justify-center text-[8px]">📅</span> Monthly Recurrence (February)
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-3 mt-auto">
              <span className="text-4xl font-bold text-gray-900">432</span>
              <span className="text-sm font-medium text-emerald-500">+18.4% vs Jan</span>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">Completion Rate: 94.2%</span>
              <BarChart3 className="w-4 h-4 text-blue-500" />
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
              <span className="text-4xl font-bold text-gray-900">79%</span>
              <span className="text-sm font-medium text-red-500">-1.5% (Below Target)</span>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Target Benchmark</span>
                <span className="font-semibold text-gray-900">85.0%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[79%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">CSAT This Month <span className="text-blue-500 text-sm bg-blue-50 px-2 py-0.5 rounded-md ml-2 font-semibold">FEB</span></h3>
              <p className="text-sm text-gray-500 mt-1">Hourly feedback aggregated into historical daily indices.</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              CSAT Score %
            </div>
          </div>
          
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(val) => `${val}%`} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{r: 6}} fill="url(#colorUv)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4 flex gap-4">
          <Settings2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">Interactive Analytics Override</h4>
            <p className="text-sm text-gray-600">
              Hover on the chart vertices to read precise daily score indices. <strong>Click any data point</strong> (such as the deep dip on <strong>Feb 10</strong>) to filter the right-hand ratings feed down to that single day's survey submissions.
            </p>
          </div>
        </div>

      </div>

      {/* Right Column - Recent Ratings */}
      <div className="w-[380px] bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Recent Ratings</h3>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">8 total</span>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-50 rounded-lg">
          <button className="flex-1 py-1.5 text-xs font-semibold bg-white shadow-sm rounded-md text-gray-900">All</button>
          <button className="flex-1 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900">5★</button>
          <button className="flex-1 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900">4★</button>
          <button className="flex-1 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900">≤3★</button>
        </div>

        {/* Rating List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {recentRatings.map((rating, idx) => (
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
                  {rating.score.toFixed(1)}
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
                  <span className="w-3 h-3 border border-gray-300 rounded-full flex items-center justify-center text-[8px]">🕒</span> {rating.time}
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
