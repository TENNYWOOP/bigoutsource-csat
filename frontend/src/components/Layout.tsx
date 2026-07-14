import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Outlet, useLocation } from 'react-router-dom';

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

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-gray-900">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Topbar title={title} />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
