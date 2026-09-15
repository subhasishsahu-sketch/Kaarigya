"""
Kalakriti — Gray-Level Co-occurrence Matrix (GLCM) Texture Feature Module.

Extracts second-order statistical texture features (contrast, dissimilarity,
homogeneity, energy, correlation, ASM) from grayscale ROI surfaces to capture
fine physical surface roughness and micro-structure.
"""

import logging
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
from skimage.feature import graycomatrix, graycoprops

logger = logging.getLogger(__name__)

GLCM_FEATURE_VERSION = "1.0.0"
DEFAULT_PROPERTIES = ["contrast", "dissimilarity", "homogeneity", "energy", "correlation", "ASM"]


def compute_glcm_features(
    image_gray: np.ndarray,
    distances: Optional[List[int]] = None,
    angles: Optional[List[float]] = None,
    levels: int = 256,
    properties: Optional[List[str]] = None,
    symmetric: bool = True,
    normed: bool = True,
) -> Dict[str, Any]:
    """
    Compute GLCM property matrices and summary feature vector for a grayscale image.

    Args:
        image_gray: 2D uint8 grayscale image patch.
        distances: List of pixel pair distances (default: [1, 2, 4]).
        angles: List of pixel pair angles in radians (default: [0, pi/4, pi/2, 3pi/4]).
        levels: Number of gray levels (default: 256, will quantize if needed).
        properties: List of GLCM properties to compute.
        symmetric: If True, symmetric GLCM is computed.
        normed: If True, GLCM is normalized.

    Returns:
        Dictionary containing:
            - feature_vector: 1D np.ndarray of mean property values across angles
            - property_means: Dict[str, float] mapping property name -> mean value
            - property_stds: Dict[str, float] mapping property name -> std across angles
            - raw_props: Dict[str, np.ndarray] raw property values (distances x angles)
            - metadata: config params
    """
    if image_gray is None or image_gray.ndim != 2:
        raise ValueError("GLCM requires a valid 2D grayscale image.")

    if distances is None:
        distances = [1, 2, 4]
    if angles is None:
        angles = [0, np.pi / 4, np.pi / 2, 3 * np.pi / 4]
    if properties is None:
        properties = DEFAULT_PROPERTIES

    # Ensure uint8
    if image_gray.dtype != np.uint8:
        img_min = image_gray.min()
        img_max = image_gray.max()
        if img_max > img_min:
            img_uint8 = np.clip((image_gray - img_min) / (img_max - img_min) * 255.0, 0, 255).astype(np.uint8)
        else:
            img_uint8 = np.zeros_like(image_gray, dtype=np.uint8)
    else:
        img_uint8 = image_gray

    # Quantize to specified levels if levels < 256 (e.g. 64 levels for faster / denser GLCM)
    if levels < 256:
        quantized = (img_uint8.astype(np.float32) / 256.0 * levels).astype(np.uint8)
        quantized = np.clip(quantized, 0, levels - 1)
    else:
        quantized = img_uint8

    try:
        glcm = graycomatrix(
            quantized,
            distances=distances,
            angles=angles,
            levels=levels,
            symmetric=symmetric,
            normed=normed,
        )
    except Exception as e:
        logger.error(f"Failed to compute GLCM matrix: {e}")
        # Return fallback zero features
        zeros_vec = np.zeros(len(properties) * len(distances), dtype=np.float32)
        return {
            "feature_vector": zeros_vec,
            "property_means": {p: 0.0 for p in properties},
            "property_stds": {p: 0.0 for p in properties},
            "raw_props": {},
            "metadata": {"version": GLCM_FEATURE_VERSION, "error": str(e)},
        }

    prop_means = {}
    prop_stds = {}
    raw_props = {}
    vec_elements = []

    for prop in properties:
        val_matrix = graycoprops(glcm, prop)  # shape: (len(distances), len(angles))
        raw_props[prop] = val_matrix
        mean_val = float(np.mean(val_matrix))
        std_val = float(np.std(val_matrix))
        prop_means[prop] = mean_val
        prop_stds[prop] = std_val
        # Mean across angles for each distance
        for d_idx in range(len(distances)):
            vec_elements.append(float(np.mean(val_matrix[d_idx, :])))

    return {
        "feature_vector": np.array(vec_elements, dtype=np.float32),
        "property_means": prop_means,
        "property_stds": prop_stds,
        "raw_props": raw_props,
        "metadata": {
            "version": GLCM_FEATURE_VERSION,
            "distances": distances,
            "angles": [float(a) for a in angles],
            "levels": levels,
            "properties": properties,
        },
    }


def compare_glcm_features(
    ref_glcm_vector: np.ndarray,
    ver_glcm_vector: np.ndarray,
    weights: Optional[np.ndarray] = None,
) -> Dict[str, float]:
    """
    Compare two GLCM feature vectors and return similarity in [0, 1] and Euclidean distance.

    Args:
        ref_glcm_vector: Reference 1D GLCM feature array.
        ver_glcm_vector: Verification 1D GLCM feature array.
        weights: Optional feature weights.

    Returns:
        Dict with 'glcm_similarity' (0 to 1) and 'glcm_distance'.
    """
    if ref_glcm_vector is None or ver_glcm_vector is None:
        return {"glcm_similarity": 0.0, "glcm_distance": 1.0}

    r_vec = np.asarray(ref_glcm_vector, dtype=np.float32).ravel()
    v_vec = np.asarray(ver_glcm_vector, dtype=np.float32).ravel()

    if len(r_vec) == 0 or len(v_vec) == 0 or len(r_vec) != len(v_vec):
        return {"glcm_similarity": 0.0, "glcm_distance": 1.0}

    # Relative normalized distance per component: |r - v| / (|r| + |v| + eps)
    eps = 1e-6
    rel_diffs = np.abs(r_vec - v_vec) / (np.abs(r_vec) + np.abs(v_vec) + eps)

    if weights is not None and len(weights) == len(rel_diffs):
        w = np.asarray(weights, dtype=np.float32)
        w = w / (np.sum(w) + eps)
        norm_dist = float(np.sum(rel_diffs * w))
    else:
        norm_dist = float(np.mean(rel_diffs))

    # Convert normalized distance (0 = identical, 1 = completely different) to similarity
    similarity = float(np.clip(1.0 - norm_dist, 0.0, 1.0))
    euclidean_dist = float(np.linalg.norm(r_vec - v_vec))

    return {
        "glcm_similarity": similarity,
        "glcm_distance": norm_dist,
        "glcm_euclidean_distance": euclidean_dist,
    }
