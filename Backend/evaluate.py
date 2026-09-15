#!/usr/bin/env python3
"""
Kalakriti — Standalone Model & Pipeline Evaluation CLI Script.

Evaluates the trained machine learning authentication model and feature pipeline:
1. Loads trained model, scaler, and feature definitions
2. Evaluates on test/validation dataset pairs from features.csv
3. Reports comprehensive biometric & ML metrics:
   - Accuracy, Precision, Recall, F1-score
   - ROC-AUC & Precision-Recall curves
   - Genuine Acceptance Rate (GAR), False Acceptance Rate (FAR), False Rejection Rate (FRR)
   - Confusion Matrix and feature importances
4. Saves evaluation reports, distribution plots, and performance summaries
"""

import os
import sys
import json
import argparse
import logging
from typing import Dict, List, Optional

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    roc_curve,
    precision_recall_curve,
    confusion_matrix,
)

from src.utils import (
    load_config,
    setup_directories,
    setup_logging,
    save_json,
)
from src.model_training import load_model
from src.feature_vector import feature_dict_to_array

logger = logging.getLogger(__name__)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Kalakriti — Standalone Authentication Model Evaluation"
    )
    parser.add_argument(
        "--features", "-f",
        default="data/features/features.csv",
        help="Path to features.csv (default: data/features/features.csv)"
    )
    parser.add_argument(
        "--model-dir", "-m",
        default="models",
        help="Directory containing trained model artifacts (default: models)"
    )
    parser.add_argument(
        "--output-dir", "-o",
        default="artifacts/evaluation",
        help="Directory to save evaluation reports and plots (default: artifacts/evaluation)"
    )
    parser.add_argument(
        "--config", "-c",
        default=None,
        help="Path to custom config.yaml file"
    )
    return parser.parse_args()


def main():
    args = parse_args()
    project_root = os.path.dirname(os.path.abspath(__file__))

    config = load_config(args.config)
    abs_paths = setup_directories(config, project_root)
    reports_dir = os.path.join(project_root, args.output_dir)
    os.makedirs(reports_dir, exist_ok=True)

    log_file = os.path.join(reports_dir, "evaluation.log")
    setup_logging(level=logging.INFO, log_file=log_file)

    # 1. Load Model
    model_dir = os.path.join(project_root, args.model_dir)
    if not os.path.exists(model_dir):
        print(f"\n[ERROR] Model directory not found: {model_dir}")
        print("   Please train a model first using: python train.py")
        sys.exit(1)

    try:
        model, scaler, feature_names, metadata = load_model(model_dir)
    except Exception as e:
        print(f"\n[ERROR] Failed to load model: {e}")
        sys.exit(1)

    # 2. Load Features CSV
    csv_path = os.path.join(project_root, args.features)
    if not os.path.exists(csv_path):
        print(f"\n[ERROR] Features dataset not found: {csv_path}")
        print("   Please run training or pair extraction first: python train.py")
        sys.exit(1)

    df = pd.read_csv(csv_path)
    if len(df) == 0:
        print(f"\n[ERROR] Features dataset is empty: {csv_path}")
        sys.exit(1)

    # 3. Prepare Feature Matrix X and Labels y
    X_list, y_list = [], []
    for _, row in df.iterrows():
        rec = row.to_dict()
        feat_vec = feature_dict_to_array(rec, feature_names)
        X_list.append(feat_vec)
        y_list.append(int(rec["label"]))

    X = np.array(X_list)
    y = np.array(y_list)

    # 4. Predict with Model
    X_eval = scaler.transform(X) if scaler is not None else X
    y_pred = model.predict(X_eval)
    y_proba = model.predict_proba(X_eval)

    if y_proba.shape[1] == 2:
        y_scores = y_proba[:, 1]
    else:
        y_scores = y_proba[:, 0] if model.classes_[0] == 1 else 1.0 - y_proba[:, 0]

    # 5. Compute Metrics
    accuracy = float(accuracy_score(y, y_pred))
    precision = float(precision_score(y, y_pred, zero_division=0))
    recall = float(recall_score(y, y_pred, zero_division=0))
    f1 = float(f1_score(y, y_pred, zero_division=0))

    try:
        roc_auc = float(roc_auc_score(y, y_scores))
    except Exception:
        roc_auc = None

    cm = confusion_matrix(y, y_pred)
    tn = int(cm[0, 0]) if cm.shape[0] > 1 else 0
    fp = int(cm[0, 1]) if cm.shape[0] > 1 and cm.shape[1] > 1 else 0
    fn = int(cm[1, 0]) if cm.shape[0] > 1 else 0
    tp = int(cm[1, 1]) if cm.shape[0] > 1 and cm.shape[1] > 1 else 0

    gar = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    far = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    frr = fn / (fn + tp) if (fn + tp) > 0 else 0.0

    eval_report = {
        "model_type": metadata.get("model_type", "random_forest"),
        "model_version": metadata.get("model_version", "2.0.0"),
        "n_features": len(feature_names),
        "feature_names": feature_names,
        "total_samples_evaluated": len(y),
        "genuine_samples": int(np.sum(y == 1)),
        "impostor_samples": int(np.sum(y == 0)),
        "metrics": {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "roc_auc": roc_auc,
            "genuine_acceptance_rate": float(gar),
            "false_acceptance_rate": float(far),
            "false_rejection_rate": float(frr),
        },
        "confusion_matrix": {
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn,
            "true_positives": tp,
        },
    }

    # 6. Print Formatted Report
    print(f"\n{'='*60}")
    print("KALAKRITI STANDALONE MODEL EVALUATION REPORT")
    print(f"{'='*60}")
    print(f"Model Type        : {metadata.get('model_type', 'random_forest')}")
    print(f"Features (k={len(feature_names)})   : {', '.join(feature_names[:4])}...")
    print(f"Total Samples     : {len(y)} ({np.sum(y == 1)} genuine, {np.sum(y == 0)} impostor)")
    print(f"{'-'*60}")
    print(f"Accuracy          : {accuracy:.4f} ({accuracy*100:.1f}%)")
    print(f"Precision         : {precision:.4f}")
    print(f"Recall (GAR)      : {recall:.4f}")
    print(f"F1-Score          : {f1:.4f}")
    if roc_auc is not None:
        print(f"ROC-AUC           : {roc_auc:.4f}")
    print(f"\nBiometric Security Metrics:")
    print(f"  GAR (Genuine Acceptance Rate) : {gar:.4f} ({gar*100:.1f}%)")
    print(f"  FAR (False Acceptance Rate)   : {far:.4f} ({far*100:.1f}%)")
    print(f"  FRR (False Rejection Rate)    : {frr:.4f} ({frr*100:.1f}%)")
    print(f"\nConfusion Matrix:")
    print(f"  TN = {tn:<4} | FP = {fp:<4}")
    print(f"  FN = {fn:<4} | TP = {tp:<4}")
    print(f"{'='*60}\n")

    # 7. Generate & Save Plots
    # A. Confusion Matrix Plot
    fig, ax = plt.subplots(figsize=(6, 5))
    im = ax.imshow(cm, interpolation="nearest", cmap=plt.cm.Blues)
    plt.colorbar(im)
    ax.set(
        xticks=[0, 1] if cm.shape[1] > 1 else [0],
        yticks=[0, 1] if cm.shape[0] > 1 else [0],
        xticklabels=["Impostor (0)", "Genuine (1)"][:cm.shape[1]],
        yticklabels=["Impostor (0)", "Genuine (1)"][:cm.shape[0]],
        title="Confusion Matrix — Physical Authentication",
        ylabel="True Label",
        xlabel="Predicted Label",
    )
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, str(cm[i, j]), ha="center", va="center", color="black", fontsize=14)
    plt.tight_layout()
    cm_path = os.path.join(reports_dir, "confusion_matrix.png")
    plt.savefig(cm_path, dpi=150)
    plt.close()

    # B. ROC Curve Plot
    if roc_auc is not None and len(np.unique(y)) > 1:
        fpr, tpr, _ = roc_curve(y, y_scores)
        fig, ax = plt.subplots(figsize=(7, 5))
        ax.plot(fpr, tpr, color="darkorange", lw=2, label=f"ROC Curve (AUC = {roc_auc:.3f})")
        ax.plot([0, 1], [0, 1], color="navy", lw=1, linestyle="--")
        ax.set(xlabel="False Positive Rate (FAR)", ylabel="True Positive Rate (GAR)", title="ROC Curve — Authentication")
        ax.legend(loc="lower right")
        plt.tight_layout()
        roc_path = os.path.join(reports_dir, "roc_curve.png")
        plt.savefig(roc_path, dpi=150)
        plt.close()

    # C. Feature Importance Plot
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        sorted_idx = np.argsort(importances)
        fig, ax = plt.subplots(figsize=(9, 5))
        ax.barh(range(len(sorted_idx)), importances[sorted_idx], color="teal")
        ax.set_yticks(range(len(sorted_idx)))
        ax.set_yticklabels([feature_names[i] for i in sorted_idx])
        ax.set_xlabel("Feature Importance")
        ax.set_title("Random Forest Authentication Feature Importances")
        plt.tight_layout()
        fi_path = os.path.join(reports_dir, "feature_importance.png")
        plt.savefig(fi_path, dpi=150)
        plt.close()

    # Save JSON Report
    json_path = os.path.join(reports_dir, "evaluation_report.json")
    save_json(eval_report, json_path)
    print(f"Saved evaluation report: {json_path}")
    print(f"Saved evaluation plots in: {reports_dir}\n")


if __name__ == "__main__":
    main()
