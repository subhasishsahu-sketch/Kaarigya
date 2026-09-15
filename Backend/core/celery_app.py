import os
from celery import Celery

# Redis configuration for Celery Broker and Backend
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "kalakriti_intelligence",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["services.intelligence_worker"]
)

# Optional configuration, see the application user guide.
celery_app.conf.update(
    result_expires=3600,
)

if __name__ == '__main__':
    celery_app.start()
