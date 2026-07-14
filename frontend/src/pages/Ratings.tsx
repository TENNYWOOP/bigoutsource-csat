import { useState } from 'react';
import { Search, ArrowRight, Star } from 'lucide-react';
import { cn } from '../lib/utils';

const ratings = [
  { name: 'Tetan', date: '07-07-26', badge: 'SKETCH ORIGINAL', ticket: '#TK-8941', personnel: 'Poo', score: 4.2 },
  { name: 'Alice Thorne', date: 'Just now', ticket: '#TK-1204', personnel: 'David Miller', score: 9.8 },
  { name: 'Marcus Brody', date: '2 hrs ago', ticket: '#TK-8831', personnel: 'Tony Stark', score: 10.0 },
  { name: 'Helena Rostova', date: '1 day ago', ticket: '#TK-4752', personnel: 'Diana Prince', score: 5.2 },
  { name: 'Thomas Finch', date: 'Feb 28, 4:15 PM', ticket: '#TK-3921', personnel: 'Ethan Hunt', score: 9.4 },
  { name: 'Corey Taylor', date: 'Feb 10, 10:30 AM', ticket: '#TK-1829', personnel: 'Ethan Hunt', score: 2.5 },
  { name: 'Julian Barns', date: 'Feb 14, 2:45 PM', ticket: '#TK-5542', personnel: 'Sarah Vance', score: 7.8 },
  { name: 'Evelyn Ross', date: 'Feb 1, 9:15 AM', ticket: '#TK-6101', personnel: 'Sarah Vance', score: 8.2 },
];

export function Ratings() {
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({
    Date: true,
    Ticket: false,
    Personnel: true,
    Average: true,
  });

  return (
    <div className="flex gap-6 h-full">
      {/* Left Filters - EIMS style */}
      <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-fit hidden xl:block">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Table View</h3>
          <button 
            onClick={() => setVisibleFields({ Date: true, Ticket: true, Personnel: true, Average: true })}
            className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded"
          >
            Reset
          </button>
        </div>
        <p className="text-sm text-gray-600 font-medium mb-4">Default fields shown</p>
        
        <div className="space-y-3">
          {['Date', 'Ticket', 'Personnel', 'Average'].map((filter) => (
            <label key={filter} className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={visibleFields[filter]}
                onChange={(e) => setVisibleFields(prev => ({ ...prev, [filter]: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
              />
              <span className="text-sm font-medium text-gray-700 select-none cursor-pointer">{filter}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Table Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-w-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100">
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">#</span>
            (All Depts)
          </button>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {visibleFields.Date ? "Name Date" : "Name"}
                </th>
                {visibleFields.Ticket && (
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket</th>
                )}
                {visibleFields.Personnel && (
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Personnel</th>
                )}
                {visibleFields.Average && (
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Average Score</th>
                )}
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ratings.map((row, i) => (
                <tr key={i} className={cn("hover:bg-gray-50/50 transition-colors", i === 0 && "bg-orange-50/30")}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{row.name}</span>
                      {row.badge && (
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded uppercase">{row.badge}</span>
                      )}
                    </div>
                    {visibleFields.Date && <div className="text-xs text-gray-500 mt-0.5">{row.date}</div>}
                  </td>
                  {visibleFields.Ticket && (
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{row.ticket}</td>
                  )}
                  {visibleFields.Personnel && (
                    <td className="px-6 py-4 text-sm text-gray-900">{row.personnel}</td>
                  )}
                  {visibleFields.Average && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-bold text-gray-900">{row.score.toFixed(1)}</span>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-center">
                    <button className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors",
                      i === 0 ? "bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                    )}>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Showing 8 of 8 digital ledger rows.</span>
          <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-medium">8</span>
        </div>
      </div>

      {/* Right Context Panels */}
      <div className="w-[320px] hidden lg:flex flex-col gap-6">
        {/* Left blank for now */}
      </div>
    </div>
  );
}
