import { Bell, ShieldCheck, Diamond } from 'lucide-react';

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        
        {/* OmniCSAT specific system info */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-md">
            <ShieldCheck className="w-4 h-4" />
            SUPER ADMIN ACTIVE
          </div>
          <span className="text-gray-500 flex items-center gap-1">
            <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">i</span>
            Full System Permissions: can view all departments, edit personnel, edit survey rules.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Gateway Status */}
        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-emerald-600">
          <Diamond className="w-4 h-4" />
          Enterprise Live Gateway
        </div>
        
        {/* EIMS style notification and profile - optional but follows layout */}
        <button className="text-gray-400 hover:text-gray-600 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-900 leading-none">Sarah Vance</span>
            <span className="text-xs text-gray-500 mt-1">Super Admin</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-medium text-sm">
            SV
          </div>
        </div>
      </div>
    </header>
  );
}
