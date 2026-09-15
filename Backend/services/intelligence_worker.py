import logging
from core.celery_app import celery_app
from db.database import SessionLocal
from db.models import Incident
from ml.risk_engine import RiskEngine

logger = logging.getLogger(__name__)

@celery_app.task(name="analyze_incident_task")
def analyze_incident_task(incident_id: str):
    """
    Asynchronous Celery task for Layer 2 Counterfeit Intelligence.
    Does not block the main FastAPI thread.
    """
    logger.info(f"Starting async threat analysis for incident: {incident_id}")
    
    db = SessionLocal()
    try:
        incident = db.query(Incident).filter(Incident.incident_id == incident_id).first()
        if not incident:
            logger.error(f"Incident {incident_id} not found in DB.")
            return False
            
        risk_engine = RiskEngine()
        
        # 1. Calculate Risk Score based on trend spikes and cluster density
        score = risk_engine.calculate_risk_score(incident, db)
        incident.risk_score = score
        
        # 2. Simulate Clustering logic execution
        # In a real app we'd fetch all recent incidents to cluster them:
        # recent_incidents = db.query(Incident).filter(...).all()
        # locations = [[i.latitude, i.longitude] for i in recent_incidents if i.latitude]
        # risk_engine.cluster_locations(locations)
        
        # 3. Update Incident Status
        incident.status = "ANALYZED"
        db.commit()
        
        logger.info(f"Analysis complete for {incident_id}. Risk Score: {score}")
        
        # Note: Alerting logic (e.g. email, dashboard websocket push) would go here
        
        return True
    except Exception as e:
        logger.error(f"Error during analysis for {incident_id}: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()
