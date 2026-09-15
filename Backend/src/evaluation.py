"""
Kalakriti — Model Evaluation Module.

Evaluates the trained Random Forest on test data.
Reports accuracy, precision, recall, F1, ROC-AUC, confusion matrix,
GAR, FAR, FRR. Generates plots and evaluation_report.json.
"""

import os
import json
import logging
from typing import Dict, List, Optional, Tuple

import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    roc_curve,
    confusion_matrix,
    classification_report,
)
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

from src.utils import save_json

logger = logging.getLogger(__name__)


# =============================================================================
# Model Evaluation
# =============================================================================

def evaluate_model(
    model: RandomForestClassifier,
    scaler: Optional[StandardScaler],
    X_test: np.ndarray,
    y_test: np.ndarray,
    feature_names: List[str],
    reports_dir: str,
) -> Dict:
    """
    Comprehensive model evaluation on test data.

    Args:
        model: Trained classifier.
        scaler: Optional fitted scaler.
        X_test: Test feature matrix.
        y_test: Test labels.
        feature_names: Feature names.
        reports_dir: Directory to save reports and plots.

    Returns:
        Evaluation metrics dictionary.
    """
    os.makedirs(reports_dir, exist_ok=True)

    if len(y_test) == 0:
        logger.warning("No test data available for evaluation")
        return {"error": "No test data"}

    # Scale features if scaler exists
    X_eval = scaler.transform(X_test) if scaler is not None else X_test

    # Predictions
    y_pred = model.predict(X_eval)
    y_proba = model.predict_proba(X_eval)

    # Handle case where model only sees one class
    if y_proba.shape[1] == 2:
        y_proba_positive = y_proba[:, 1]
    else:
        y_proba_positive = y_proba[:, 0]

    # --- Core Metrics ---
    accuracy = float(accuracy_score(y_test, y_pred))
    precision = float(precision_score(y_test, y_pred, zero_division=0))
    recall = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))

    # ROC-AUC
    try:
        roc_auc = float(roc_auc_score(y_test, y_proba_positive))
    except ValueError:
        roc_auc = None
        logger.warning("Cannot compute ROC-AUC (only one class in test data)")

    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)

    # --- Authentication-specific Metrics ---
    tn = int(cm[0, 0]) if cm.shape[0] > 1 else 0
    fp = int(cm[0, 1]) if cm.shape[0] > 1 and cm.shape[1] > 1 else 0
    fn = int(cm[1, 0]) if cm.shape[0] > 1 else 0
    tp = int(cm[1, 1]) if cm.shape[0] > 1 and cm.shape[1] > 1 else 0

    # Genuine Acceptance Rate (GAR) = True Positive Rate = Recall
    gar = tp / (tp + fn) if (tp + fn) > 0 else 0.0

    # False Acceptance Rate (FAR) = FP / (FP + TN)
    far = fp / (fp + tn) if (fp + tn) > 0 else 0.0

    # False Rejection Rate (FRR) = FN / (FN + TP)
    frr = fn / (fn + tp) if (fn + tp) > 0 else 0.0

    metrics = {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "roc_auc": roc_auc,
        "confusion_matrix": cm.tolist(),
        "genuine_acceptance_rate": float(gar),
        "false_acceptance_rate": float(far),
        "false_rejection_rate": float(frr),
        "true_positives": tp,
        "true_negatives": tn,
        "false_positives": fp,
        "false_negatives": fn,
        "n_test_samples": int(len(y_test)),
        "n_positive_test": int(np.sum(y_test == 1)),
        "n_negative_test": int(np.sum(y_test == 0)),
    }

    # --- Print Report ---
    print(f"\n{'='*60}")
    print("MODEL EVALUATION REPORT")
    print(f"{'='*60}")
    print(f"  Test samples: {len(y_test)} "
          f"({np.sum(y_test == 1)} genuine, {np.sum(y_test == 0)} different)")
    print(f"\n  Accuracy:  {accuracy:.4f}")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall:    {recall:.4f}")
    print(f"  F1-score:  {f1:.4f}")
    if roc_auc is not None:
        print(f"  ROC-AUC:   {roc_auc:.4f}")
    print(f"\n  GAR (Genuine Acceptance Rate): {gar:.4f}")
    print(f"  FAR (False Acceptance Rate):   {far:.4f}")
    print(f"  FRR (False Rejection Rate):    {frr:.4f}")
    print(f"\n  Confusion Matrix:")
    print(f"    TN={tn}  FP={fp}")
    print(f"    FN={fn}  TP={tp}")
    print(f"{'='*60}")

    # --- Generate Plots ---
    _plot_confusion_matrix(cm, reports_dir)
    _plot_feature_importance(model, feature_names, reports_dir)

    if roc_auc is not None:
        _plot_roc_curve(y_test, y_proba_positive, roc_auc, reports_dir)

    # --- Save Report ---
    report_path = os.path.join(reports_dir, "evaluation_report.json")
    save_json(metrics, report_path)

    logger.info(f"Evaluation complete. Reports saved to {reports_dir}")
    return metrics


# =============================================================================
# Plot Generation
# =============================================================================

def _plot_confusion_matrix(cm: np.ndarray, output_dir: str):
    """Generate and save confusion matrix plot."""
    fig, ax = plt.subplots(figsize=(8, 6))

    im = ax.imshow(cm, interpolation="nearest", cmap=plt.cm.Blues)
    ax.figure.colorbar(im, ax=ax)

    labels = ["Different (0)", "Genuine (1)"]
    ax.set(
        xticks=[0, 1] if cm.shape[0] >= 2 else [0],
        yticks=[0, 1] if cm.shape[1] >= 2 else [0],
        xticklabels=labels[:cm.shape[1]],
        yticklabels=labels[:cm.shape[0]],
        xlabel="Predicted",
        ylabel="Actual",
        title="Confusion Matrix — Product Authentication",
    )

    # Add text annotations
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(
                j, i, str(cm[i, j]),
                ha="center", va="center",
                color="white" if cm[i, j] > cm.max() / 2 else "black",
                fontsize=16,
            )

    plt.tight_layout()
    path = os.path.join(output_dir, "confusion_matrix.png")
    plt.savefig(path, dpi=150)
    plt.close()
    logger.info(f"Saved confusion matrix: {path}")


def _plot_roc_curve(
    y_test: np.ndarray,
    y_proba: np.ndarray,
    roc_auc: float,
    output_dir: str,
):
    """Generate and save ROC curve plot."""
    fpr, tpr, _ = roc_curve(y_test, y_proba)

    fig, ax = plt.subplots(figsize=(8, 6))
    ax.plot(fpr, tpr, color="darkorange", lw=2,
            label=f"ROC curve (AUC = {roc_auc:.3f})")
    ax.plot([0, 1], [0, 1], color="navy", lw=1, linestyle="--")
    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("ROC Curve — Product Authentication")
    ax.legend(loc="lower right")

    plt.tight_layout()
    path = os.path.join(output_dir, "roc_curve.png")
    plt.savefig(path, dpi=150)
    plt.close()
    logger.info(f"Saved ROC curve: {path}")


def _plot_feature_importance(
    model: RandomForestClassifier,
    feature_names: List[str],
    output_dir: str,
):
    """Generate and save feature importance bar chart."""
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]

    fig, ax = plt.subplots(figsize=(10, 6))
    sorted_names = [feature_names[i] for i in indices]
    sorted_importances = importances[indices]

    bars = ax.barh(
        range(len(sorted_names)), sorted_importances,
        color=plt.cm.viridis(np.linspace(0.2, 0.8, len(sorted_names))),
    )
    ax.set_yticks(range(len(sorted_names)))
    ax.set_yticklabels(sorted_names)
    ax.invert_yaxis()
    ax.set_xlabel("Feature Importance")
    ax.set_title("Random Forest Feature Importance — Product Authentication")

    # Add value labels
    for bar, val in zip(bars, sorted_importances):
        ax.text(
            bar.get_width() + 0.005, bar.get_y() + bar.get_height() / 2,
            f"{val:.3f}", va="center", fontsize=10,
        )

    plt.tight_layout()
    path = os.path.join(output_dir, "feature_importance.png")
    plt.savefig(path, dpi=150)
    plt.close()
    logger.info(f"Saved feature importance: {path}")
