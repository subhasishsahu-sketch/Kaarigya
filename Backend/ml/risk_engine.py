import numpy as np
from sklearn.cluster import DBSCAN
import logging

logger = logging.getLogger(__name__)

class RiskEngine:
    def __init__(self, eps_features=5.0, min_samples=3, eps_geo=0.1):
        """
        Layer 3: Threat Intelligence Risk Engine
        Uses DBSCAN for clustering counterfeit feature vectors and GPS locations.
        """
        self.eps_features = eps_features
        self.min_samples = min_samples
        self.eps_geo = eps_geo # roughly 11km at equator for 0.1 deg
        
    def cluster_features(self, feature_vectors: list):
        """
        Cluster incidents based on their visual feature vectors to detect
        organized counterfeit rings producing identical fakes.
        """
        if not feature_vectors or len(feature_vectors) < self.min_samples:
            return []
            
        X = np.array(feature_vectors)
        # Using Euclidean distance on features (GLCM/FFT summary stats or descriptors)
        clustering = DBSCAN(eps=self.eps_features, min_samples=self.min_samples).fit(X)
        return clustering.labels_
        
    def cluster_locations(self, locations: list):
        """
        Cluster incidents based on GPS coordinates (lat, lon) to detect
        geographical hotspots.
        """
        if not locations or len(locations) < self.min_samples:
            return []
            
        X = np.array(locations)
        clustering = DBSCAN(eps=self.eps_geo, min_samples=self.min_samples).fit(X)
        return clustering.labels_
        
    def calculate_risk_score(self, incident, db_session) -> float:
        """
        Score (0-100) based on trend spikes and cluster density.
        For prototype, we use a simple heuristic based on recent failure rates
        and whether it belongs to a cluster.
        """
        score = 50.0 # Base risk for a counterfeit
        
        # In a real app, query db_session for recent incidents in the same location/cluster
        # to boost score. For now we just return a simulated score.
        score += 25.0 if incident.latitude else 0.0
        
        return min(100.0, score)
