import os
import random
from datetime import datetime, timedelta
from app.database.database import SessionLocal, engine, Base
from app.models import models

# Ensure tables are created
Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    
    # Clear existing data
    db.query(models.Recommendation).delete()
    db.query(models.Correlation).delete()
    db.query(models.TopologyLink).delete()
    db.query(models.ServiceDependency).delete()
    db.query(models.Service).delete()
    db.query(models.Metric).delete()
    db.query(models.DeviceEvent).delete()
    db.query(models.ConfigurationChange).delete()
    db.query(models.Incident).delete()
    db.query(models.Device).delete()
    
    # Create Devices
    devices = []
    # Routers
    for i in range(1, 11):
        devices.append(models.Device(name=f"R{i}", type="Router", ip_address=f"10.0.0.{i}", location="Datacenter A", status="Healthy"))
    # Switches
    for i in range(1, 11):
        devices.append(models.Device(name=f"S{i}", type="Switch", ip_address=f"10.0.1.{i}", location="Datacenter A", status="Healthy"))
    # Firewalls
    for i in range(1, 6):
        devices.append(models.Device(name=f"FW{i}", type="Firewall", ip_address=f"10.0.2.{i}", location="Edge", status="Healthy"))
    
    for d in devices:
        db.add(d)
    db.commit()
    
    # Refresh to get IDs
    for d in devices:
        db.refresh(d)
    device_map = {d.name: d for d in devices}
    
    # Topology Links (Tree-like structure for the scenario)
    # Internet -> R1 -> R7/R8 -> S1/S2/S3
    links = [
        ("R1", "R7"), ("R1", "R8"),
        ("R7", "S1"), ("R7", "S2"),
        ("R8", "S3")
    ]
    for src, dst in links:
        db.add(models.TopologyLink(source_device_id=device_map[src].id, destination_device_id=device_map[dst].id, link_type="10G", interface="eth0"))
    db.commit()
    
    # Services
    services = [models.Service(name=f"Service {char}", description=f"Critical business app {char}", status="Healthy") for char in "ABCDEFGHIJ"]
    for s in services:
        db.add(s)
    db.commit()
    for s in services:
        db.refresh(s)
    
    # INC-1024 Scenario
    base_time = datetime.now() - timedelta(hours=1)
    
    # 10:13 AM: R7 OSPF configuration changed
    db.add(models.ConfigurationChange(
        device_id=device_map["R7"].id,
        timestamp=base_time + timedelta(minutes=13),
        change_type="OSPF",
        description="Modified OSPF neighbor configuration",
        before_config="router ospf 1\\n network 10.0.0.0/24",
        after_config="router ospf 1\\n network 10.0.1.0/24",
        user="admin",
        severity="Medium"
    ))
    
    # 10:14 AM: OSPF neighbor event
    db.add(models.DeviceEvent(
        device_id=device_map["R7"].id,
        timestamp=base_time + timedelta(minutes=14),
        event_type="OSPF_NEIGHBOR_DOWN",
        severity="Warning",
        description="OSPF neighbor 10.0.0.2 went down"
    ))
    
    # 10:16 AM: Latency increases
    # 10:17 AM: Packet loss increases
    for i in range(10, 20):
        t = base_time + timedelta(minutes=i)
        lat = 20.0 if i < 16 else 85.0 + random.uniform(0, 10)
        pl = 0.0 if i < 17 else 15.0 + random.uniform(0, 5)
        db.add(models.Metric(
            device_id=device_map["R7"].id,
            timestamp=t,
            latency=lat,
            packet_loss=pl,
            cpu_usage=30.0 + random.uniform(0, 5),
            memory_usage=45.0,
            bandwidth=500.0
        ))
    
    # 10:18 AM: Incident
    db.add(models.Incident(
        incident_id="INC-1024",
        timestamp=base_time + timedelta(minutes=17), # Let's say it was detected at 10:17
        severity="Critical",
        title="High Packet Loss and Service Degradation",
        description="Automated alert for elevated packet loss on core paths.",
        status="Investigating"
    ))
    db.commit()

    print("Seed data generated successfully!")

if __name__ == "__main__":
    seed()
