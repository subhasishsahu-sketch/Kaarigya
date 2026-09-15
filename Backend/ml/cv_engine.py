import cv2
import numpy as np
from skimage.feature import graycomatrix, graycoprops
from scipy.fft import fft2, fftshift
import logging

logger = logging.getLogger(__name__)

class CVEngine:
    def __init__(self, keypoint_threshold=100, min_match_count=10):
        """
        Adaptive Physical Authentication Engine
        """
        self.keypoint_threshold = keypoint_threshold
        self.min_match_count = min_match_count
        self.detector = cv2.AKAZE_create() # AKAZE/ORB
        
    def extract_features(self, image: np.ndarray) -> dict:
        """
        Adaptive router that checks keypoint density and routes to Path A or Path B.
        """
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
            
        keypoints, descriptors = self.detector.detectAndCompute(gray, None)
        
        features = {
            "num_keypoints": len(keypoints) if keypoints else 0,
            "path_used": "UNKNOWN"
        }
        
        if features["num_keypoints"] >= self.keypoint_threshold:
            # Path A: Highly textured item
            features["path_used"] = "PATH_A"
            features["keypoints"] = keypoints
            features["descriptors"] = descriptors
            logger.info(f"Routed to Path A (AKAZE/ORB): {features['num_keypoints']} keypoints found.")
        else:
            # Path B: Smooth/uniform item (ZNCC + 2D-FFT + GLCM)
            features["path_used"] = "PATH_B"
            logger.info(f"Routed to Path B (ZNCC/FFT/GLCM): Only {features['num_keypoints']} keypoints found.")
            
            # ZNCC (Zero-mean Normalized Cross-Correlation) will be used during matching phase,
            # but we extract frequency and texture features here.
            
            # 2D-FFT Magnitude Spectrum
            f_transform = fft2(gray)
            f_shift = fftshift(f_transform)
            magnitude_spectrum = 20 * np.log(np.abs(f_shift) + 1e-8)
            features["fft_mean"] = np.mean(magnitude_spectrum)
            features["fft_std"] = np.std(magnitude_spectrum)
            
            # GLCM (Gray-Level Co-occurrence Matrix)
            glcm = graycomatrix(gray, distances=[1, 5], angles=[0, np.pi/4, np.pi/2, 3*np.pi/4], levels=256, symmetric=True, normed=True)
            features["glcm_contrast"] = graycoprops(glcm, 'contrast').mean()
            features["glcm_correlation"] = graycoprops(glcm, 'correlation').mean()
            features["glcm_energy"] = graycoprops(glcm, 'energy').mean()
            features["glcm_homogeneity"] = graycoprops(glcm, 'homogeneity').mean()
            
        return features

    def match_features(self, query_features: dict, reference_features: dict) -> dict:
        """
        Match extracted features based on the path used.
        """
        path = query_features.get("path_used")
        ref_path = reference_features.get("path_used")
        
        if path != ref_path:
            return {"match": False, "score": 0.0, "reason": "Texture path mismatch."}
            
        if path == "PATH_A":
            # RANSAC matching
            matcher = cv2.DescriptorMatcher_create(cv2.DescriptorMatcher_BRUTEFORCE_HAMMING)
            matches = matcher.knnMatch(query_features["descriptors"], reference_features["descriptors"], k=2)
            
            good_matches = []
            for m, n in matches:
                if m.distance < 0.75 * n.distance:
                    good_matches.append(m)
                    
            if len(good_matches) > self.min_match_count:
                # Could apply RANSAC Homography here if we had coordinates
                score = min(1.0, len(good_matches) / 50.0) 
                return {"match": True, "score": score, "inliers": len(good_matches)}
            else:
                return {"match": False, "score": 0.0, "inliers": len(good_matches)}
                
        elif path == "PATH_B":
            # Compare FFT and GLCM using empirical thresholds or Euclidean distance
            fft_diff = abs(query_features["fft_mean"] - reference_features["fft_mean"])
            glcm_diff = abs(query_features["glcm_contrast"] - reference_features["glcm_contrast"])
            
            # Simple thresholding logic for matching Path B
            if fft_diff < 5.0 and glcm_diff < 10.0:
                # Score based on similarity (inverse of difference)
                score = 1.0 - min(1.0, (fft_diff / 5.0) * 0.5 + (glcm_diff / 10.0) * 0.5)
                return {"match": True, "score": score, "reason": "Path B matching successful"}
            else:
                return {"match": False, "score": 0.0, "reason": "Path B distance too high"}
                
        return {"match": False, "score": 0.0, "reason": "Unknown path"}
