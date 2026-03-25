#!/bin/bash
# Quiet Website - Tactical Deployment Script
# Purpose: Stage, commit, and push updates to h0tp-ftw.github.io.

PROJECT_DIR="/home/ubuntu/.openclaw/workspace/website_repo"
DATE=$(date +"%Y-%m-%d %H:%M:%S")

echo "[DEPLOY] Initializing tactical deployment: $DATE"

# Move to the root repository
cd "$PROJECT_DIR" || { echo "[ERROR] Failed to access repository root."; exit 1; }

# Ensure we're on the main branch
git checkout main

# Stage all changes (root + quiet subfolder)
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "[INFO] No changes detected. Deployment aborted."
else
    # Commit changes
    git commit -m "feat(quiet): nightly evolution $DATE"
    
    # Push to origin (h0tp-ftw.github.io)
    echo "[DEPLOY] Pushing to origin/main..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "[SUCCESS] Deployment complete. Evolution manifested at /quiet/."
    else
        echo "[ERROR] Deployment failed. Check network or permissions."
        exit 1
    fi
fi
