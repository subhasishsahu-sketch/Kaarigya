from fastapi import Request, Depends
from sqlalchemy.orm import Session
from db.database import get_db

def get_db_session(db: Session = Depends(get_db)):
    """Dependency to get SQLAlchemy DB session."""
    return db

def get_ml_model(request: Request):
    """Dependency to get the loaded ML model from app state."""
    return getattr(request.app.state, "model", None)

def get_cv_engine(request: Request):
    """Dependency to get the initialized CV Engine."""
    return getattr(request.app.state, "cv_engine", None)
