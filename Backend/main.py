import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import engine, Base
from api.endpoints import router as ml_router
from ml.cv_engine import CVEngine
from ml.crypto_utils import generate_rsa_keypair, save_keypair

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing KALAKRITI Backend...")
    
    # 1. Load ML Model (Simulated for Prototype)
    app.state.model = {"model_name": "RandomForest_V1"}
    logger.info("ML Model loaded into application state.")
    
    # 2. Initialize CV Engine
    app.state.cv_engine = CVEngine()
    logger.info("CV Engine initialized.")
    
    # 3. Ensure RSA keys exist
    keys_dir = "keys"
    if not os.path.exists(os.path.join(keys_dir, "private_key.pem")):
        priv_k, pub_k = generate_rsa_keypair()
        save_keypair(priv_k, pub_k, keys_dir=keys_dir)
        logger.info("Generated new RSA keypair for Manifest signing.")
        
    yield
    
    # Shutdown actions
    logger.info("Shutting down KALAKRITI Backend...")
    app.state.model = None
    app.state.cv_engine = None

app = FastAPI(
    title="Kalakriti ML Engine API",
    description="AI-Enhanced Trust System for physical product authentication.",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ml_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "KALAKRITI Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
