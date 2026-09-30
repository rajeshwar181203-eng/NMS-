from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database.database import get_db
from ..models import models
from ..schemas import schemas
from ..correlation.engine import analyze_incident

router = APIRouter()

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    active_incidents = db.query(models.Incident).filter(models.Incident.status != "Resolved").count()
    critical_incidents = db.query(models.Incident).filter(models.Incident.severity == "Critical", models.Incident.status != "Resolved").count()
    recent_changes = db.query(models.ConfigurationChange).order_by(models.ConfigurationChange.timestamp.desc()).limit(5).all()
    affected_devices = db.query(models.Incident).filter(models.Incident.status != "Resolved").count() # simplistic for now
    
    # metrics aggregation
    metrics = db.query(models.Metric).order_by(models.Metric.timestamp.desc()).limit(100).all()
    avg_latency = sum([m.latency for m in metrics]) / len(metrics) if metrics else 0
    avg_loss = sum([m.packet_loss for m in metrics]) / len(metrics) if metrics else 0
    
    return {
        "active_incidents": active_incidents,
        "critical_incidents": critical_incidents,
        "recent_changes": len(recent_changes),
        "affected_devices": affected_devices,
        "network_health": "Warning" if critical_incidents > 0 else "Healthy",
        "packet_loss": avg_loss,
        "average_latency": avg_latency
    }

@router.get("/incidents", response_model=List[schemas.Incident])
def get_incidents(db: Session = Depends(get_db)):
    return db.query(models.Incident).all()

@router.get("/incidents/{incident_id}", response_model=schemas.Incident)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.incident_id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.get("/incidents/{incident_id}/timeline")
def get_incident_timeline(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.incident_id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    events = []
    # Fetch changes around incident time
    changes = db.query(models.ConfigurationChange).filter(
        models.ConfigurationChange.timestamp <= incident.timestamp
    ).order_by(models.ConfigurationChange.timestamp.desc()).limit(5).all()
    
    for c in changes:
        events.append({"time": c.timestamp, "description": f"{c.device.name} {c.change_type} changed", "type": "change"})

    # Fetch device events
    device_events = db.query(models.DeviceEvent).filter(
        models.DeviceEvent.timestamp <= incident.timestamp
    ).order_by(models.DeviceEvent.timestamp.desc()).limit(5).all()
    
    for e in device_events:
        events.append({"time": e.timestamp, "description": e.description, "type": "event"})
        
    events.append({"time": incident.timestamp, "description": f"Incident started: {incident.title}", "type": "incident"})
    
    events.sort(key=lambda x: x["time"])
    return events

@router.get("/incidents/{incident_id}/correlations")
def get_correlations(incident_id: str, db: Session = Depends(get_db)):
    correlations = db.query(models.Correlation).filter(models.Correlation.incident_id == incident_id).all()
    result = []
    for corr in correlations:
        change = db.query(models.ConfigurationChange).filter(models.ConfigurationChange.id == corr.change_id).first()
        result.append({
            "correlation": corr,
            "change": change,
            "device": change.device if change else None
        })
    return result

@router.get("/incidents/{incident_id}/recommendations")
def get_recommendations(incident_id: str, db: Session = Depends(get_db)):
    return db.query(models.Recommendation).filter(models.Recommendation.incident_id == incident_id).all()

@router.get("/topology")
def get_topology(db: Session = Depends(get_db)):
    nodes = db.query(models.Device).all()
    edges = db.query(models.TopologyLink).all()
    
    return {
        "nodes": [{"id": str(n.id), "data": {"label": n.name, "type": n.type, "status": n.status}} for n in nodes],
        "edges": [{"id": str(e.id), "source": str(e.source_device_id), "target": str(e.destination_device_id), "label": e.link_type} for e in edges]
    }

@router.get("/devices")
def get_devices(db: Session = Depends(get_db)):
    return db.query(models.Device).all()

@router.get("/changes")
def get_changes(db: Session = Depends(get_db)):
    changes = db.query(models.ConfigurationChange).order_by(models.ConfigurationChange.timestamp.desc()).limit(50).all()
    return [{"id": c.id, "device": c.device.name, "timestamp": c.timestamp, "change_type": c.change_type, "user": c.user, "severity": c.severity, "before_config": c.before_config, "after_config": c.after_config} for c in changes]

@router.get("/metrics")
def get_metrics(device_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Metric)
    if device_id:
        query = query.filter(models.Metric.device_id == device_id)
    return query.order_by(models.Metric.timestamp.desc()).limit(100).all()

@router.post("/correlations/analyze/{incident_id}")
def analyze(incident_id: str, db: Session = Depends(get_db)):
    return analyze_incident(incident_id, db)
