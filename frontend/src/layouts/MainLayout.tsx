import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Network, Activity, AlertTriangle, Settings, Menu } from 'lucide-react';
import { useState } from 'react';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/topology", icon: <Network size={20} />, label: "Topology" },
    { to: "/metrics", icon: <Activity size={20} />, label: "Metrics" },
    // A placeholder for incident nav, usually dashboard is enough to navigate there
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className={`bg-surface border-r border-border transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && <span className="font-bold text-xl text-primary truncate">NetCorrelate</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-700 rounded-md text-slate-300">
            <Menu size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive ? 'bg-primary/20 text-primary' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">Intelligent Network Change Impact & Correlation System</h1>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-md hover:bg-primary/20 transition-colors"
              onClick={async () => {
                // Demo Incident button action
                try {
                  await fetch('http://localhost:8000/api/correlations/analyze/INC-1024', { method: 'POST' });
                  window.location.href = '/incidents/INC-1024';
                } catch (e) {
                  console.error(e);
                  window.location.href = '/incidents/INC-1024';
                }
              }}
            >
              <AlertTriangle size={16} />
              <span>Demo Incident</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <Settings size={18} />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
