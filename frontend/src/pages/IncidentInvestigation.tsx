import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Clock, GitCommit, CheckCircle2, ArrowRight } from 'lucide-react';

export default function IncidentInvestigation() {
  const { id } = useParams();
  const [incident, setIncident] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incRes, timeRes, corrRes, recRes] = await Promise.all([
          fetch(`http://localhost:8000/api/incidents/${id}`),
          fetch(`http://localhost:8000/api/incidents/${id}/timeline`),
          fetch(`http://localhost:8000/api/incidents/${id}/correlations`),
          fetch(`http://localhost:8000/api/incidents/${id}/recommendations`)
        ]);
        
        setIncident(await incRes.json());
        setTimeline(await timeRes.json());
        setCorrelations(await corrRes.json());
        setRecommendations(await recRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="flex h-full items-center justify-center">Loading investigation data...</div>;
  if (!incident || incident.detail === "Incident not found") return <div className="flex h-full items-center justify-center">Incident {id} not found.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-lg p-6 border border-border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-primary">INCIDENT {incident.incident_id}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${incident.severity === 'Critical' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                {incident.severity}
              </span>
            </div>
            <h3 className="text-xl text-slate-200">{incident.title}</h3>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Status</div>
            <div className="text-lg text-warning font-semibold">{incident.status}</div>
          </div>
        </div>
        <div className="text-slate-300">
          <p>{incident.description}</p>
          <p className="mt-2 text-sm text-slate-400">Started: {new Date(incident.timestamp).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><Clock size={20} /> Incident Timeline</h3>
          <div className="relative pl-6 border-l-2 border-slate-700 space-y-6">
            {timeline.map((event, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-[35px] bg-surface border-2 rounded-full p-1 ${
                  event.type === 'incident' ? 'border-danger text-danger' : 
                  event.type === 'change' ? 'border-primary text-primary' : 'border-warning text-warning'
                }`}>
                  {event.type === 'incident' ? <AlertTriangle size={16} /> : 
                   event.type === 'change' ? <GitCommit size={16} /> : <ActivityIcon size={16} />}
                </div>
                <div>
                  <div className="text-sm text-slate-400">{new Date(event.time).toLocaleTimeString()}</div>
                  <div className={`font-medium ${event.type === 'incident' ? 'text-danger' : 'text-slate-200'}`}>
                    {event.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Correlations & Evidence */}
        <div className="space-y-6">
          <div className="bg-surface rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><GitCommit size={20} /> Potentially Related Changes</h3>
            {correlations.length === 0 ? (
              <p className="text-slate-400">No correlated changes found.</p>
            ) : (
              <div className="space-y-4">
                {correlations.map((corr, idx) => (
                  <div key={idx} className="p-4 border border-primary/30 bg-primary/5 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-primary">{corr.device.name} - {corr.change.change_type} Configuration Modified</div>
                        <div className="text-sm text-slate-400">{new Date(corr.change.timestamp).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Correlation Evidence Score</div>
                        <div className="text-xl font-bold text-success">{corr.correlation.total_score}/100</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 border-t border-border pt-4">
                      <h4 className="text-sm font-semibold mb-2">Correlation Evidence:</h4>
                      <div className="space-y-2 text-sm text-slate-300">
                        {corr.correlation.explanation.split('\\n').map((ev: string, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-success mt-0.5"><CheckCircle2 size={16} /></span>
                            <span>{ev.replace('✓ ', '')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-surface rounded-lg p-6 border border-border border-l-4 border-l-primary">
            <h3 className="text-lg font-semibold mb-4">Recommended Investigation</h3>
            {recommendations.length === 0 ? (
              <p className="text-slate-400">No recommendations available.</p>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1 text-primary"><ArrowRight size={18} /></div>
                    <div>
                      <div className="font-medium text-slate-200">{rec.recommendation}</div>
                      <div className="text-sm text-slate-400 mt-1">Reason: {rec.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
}
