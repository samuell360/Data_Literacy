# Codebase Cleanup & Optimization Guide

This repository includes scripts to detect unused and duplicate files and to help organize the project for production.

## Tools Added

- Frontend detector: `Stat Learning-frontend/frontend-cleanup-detector.ts`
  - Scans `src/` for potentially unused TS/TSX files and duplicates
  - Run: `cd "Stat Learning-frontend" && npx ts-node frontend-cleanup-detector.ts`

- Backend detector: `stats-learning-backend/backend-cleanup-detector.py`
  - Scans `app/` for potentially unused Python files and duplicates (AST-based)
  - Run: `cd stats-learning-backend && python backend-cleanup-detector.py`

- Master script (Windows): `master-cleanup.ps1`
  - Creates a backup zip
  - Runs both detectors and writes reports to the repo root

## Recommended Cleanup Workflow

1. Backup
   - Run `./master-cleanup.ps1` (PowerShell) to create a zip backup and generate reports

2. Review Reports
   - `frontend-cleanup-report.txt`
   - `backend-cleanup-report.txt`

3. Delete/Move
   - Manually remove truly unused files (verify with search and references)
   - Consolidate duplicates; update imports accordingly

4. Validate
   - Frontend: `npm run type-check`, `npm run build`
   - Backend: `python -m pytest`, start server

5. Document
   - Summarize deleted/moved files and reasons in your PR

Notes:
- Detectors are heuristic; always verify before deletion.
- Prefer consolidation over duplication for API clients, types, and utilities.


