import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, CheckCircle, Clock, Server } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <div className="flex h-full items-center justify-center">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Network Operations Center</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Incidents" value={data.active_incidents} icon={<AlertTriangle className="text-warning" />} />
        <KPICard title="Critical Incidents" value={data.critical_incidents} icon={<AlertTriangle className="text-danger" />} />
        <KPICard title="Potentially Related Changes" value={data.recent_changes} icon={<Clock className="text-primary" />} />
        <KPICard title="Network Health" value={data.network_health} icon={data.network_health === "Healthy" ? <CheckCircle className="text-success" /> : <AlertTriangle className="text-warning" />} />
        <KPICard title="Average Latency" value={`${data.average_latency.toFixed(2)} ms`} icon={<Activity className="text-primary" />} />
        <KPICard title="Packet Loss" value={`${data.packet_loss.toFixed(2)}%`} icon={<Activity className="text-danger" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Recent Incidents</h3>
          <div className="space-y-4">
            <Link to="/incidents/INC-1024" className="block p-4 border border-border rounded bg-slate-800 hover:border-primary transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-primary">INC-1024</span>
                <span className="px-2 py-1 bg-danger/20 text-danger text-xs rounded-full">Critical</span>
              </div>
              <p className="text-sm">High Packet Loss and Service Degradation</p>
              <div className="text-xs text-slate-400 mt-2">Investigating</div>
            </Link>
          </div>
        </div>

        {/* Network Metrics Preview */}
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Network Latency Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{time: '10:00', latency: 20}, {time: '10:15', latency: 22}, {time: '10:17', latency: 85}, {time: '10:20', latency: 90}]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155'}} />
                <Line type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-lg p-6 border border-border flex items-center gap-4 hover:border-primary/50 transition-colors">
      <div className="p-3 bg-slate-800 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
