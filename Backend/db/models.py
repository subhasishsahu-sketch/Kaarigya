from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base

class Artisan(Base):
    __tablename__ = "artisans"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    products = relationship("Product", back_populates="artisan")


class Product(Base):
    __tablename__ = "products"

    product_id = Column(String, primary_key=True, index=True)
    name = Column(String)
    artisan_id = Column(String, ForeignKey("artisans.id"))
    category = Column(String)
    batch = Column(String)
    location = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Layer 1 Fingerprint / ROI references
    fingerprint_path = Column(String) 
    roi_metadata = Column(JSON)
    
    artisan = relationship("Artisan", back_populates="products")
    manifest = relationship("Manifest", back_populates="product", uselist=False)
    incidents = relationship("Incident", back_populates="product")


class Manifest(Base):
    __tablename__ = "manifests"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.product_id"), unique=True)
    manifest_hash = Column(String, index=True)
    rsa_signature = Column(Text)
    manifest_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product", back_populates="manifest")


class Incident(Base):
    __tablename__ = "incidents"

    incident_id = Column(String, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.product_id"), nullable=True)
    authentication_status = Column(String)
    authentication_score = Column(Float)
    final_decision = Column(String)
    physical_decision = Column(String)
    digital_decision = Column(String)
    confidence = Column(String)
    
    # Layer 1 references
    ransac_inlier_ratio = Column(Float, default=0.0)
    lbp_similarity = Column(Float, default=0.0)
    glcm_similarity = Column(Float, default=0.0)
    
    # Optional GPS
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_source = Column(String, default="UNKNOWN")
    
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="NEW")
    
    product = relationship("Product", back_populates="incidents")
