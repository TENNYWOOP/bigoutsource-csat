import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';

const routeTitles: Record<string, string> = {
  '/': 'Survey Summary',
  '/ratings': 'Ratings',
  '/surveys': 'Survey Campaigns',
  '/personnel': 'Personnel Directory',
  '/audit-logs': 'System Audit Logs',
  '/settings': 'Administrative Settings',
};

export function Layout() {
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'Dashboard';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-gray-900">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Topbar title={title} />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
