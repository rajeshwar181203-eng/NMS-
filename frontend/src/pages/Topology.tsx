import { useState, useEffect, useCallback } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function Topology() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/topology')
      .then(res => res.json())
      .then(data => {
        // Simple auto layout for tree
        const formattedNodes = data.nodes.map((n: any, idx: number) => {
          let x = 250;
          let y = 100;
          if (n.data.label.startsWith('R')) {
            x = 100 + (parseInt(n.data.label.replace('R', '')) * 100);
            y = 200;
          } else if (n.data.label.startsWith('S')) {
            x = 100 + (parseInt(n.data.label.replace('S', '')) * 100);
            y = 350;
          }
          
          let bgColor = '#1e293b';
          let border = '#334155';
          if (n.data.label === 'R7') {
            border = '#ef4444'; // Red border for R7 in our demo
          }
          
          return {
            id: n.id,
            position: { x, y },
            data: { 
              label: (
                <div className="p-2 w-32 text-center">
                  <div className="font-bold text-slate-200">{n.data.label}</div>
                  <div className="text-xs text-slate-400">{n.data.type}</div>
                </div>
              )
            },
            style: { background: bgColor, border: `2px solid ${border}`, borderRadius: '8px', color: '#f8fafc' }
          };
        });
        
        const formattedEdges = data.edges.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#475569', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#475569',
          },
        }));
        
        setNodes(formattedNodes);
        setEdges(formattedEdges);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center">Loading topology...</div>;

  return (
    <div className="h-full flex flex-col space-y-4">
      <h2 className="text-2xl font-bold">Network Topology</h2>
      <div className="flex-1 bg-surface border border-border rounded-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          colorMode="dark"
        >
          <Controls />
          <MiniMap style={{ background: '#0f172a' }} nodeColor="#334155" />
          <Background gap={12} size={1} color="#334155" />
        </ReactFlow>
      </div>
    </div>
  );
}
