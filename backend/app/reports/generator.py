"""NDURANCE AI — Report Generator
PDF and CSV export utilities for session analysis reports.
"""
import os
import csv
from datetime import datetime
from typing import Any

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER

from app.config import settings


def _make_styles():
    styles = getSampleStyleSheet()
    return {
        'h1': ParagraphStyle(
            'H1', parent=styles['Title'],
            fontSize=24, textColor=colors.HexColor('#00E5FF'),
            spaceAfter=10, alignment=TA_CENTER
        ),
        'h2': ParagraphStyle(
            'H2', parent=styles['Heading1'],
            fontSize=14, textColor=colors.HexColor('#00E5FF'),
            spaceBefore=12, spaceAfter=6
        ),
        'h3': ParagraphStyle(
            'H3', parent=styles['Heading2'],
            fontSize=11, textColor=colors.HexColor('#e2e8f0'),
            spaceBefore=8, spaceAfter=4
        ),
        'body': ParagraphStyle(
            'Body', parent=styles['Normal'],
            fontSize=10, leading=14, textColor=colors.HexColor('#111827')
        ),
        'label': ParagraphStyle(
            'Label', parent=styles['Normal'],
            fontSize=9, textColor=colors.HexColor('#64748b')
        ),
        'centered': ParagraphStyle(
            'Centered', parent=styles['Normal'],
            alignment=TA_CENTER, fontSize=10, textColor=colors.HexColor('#334155')
        ),
    }


def generate_pdf(data: dict, session_id: int) -> str:
    os.makedirs(settings.REPORTS_DIR, exist_ok=True)
    pdf_path = os.path.join(settings.REPORTS_DIR, f'report_{session_id}.pdf')

    session = data['session']
    user = data['user']
    metrics = data['metrics']
    alerts = data['alerts']
    recs = data['recommendations']
    ai_summary = data['ai_summary']

    styles = _make_styles()

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=20*mm, leftMargin=20*mm,
        topMargin=20*mm, bottomMargin=20*mm,
    )

    elements = [
        Spacer(1, 30*mm),
        Paragraph('NDURANCE AI', styles['h1']),
        Paragraph('Intelligent Human Motion Analysis Report', styles['centered']),
        Spacer(1, 10*mm),
        HRFlowable(width='100%', thickness=2, color=colors.HexColor('#00E5FF')),
        Spacer(1, 10*mm),
    ]

    user_name = getattr(user, 'name', 'Athlete') if user else 'Athlete'
    user_email = getattr(user, 'email', 'N/A') if user else 'N/A'
    height = getattr(user, 'height', 'N/A') if user else 'N/A'
    weight = getattr(user, 'weight', 'N/A') if user else 'N/A'
    exp = getattr(user, 'experience_level', 'N/A') if user else 'N/A'

    cover_data = [
        ['Athlete', user_name, 'Session ID', str(session_id)],
        ['Email', user_email, 'Activity', str(session.activity_type).title()],
        ['Height', f'{height} cm', 'Duration', f'{session.duration_seconds:.0f}s'],
        ['Weight', f'{weight} kg', 'Frames', str(session.frames_analyzed)],
        ['Experience', exp.title(), 'Date', str(session.created_at)[:16]],
        ['Overall Score', f'{session.overall_score:.1f}/100', 'Session Type', session.session_type.title()],
    ]

    cover_table = Table(cover_data, colWidths=[40*mm, 60*mm, 40*mm, 50*mm])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e0f7fa')),
        ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#e0f7fa')),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#7c3aed')),
        ('TEXTCOLOR', (2, 0), (2, -1), colors.HexColor('#7c3aed')),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#f1f5f9')]),
    ]))

    elements.extend([
        cover_table,
        PageBreak(),
        Paragraph('📊 Biomechanical Metrics', styles['h2']),
        HRFlowable(width='100%', thickness=1, color=colors.HexColor('#00E5FF')),
        Spacer(1, 4*mm),
    ])

    if metrics:
        metric_data = [['Metric', 'Value', 'Unit', 'Status']]
        for m in metrics:
            metric_data.append([
                m.metric_name.replace('_', ' ').replace('joint ', '').title(),
                f'{m.value:.2f}' if m.value is not None else 'N/A',
                m.unit or '—',
                (m.status or 'normal').title(),
            ])

        metric_table = Table(metric_data, colWidths=[80*mm, 40*mm, 30*mm, 40*mm])
        metric_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#00E5FF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0a0f1e')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (1, 0), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        elements.append(metric_table)
    else:
        elements.append(Paragraph('No metrics recorded for this session.', styles['body']))

    elements.extend([
        Spacer(1, 6*mm),
        Paragraph('⚠️ Session Alerts', styles['h2']),
        HRFlowable(width='100%', thickness=1, color=colors.HexColor('#f59e0b')),
        Spacer(1, 4*mm),
    ])

    if alerts:
        alert_data = [['Severity', 'Category', 'Message']]
        for a in alerts:
            alert_data.append([
                (a.severity or 'info').upper(),
                (a.category or 'general').title(),
                a.message,
            ])
        alert_table = Table(alert_data, colWidths=[25*mm, 35*mm, 130*mm])
        alert_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f59e0b')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('ROWBACKGROUNDS', (1, 0), (-1, -1), [colors.white, colors.HexColor('#fffbeb')]),
            ('WORDWRAP', (2, 1), (2, -1), True),
        ]))
        elements.append(alert_table)
    else:
        elements.append(Paragraph('✅ No significant form alerts recorded.', styles['body']))

    elements.extend([
        Spacer(1, 6*mm),
        Paragraph('🤖 AI Analysis & Findings', styles['h2']),
        HRFlowable(width='100%', thickness=1, color=colors.HexColor('#7c3aed')),
        Spacer(1, 4*mm),
        Paragraph(ai_summary, styles['body']),
    ])

    if recs:
        elements.extend([
            Spacer(1, 6*mm),
            Paragraph('💪 Personalized Recommendations', styles['h2']),
            HRFlowable(width='100%', thickness=1, color=colors.HexColor('#22c55e')),
            Spacer(1, 4*mm),
        ])

        for i, r in enumerate(recs, 1):
            elements.append(Paragraph(f'{i}. {r.title}', styles['h3']))
            elements.append(Paragraph(
                f'<b>Category:</b> {r.category.title()} | <b>Sets/Reps:</b> {r.sets_reps or "N/A"}',
                styles['label']
            ))
            elements.append(Paragraph(r.description, styles['body']))
            elements.append(Spacer(1, 3*mm))

    elements.extend([
        PageBreak(),
        Spacer(1, 80*mm),
        HRFlowable(width='100%', thickness=1, color=colors.HexColor('#00E5FF')),
        Spacer(1, 4*mm),
        Paragraph('Generated by NDURANCE AI — Intelligent Human Motion Analysis System', styles['centered']),
        Paragraph(f'Report Date: {datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")}', styles['centered']),
    ])

    doc.build(elements)
    return pdf_path


def generate_csv(data: dict, session_id: int) -> str:
    os.makedirs(settings.REPORTS_DIR, exist_ok=True)
    csv_path = os.path.join(settings.REPORTS_DIR, f'report_{session_id}.csv')

    session = data['session']
    metrics = data['metrics']
    alerts = data['alerts']
    recs = data['recommendations']

    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['NDURANCE AI — Session Export'])
        writer.writerow(['Session ID', session_id])
        writer.writerow(['Activity', session.activity_type])
        writer.writerow(['Duration (s)', session.duration_seconds])
        writer.writerow(['Overall Score', session.overall_score])
        writer.writerow(['Created At', str(session.created_at)])
        writer.writerow([])
        writer.writerow(['=== METRICS ==='])
        writer.writerow(['Metric Name', 'Value', 'Unit', 'Status'])
        for m in metrics:
            writer.writerow([m.metric_name, m.value, m.unit or '', m.status or ''])
        writer.writerow([])
        writer.writerow(['=== ALERTS ==='])
        writer.writerow(['Severity', 'Category', 'Message', 'Joint'])
        for a in alerts:
            writer.writerow([a.severity, a.category or '', a.message, a.joint or ''])
        writer.writerow([])
        writer.writerow(['=== RECOMMENDATIONS ==='])
        writer.writerow(['Priority', 'Title', 'Category', 'Sets/Reps', 'Description'])
        for r in recs:
            writer.writerow([r.priority, r.title, r.category, r.sets_reps or '', r.description])

    return csv_path
