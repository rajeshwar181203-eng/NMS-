from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database.database import Base

class Device(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(String) # Router, Switch, Firewall, Server
    ip_address = Column(String)
    location = Column(String)
    status = Column(String)

class ConfigurationChange(Base):
    __tablename__ = "configuration_changes"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    change_type = Column(String)
    description = Column(String)
    before_config = Column(Text)
    after_config = Column(Text)
    user = Column(String)
    severity = Column(String)

    device = relationship("Device")

class DeviceEvent(Base):
    __tablename__ = "device_events"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String)
    severity = Column(String)
    description = Column(String)

    device = relationship("Device")

class Metric(Base):
    __tablename__ = "metrics"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    latency = Column(Float)
    packet_loss = Column(Float)
    cpu_usage = Column(Float)
    memory_usage = Column(Float)
    bandwidth = Column(Float)

    device = relationship("Device")

class TopologyLink(Base):
    __tablename__ = "topology_links"
    id = Column(Integer, primary_key=True, index=True)
    source_device_id = Column(Integer, ForeignKey("devices.id"))
    destination_device_id = Column(Integer, ForeignKey("devices.id"))
    link_type = Column(String)
    interface = Column(String)

    source_device = relationship("Device", foreign_keys=[source_device_id])
    destination_device = relationship("Device", foreign_keys=[destination_device_id])

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, unique=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    end_timestamp = Column(DateTime, nullable=True)
    severity = Column(String)
    title = Column(String)
    description = Column(String)
    status = Column(String)

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    status = Column(String)

class ServiceDependency(Base):
    __tablename__ = "service_dependencies"
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    device_id = Column(Integer, ForeignKey("devices.id"))
    dependency_type = Column(String)

    service = relationship("Service")
    device = relationship("Device")

class Correlation(Base):
    __tablename__ = "correlations"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.incident_id"))
    change_id = Column(Integer, ForeignKey("configuration_changes.id"))
    temporal_score = Column(Float)
    topology_score = Column(Float)
    metric_score = Column(Float)
    event_score = Column(Float)
    total_score = Column(Float)
    explanation = Column(Text)

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.incident_id"))
    priority = Column(Integer)
    recommendation = Column(Text)
    reason = Column(Text)
