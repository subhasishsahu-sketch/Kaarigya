"""
Kalakriti — Model Training Module.

Trains a Random Forest classifier on engineered feature vectors.
Saves the model, feature names, metadata, and training metrics.
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple

import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

from src.utils import save_json
from src.feature_vector import get_feature_names

logger = logging.getLogger(__name__)


# =============================================================================
# Model Training
# =============================================================================

def train_random_forest(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: Optional[np.ndarray],
    y_val: Optional[np.ndarray],
    feature_names: List[str],
    config: dict,
) -> Tuple[RandomForestClassifier, Optional[StandardScaler], Dict]:
    """
    Train a Random Forest classifier.

    Args:
        X_train: Training feature matrix (n_samples, n_features).
        y_train: Training labels (n_samples,).
        X_val: Optional validation feature matrix.
        y_val: Optional validation labels.
        feature_names: Ordered list of feature names.
        config: Configuration dictionary.

    Returns:
        Tuple of (trained model, scaler, training_metrics).
    """
    model_cfg = config.get("model", {})

    # Handle class_weight
    class_weight = model_cfg.get("class_weight", "balanced")
    if class_weight == "balanced":
        pass  # sklearn understands this string
    elif class_weight is None or class_weight == "none":
        class_weight = None

    # Create classifier
    clf = RandomForestClassifier(
        n_estimators=model_cfg.get("n_estimators", 200),
        max_depth=model_cfg.get("max_depth", 10),
        min_samples_split=model_cfg.get("min_samples_split", 5),
        min_samples_leaf=model_cfg.get("min_samples_leaf", 2),
        class_weight=class_weight,
        random_state=model_cfg.get("random_state", 42),
        n_jobs=-1,
        oob_score=True,
    )

    # Optional: fit scaler (not strictly necessary for RF, but helps interpretability)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)

    logger.info(
        f"Training Random Forest with {X_train.shape[0]} samples, "
        f"{X_train.shape[1]} features..."
    )

    # Train
    clf.fit(X_train_scaled, y_train)

    # Collect training metrics
    train_accuracy = clf.score(X_train_scaled, y_train)
    metrics = {
        "train_accuracy": float(train_accuracy),
        "n_train_samples": int(X_train.shape[0]),
        "n_features": int(X_train.shape[1]),
        "n_positive_train": int(np.sum(y_train == 1)),
        "n_negative_train": int(np.sum(y_train == 0)),
        "oob_score": float(clf.oob_score_) if hasattr(clf, "oob_score_") else None,
    }

    # Validation metrics
    if X_val is not None and y_val is not None and len(y_val) > 0:
        X_val_scaled = scaler.transform(X_val)
        val_accuracy = clf.score(X_val_scaled, y_val)
        metrics["val_accuracy"] = float(val_accuracy)
        metrics["n_val_samples"] = int(X_val.shape[0])
        logger.info(f"Validation accuracy: {val_accuracy:.4f}")

    # Feature importances
    importances = clf.feature_importances_
    feature_importance = {
        name: float(imp) for name, imp in zip(feature_names, importances)
    }
    metrics["feature_importances"] = feature_importance

    logger.info(f"Training accuracy: {train_accuracy:.4f}")
    if metrics.get("oob_score"):
        logger.info(f"OOB score: {metrics['oob_score']:.4f}")

    # Log feature importances
    sorted_features = sorted(
        feature_importance.items(), key=lambda x: x[1], reverse=True
    )
    logger.info("Feature Importances:")
    print(f"\n{'Feature':<40} {'Importance':>10}")
    print("-" * 52)
    for name, imp in sorted_features:
        print(f"  {name:<38} {imp:>10.4f}")

    return clf, scaler, metrics


# =============================================================================
# Model Saving
# =============================================================================

def save_model(
    model: RandomForestClassifier,
    scaler: Optional[StandardScaler],
    feature_names: List[str],
    metrics: Dict,
    config: dict,
    output_dir: str,
) -> Dict[str, str]:
    """
    Save the trained model and associated metadata.

    Saves:
    - random_forest.joblib
    - scaler.joblib
    - feature_names.json
    - model_metadata.json
    - training_metrics.json

    Args:
        model: Trained RandomForestClassifier.
        scaler: Fitted StandardScaler.
        feature_names: Ordered feature names.
        metrics: Training metrics dictionary.
        config: Configuration dictionary.
        output_dir: Directory to save model files.

    Returns:
        Dictionary mapping file types to paths.
    """
    os.makedirs(output_dir, exist_ok=True)
    saved_files = {}

    # Save model
    model_path = os.path.join(output_dir, "random_forest.joblib")
    joblib.dump(model, model_path)
    saved_files["model"] = model_path
    logger.info(f"Saved model: {model_path}")

    # Save scaler
    if scaler is not None:
        scaler_path = os.path.join(output_dir, "scaler.joblib")
        joblib.dump(scaler, scaler_path)
        saved_files["scaler"] = scaler_path

    # Save feature names
    fn_path = os.path.join(output_dir, "feature_names.json")
    save_json(feature_names, fn_path)
    saved_files["feature_names"] = fn_path

    # Save model metadata
    metadata = {
        "model_type": config.get("model", {}).get("type", "random_forest"),
        "feature_method": config.get("feature_method", "ORB"),
        "n_estimators": model.n_estimators,
        "max_depth": model.max_depth,
        "n_features": model.n_features_in_,
        "feature_names": feature_names,
        "created_at": datetime.now().isoformat(),
        "decision_thresholds": config.get("decision", {}),
    }
    meta_path = os.path.join(output_dir, "model_metadata.json")
    save_json(metadata, meta_path)
    saved_files["metadata"] = meta_path

    # Save training metrics
    metrics_path = os.path.join(output_dir, "training_metrics.json")
    save_json(metrics, metrics_path)
    saved_files["metrics"] = metrics_path

    logger.info(f"Saved all model artifacts to {output_dir}")
    return saved_files


# =============================================================================
# Model Loading
# =============================================================================

def load_model(
    model_dir: str,
) -> Tuple[RandomForestClassifier, Optional[StandardScaler], List[str], Dict]:
    """
    Load a saved model and its artifacts.

    Args:
        model_dir: Directory containing model files.

    Returns:
        Tuple of (model, scaler, feature_names, metadata).
    """
    model_path = os.path.join(model_dir, "random_forest.joblib")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")

    model = joblib.load(model_path)
    logger.info(f"Loaded model: {model_path}")

    # Load scaler
    scaler_path = os.path.join(model_dir, "scaler.joblib")
    scaler = joblib.load(scaler_path) if os.path.exists(scaler_path) else None

    # Load feature names
    fn_path = os.path.join(model_dir, "feature_names.json")
    if os.path.exists(fn_path):
        with open(fn_path, "r") as f:
            feature_names = json.load(f)
    else:
        feature_names = get_feature_names()

    # Load metadata
    meta_path = os.path.join(model_dir, "model_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            metadata = json.load(f)
    else:
        metadata = {}

    return model, scaler, feature_names, metadata
