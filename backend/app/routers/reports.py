"""
routers/reports.py
NDURANCE AI — PDF & CSV Report Generation Router
"""
import os
import csv
import io
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models import Session, Metric, Alert, Recommendation, AiSummary, Report
from app.reports.generator import generate_pdf, generate_csv
from app.utils.jwt_handler import get_current_user_id
from app.config import settings

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.post("/generate/{session_id}")
def generate_report(
    session_id: int,
    user_id: int = Depends(get_current_user_id),
    db: DBSession = Depends(get_db),
):
    """Generate PDF + CSV reports for a session."""
    session = db.query(Session).filter(
        Session.id == session_id,
        Session.user_id == user_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    from app.models import User as UserModel
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    metrics = db.query(Metric).filter(Metric.session_id == session_id).all()
    alerts = db.query(Alert).filter(Alert.session_id == session_id).all()
    recs = db.query(Recommendation).filter(
        Recommendation.session_id == session_id
    ).order_by(Recommendation.priority).all()
    ai_sum = db.query(AiSummary).filter(AiSummary.session_id == session_id).first()

    # ── Build report data dict ─────────────────────────────────────────
    report_data = {
        "session": session,
        "user": user,
        "metrics": metrics,
        "alerts": alerts,
        "recommendations": recs,
        "ai_summary": ai_sum.summary_text if ai_sum else "No AI summary available.",
    }

    # ── Generate PDF ──────────────────────────────────────────────────
    pdf_path = generate_pdf(report_data, session_id)

    # ── Generate CSV ──────────────────────────────────────────────────
    csv_path = generate_csv(report_data, session_id)

    # ── Save report record ─────────────────────────────────────────────
    existing_report = db.query(Report).filter(Report.session_id == session_id).first()
    if existing_report:
        existing_report.pdf_path = pdf_path
        existing_report.csv_path = csv_path
    else:
        db.add(Report(
            session_id=session_id,
            user_id=user_id,
            pdf_path=pdf_path,
            csv_path=csv_path,
        ))
    db.commit()

    return {
        "message": "Reports generated successfully.",
        "pdf_url": f"/api/reports/download/pdf/{session_id}",
        "csv_url": f"/api/reports/download/csv/{session_id}",
    }


@router.get("/download/pdf/{session_id}")
def download_pdf(
    session_id: int,
    user_id: int = Depends(get_current_user_id),
    db: DBSession = Depends(get_db),
):
    """Download PDF report for a session."""
    report = db.query(Report).filter(
        Report.session_id == session_id,
        Report.user_id == user_id,
    ).first()

    if not report or not report.pdf_path or not os.path.exists(report.pdf_path):
        raise HTTPException(status_code=404, detail="PDF report not found. Generate it first.")

    return FileResponse(
        path=report.pdf_path,
        media_type="application/pdf",
        filename=f"NDURANCE_AI_Report_{session_id}.pdf",
    )


@router.get("/download/csv/{session_id}")
def download_csv(
    session_id: int,
    user_id: int = Depends(get_current_user_id),
    db: DBSession = Depends(get_db),
):
    """Download CSV data export for a session."""
    report = db.query(Report).filter(
        Report.session_id == session_id,
        Report.user_id == user_id,
    ).first()

    if not report or not report.csv_path or not os.path.exists(report.csv_path):
        raise HTTPException(status_code=404, detail="CSV not found. Generate report first.")

    return FileResponse(
        path=report.csv_path,
        media_type="text/csv",
        filename=f"NDURANCE_AI_Data_{session_id}.csv",
    )
