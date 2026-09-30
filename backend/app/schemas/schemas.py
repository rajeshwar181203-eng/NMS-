from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DeviceBase(BaseModel):
    name: str
    type: str
    ip_address: str
    location: str
    status: str

class DeviceCreate(DeviceBase):
    pass

class Device(DeviceBase):
    id: int
    class Config:
        from_attributes = True

class ConfigurationChangeBase(BaseModel):
    device_id: int
    timestamp: datetime
    change_type: str
    description: str
    before_config: str
    after_config: str
    user: str
    severity: str

class ConfigurationChangeCreate(ConfigurationChangeBase):
    pass

class ConfigurationChange(ConfigurationChangeBase):
    id: int
    class Config:
        from_attributes = True

class DeviceEventBase(BaseModel):
    device_id: int
    timestamp: datetime
    event_type: str
    severity: str
    description: str

class DeviceEventCreate(DeviceEventBase):
    pass

class DeviceEvent(DeviceEventBase):
    id: int
    class Config:
        from_attributes = True

class MetricBase(BaseModel):
    device_id: int
    timestamp: datetime
    latency: float
    packet_loss: float
    cpu_usage: float
    memory_usage: float
    bandwidth: float

class MetricCreate(MetricBase):
    pass

class Metric(MetricBase):
    id: int
    class Config:
        from_attributes = True

class TopologyLinkBase(BaseModel):
    source_device_id: int
    destination_device_id: int
    link_type: str
    interface: str

class TopologyLinkCreate(TopologyLinkBase):
    pass

class TopologyLink(TopologyLinkBase):
    id: int
    class Config:
        from_attributes = True

class IncidentBase(BaseModel):
    incident_id: str
    timestamp: datetime
    end_timestamp: Optional[datetime] = None
    severity: str
    title: str
    description: str
    status: str

class IncidentCreate(IncidentBase):
    pass

class Incident(IncidentBase):
    id: int
    class Config:
        from_attributes = True

class ServiceBase(BaseModel):
    name: str
    description: str
    status: str

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    id: int
    class Config:
        from_attributes = True

class ServiceDependencyBase(BaseModel):
    service_id: int
    device_id: int
    dependency_type: str

class ServiceDependencyCreate(ServiceDependencyBase):
    pass

class ServiceDependency(ServiceDependencyBase):
    id: int
    class Config:
        from_attributes = True

class CorrelationBase(BaseModel):
    incident_id: str
    change_id: int
    temporal_score: float
    topology_score: float
    metric_score: float
    event_score: float
    total_score: float
    explanation: str

class CorrelationCreate(CorrelationBase):
    pass

class Correlation(CorrelationBase):
    id: int
    class Config:
        from_attributes = True

class RecommendationBase(BaseModel):
    incident_id: str
    priority: int
    recommendation: str
    reason: str

class RecommendationCreate(RecommendationBase):
    pass

class Recommendation(RecommendationBase):
    id: int
    class Config:
        from_attributes = True
