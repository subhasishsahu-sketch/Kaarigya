#!/usr/bin/env python3
"""
Kalakriti — Dataset Inspection CLI Script.

Loads the generated feature vectors (features.csv) and summarizes
dataset sizes, positive vs negative pair counts, split statistics,
and plots histograms showing feature distributions for genuine vs different pairs.
"""

import os
import sys
import argparse
import logging

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt

from src.utils import load_config, setup_directories, setup_logging


def parse_args():
    parser = argparse.ArgumentParser(
        description="Kalakriti — Inspect generated dataset statistics"
    )
    parser.add_argument(
        "--features", "-f",
        default="data/features/features.csv",
        help="Path to features.csv file (default: data/features/features.csv)"
    )
    parser.add_argument(
        "--config", "-c",
        default=None,
        help="Path to config.yaml file"
    )
    return parser.parse_args()


def main():
    args = parse_args()
    project_root = os.path.dirname(os.path.abspath(__file__))

    config = load_config(args.config)
    abs_paths = setup_directories(config, project_root)

    setup_logging(level=logging.INFO)

    csv_path = os.path.join(project_root, args.features)
    if not os.path.exists(csv_path):
        print(f"\n[ERROR] Dataset features file not found: {csv_path}")
        print("   Please run training or pair extraction first:")
        print("   python train.py --input data/raw")
        sys.exit(1)

    df = pd.read_csv(csv_path)

    # 1. Summarize stats
    total_pairs = len(df)
    n_pos = sum(df["label"] == 1)
    n_neg = sum(df["label"] == 0)

    print(f"\n{'='*60}")
    print("DATASET INSPECTION SUMMARY")
    print(f"{'='*60}")
    print(f"File Path: {csv_path}")
    print(f"Total Pairs: {total_pairs}")
    print(f"  Genuine (label=1)   : {n_pos} ({n_pos/total_pairs*100:.1f}%)")
    print(f"  Different (label=0) : {n_neg} ({n_neg/total_pairs*100:.1f}%)")
    print(f"{'-'*60}")

    # Feature statistics
    feature_cols = [
        col for col in df.columns
        if col not in ["pair_id", "reference_item_id", "verification_item_id", "label"]
    ]

    print("\nFeature Averages by Class:")
    print(f"{'Feature':<30} | {'Genuine (1)':^12} | {'Different (0)':^12}")
    print("-" * 62)
    for col in sorted(feature_cols):
        mean_pos = df[df["label"] == 1][col].mean()
        mean_neg = df[df["label"] == 0][col].mean()
        print(f"{col:<30} | {mean_pos:12.4f} | {mean_neg:12.4f}")
    print(f"{'='*60}\n")

    # 2. Plot Feature Distributions
    if total_pairs > 0:
        n_features = len(feature_cols)
        cols = 2
        rows = (n_features + 1) // 2

        fig, axes = plt.subplots(rows, cols, figsize=(14, 4 * rows))
        axes = axes.ravel()

        for idx, col in enumerate(sorted(feature_cols)):
            ax = axes[idx]
            pos_data = df[df["label"] == 1][col].dropna()
            neg_data = df[df["label"] == 0][col].dropna()

            # Plot overlapping histograms
            ax.hist(pos_data, bins=20, alpha=0.6, label="Genuine (1)", color="g")
            ax.hist(neg_data, bins=20, alpha=0.6, label="Different (0)", color="r")
            ax.set_title(f"Distribution of {col}")
            ax.set_xlabel("Value")
            ax.set_ylabel("Count")
            ax.legend(loc="upper right")

        # Hide any unused subplots
        for idx in range(len(feature_cols), len(axes)):
            fig.delaxes(axes[idx])

        plt.tight_layout()
        plot_path = os.path.join(abs_paths["reports"], "dataset_feature_distributions.png")
        plt.savefig(plot_path, dpi=150)
        plt.close()
        print(f"Saved distribution plot to: {plot_path}\n")


if __name__ == "__main__":
    main()
