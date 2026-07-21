import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

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
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0F1117] font-sans text-gray-900 dark:text-slate-200">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Topbar title={title} />
        <main className="flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
