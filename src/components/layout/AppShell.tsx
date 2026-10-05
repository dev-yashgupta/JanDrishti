'use client';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { useUIStore } from '@/store/uiStore';

interface AppShellProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function AppShell({ children, showSidebar = true }: AppShellProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main
          className="flex-1 min-w-0 overflow-auto"
          style={showSidebar && sidebarOpen ? { marginLeft: 0 } : {}}
        >
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
