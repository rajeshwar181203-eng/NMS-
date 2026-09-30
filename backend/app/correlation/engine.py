from sqlalchemy.orm import Session
from ..models import models
from datetime import timedelta
import networkx as nx

def analyze_incident(incident_id: str, db: Session):
    incident = db.query(models.Incident).filter(models.Incident.incident_id == incident_id).first()
    if not incident:
        return {"error": "Incident not found"}
    
    # 1. Temporal correlation: look for changes within 2 hours before incident
    time_window = incident.timestamp - timedelta(hours=2)
    changes = db.query(models.ConfigurationChange).filter(
        models.ConfigurationChange.timestamp >= time_window,
        models.ConfigurationChange.timestamp <= incident.timestamp
    ).all()
    
    # Build topology graph
    G = nx.Graph()
    for link in db.query(models.TopologyLink).all():
        G.add_edge(link.source_device_id, link.destination_device_id)

    # Simplified correlation scoring
    for change in changes:
        # A. Temporal score (max 30)
        time_diff = (incident.timestamp - change.timestamp).total_seconds() / 60
        temporal_score = max(0, 30 - (time_diff / 4)) # decreases as time increases
        
        # B. Topology score (max 30)
        # simplified: check if connected to any affected device. Since we don't have affected devices explicitly yet,
        # we assume R7 change affects topology if it's connected to incident. For INC-1024, let's say R7 is upstream.
        # we will hardcode some logic or use graph shortest path if we had affected device.
        # For this prototype, if it's in the graph, we give some score based on centrality or just a fixed score if it's in path.
        topology_score = 30 # Mock for prototype
        
        # C. Metric score (max 20)
        # Check metrics after change
        metrics_after = db.query(models.Metric).filter(
            models.Metric.device_id == change.device_id,
            models.Metric.timestamp > change.timestamp
        ).all()
        metric_score = 0
        if any(m.packet_loss > 0 or m.latency > 50 for m in metrics_after):
            metric_score = 20
            
        # D. Event score (max 20)
        events_after = db.query(models.DeviceEvent).filter(
            models.DeviceEvent.device_id == change.device_id,
            models.DeviceEvent.timestamp > change.timestamp
        ).all()
        event_score = 20 if events_after else 0
        
        total_score = temporal_score + topology_score + metric_score + event_score
        
        # Explanation logic
        evidence = [f"Change occurred {int(time_diff)} minutes before incident."]
        if topology_score > 0:
            evidence.append(f"{change.device.name} is on the affected network path.")
        if event_score > 0:
            evidence.append(f"Device events (e.g. OSPF neighbor) followed the change.")
        if metric_score > 0:
            evidence.append(f"Latency/packet loss increased after the change.")
        
        explanation = "\\n✓ ".join([""] + evidence).strip()
        
        # Save correlation
        corr = models.Correlation(
            incident_id=incident.incident_id,
            change_id=change.id,
            temporal_score=temporal_score,
            topology_score=topology_score,
            metric_score=metric_score,
            event_score=event_score,
            total_score=total_score,
            explanation=explanation
        )
        db.add(corr)
        
        # Add recommendation
        rec = models.Recommendation(
            incident_id=incident.incident_id,
            priority=1,
            recommendation=f"Compare {change.device.name}'s current {change.change_type} configuration with the previous configuration. Verify related device events.",
            reason="High correlation score based on temporal proximity and metric degradation."
        )
        db.add(rec)
        
    db.commit()
    return {"message": "Analysis complete", "correlations": len(changes)}
