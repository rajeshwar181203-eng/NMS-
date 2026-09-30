import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Metrics() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<number | ''>('');
  
  useEffect(() => {
    fetch('http://localhost:8000/api/devices')
      .then(res => res.json())
      .then(setDevices)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const url = selectedDevice ? `http://localhost:8000/api/metrics?device_id=${selectedDevice}` : 'http://localhost:8000/api/metrics';
    fetch(url)
      .then(res => res.json())
      .then(data => {
        // Group by time or just display if filtered by device
        const sorted = data.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setMetrics(sorted.map((m: any) => ({
          ...m,
          time: new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        })));
      })
      .catch(console.error);
  }, [selectedDevice]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Monitoring</h2>
        <select 
          className="bg-surface border border-border text-slate-200 rounded px-3 py-2"
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(Number(e.target.value))}
        >
          <option value="">All Devices (Latest Metrics)</option>
          {devices.map(d => (
            <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-lg border border-border h-80">
          <h3 className="text-lg font-semibold mb-4 text-center">Latency (ms)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155'}} />
              <Legend />
              <Line type="monotone" dataKey="latency" stroke="#3b82f6" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface p-6 rounded-lg border border-border h-80">
          <h3 className="text-lg font-semibold mb-4 text-center">Packet Loss (%)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155'}} />
              <Legend />
              <Line type="monotone" dataKey="packet_loss" stroke="#ef4444" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
