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
  return (
    <div className="flex gap-6 h-full">
      {/* Left Filters - EIMS style */}
      <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-fit hidden xl:block">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Table View</h3>
          <button className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">Reset</button>
        </div>
        <p className="text-sm text-gray-600 font-medium mb-4">Default fields shown</p>
        
        <div className="space-y-3">
          {['Date', 'Ticket', 'Personnel', 'Average'].map((filter, i) => (
            <label key={filter} className="flex items-center gap-3">
              <input 
                type="checkbox" 
                defaultChecked={i !== 1} // just to show some unchecked
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
              />
              <span className="text-sm font-medium text-gray-700">{filter}</span>
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
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Personnel</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Average Score</th>
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
                    <div className="text-xs text-gray-500 mt-0.5">{row.date}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{row.ticket}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.personnel}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-bold text-gray-900">{row.score.toFixed(1)}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  </td>
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
        <div className="bg-[#111827] rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold tracking-wide text-sm">SUPER ADMIN CONTEXT</h3>
          </div>
          <p className="text-blue-100 text-sm mb-6">"Super Admin sees all Departments."</p>
          
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">Original Sketch Annotation</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Translating pencil sketch diagram into production dashboard widgets. The table represents unified response ledger controls.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-sm mb-6 uppercase tracking-wider">
            <Settings2 className="w-4 h-4" /> Mockup Interactive Actions
          </div>
          <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-200">
            <PlusCircle className="w-4 h-4" /> Simulate Customer Feed
          </button>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed px-2">
            Clicking will insert simulated live ratings into the table above with assignees. Use column toggles in the sidebar to filter.
          </p>
        </div>
      </div>
    </div>
  );
}

// Simple icons mapped locally for imports
function ShieldCheck(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.89 0 5.09 1.14 7 2a1 1 0 0 1 1 1v7z"/><path d="m9 12 2 2 4-4"/></svg>;
}
function Settings2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>;
}
function PlusCircle(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>;
}
