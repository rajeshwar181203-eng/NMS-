# Intelligent Network Change Impact and Incident Correlation System

## Project Overview
A web application designed to help network administrators investigate incidents by correlating network configuration changes, device events, network topology, and performance metrics.

## Problem Statement
Network incidents are often triggered by recent configuration changes, routing updates, or policy modifications. This system identifies potentially related changes and provides explainable troubleshooting recommendations.

## Features
- Dashboard with network health and incident overview
- Incident Timeline and Event Correlation
- Configuration Change Tracking
- Interactive Network Topology Visualization
- Explainable Recommendation Engine

## Technology Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts, React Flow
- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: SQLite (Production-ready design for PostgreSQL)
- **Data Processing**: Pandas, NetworkX

## Installation & Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Running the Demo
1. Start both backend and frontend servers.
2. Open the web app.
3. Click **Demo Incident** to view a pre-populated correlation scenario (INC-1024).
