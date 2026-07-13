import { Plus, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

const campaigns = [
  { 
    status: 'ACTIVE', date: 'Jan 15, 2026', 
    title: 'Enterprise Technical Integration check', dept: 'Support', 
    responses: 488, csat: '88%' 
  },
  { 
    status: 'ACTIVE', date: 'Feb 1, 2026', 
    title: 'SDK Developer Onboarding Feedback', dept: 'Sales', 
    responses: 310, csat: '94%' 
  },
  { 
    status: 'DRAFT', date: 'Feb 28, 2026', 
    title: 'Product Beta Tester Survey 2026', dept: 'Engineering', 
    responses: 0, csat: 'N/A' 
  },
  { 
    status: 'CLOSED', date: 'Dec 10, 2025', 
    title: 'Account Executive Q1 Relationship Survey', dept: 'Product', 
    responses: 142, csat: '81%' 
  },
];

export function Surveys() {
  return (
    <div className="h-full max-w-6xl mx-auto">
      {/* Header Area */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Survey Campaigns</h2>
            <span className="text-[10px] font-bold tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase border border-emerald-200">
              Super Admin Mode
            </span>
          </div>
          <p className="text-gray-500 text-sm">Manage external customer response rules and design Google Forms style survey layouts.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-blue-200">
          <Plus className="w-4 h-4" />
          Launch Survey Campaign
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col">
            
            <div className="flex justify-between items-center mb-6">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                campaign.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600" :
                campaign.status === 'DRAFT' ? "bg-gray-100 text-gray-600" :
                "bg-red-50 text-red-600"
              )}>
                {campaign.status}
              </span>
              <span className="text-xs font-medium text-gray-400">{campaign.date}</span>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3">{campaign.title}</h3>
              <span className="inline-flex text-xs font-medium bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md border border-gray-100">
                Dept: {campaign.dept}
              </span>
            </div>
            
            <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
              <div className="flex gap-8">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Responses</div>
                  <div className="font-bold text-gray-900">{campaign.responses}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CSAT Rating</div>
                  <div className="font-bold text-gray-900">{campaign.csat}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
