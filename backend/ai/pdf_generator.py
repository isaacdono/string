import os
import logging
from typing import Dict, Any, List

logger = logging.getLogger("ai.pdf_generator")


def generate_blueprint_pdf(
    campaign_id: str,
    handle: str,
    title: str,
    subtitle: str,
    product_type: str,
    price: float,
    scarcity_limit: int,
    hooks: List[str],
    benefits: List[str],
    blueprint_content: str,
    primary_color: str = "#6366F1",
    output_dir: str = "/app/static/blueprints",
) -> str:
    """
    Generates an executive marketing roadmap PDF for the creator campaign.
    Returns the absolute path to the generated PDF.
    """
    os.makedirs(output_dir, exist_ok=True)
    pdf_path = os.path.join(output_dir, f"{campaign_id}.pdf")

    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate,
            Paragraph,
            Spacer,
            Table,
            TableStyle,
            HRFlowable,
        )
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_LEFT

        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=letter,
            leftMargin=50,
            rightMargin=50,
            topMargin=50,
            bottomMargin=50,
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#0F172A"),
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
            spaceAfter=6,
        )

        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor(primary_color),
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
            spaceAfter=18,
        )

        section_heading = ParagraphStyle(
            "SectionHeading",
            parent=styles["Heading2"],
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#0F172A"),
            fontName="Helvetica-Bold",
            spaceBefore=14,
            spaceAfter=6,
            keepWithNext=True,
        )

        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontSize=9.5,
            leading=14.5,
            textColor=colors.HexColor("#334155"),
            fontName="Helvetica",
            spaceAfter=4,
        )

        bullet_style = ParagraphStyle(
            "Bullet",
            parent=styles["Normal"],
            fontSize=9.5,
            leading=14.5,
            textColor=colors.HexColor("#334155"),
            fontName="Helvetica",
            leftIndent=12,
            spaceAfter=3,
        )

        table_label_style = ParagraphStyle(
            "TableLabel",
            parent=styles["Normal"],
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor("#475569"),
            fontName="Helvetica-Bold",
        )

        table_value_style = ParagraphStyle(
            "TableValue",
            parent=styles["Normal"],
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor("#0F172A"),
            fontName="Helvetica",
        )

        elements = []

        # Document Header
        elements.append(Paragraph("⚡ BYTEMEDIA • DOSSIÊ DE LANÇAMENTO", title_style))
        elements.append(Paragraph(f"Plano Executivo de Lançamento — Criador: <b>{handle}</b>", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=1.0, color=colors.HexColor(primary_color), spaceAfter=14))

        # Executive Summary Table
        table_data = [
            [
                Paragraph("Produto", table_label_style),
                Paragraph(title or "Drop Exclusivo", table_value_style),
            ],
            [
                Paragraph("Tipo de Entrega", table_label_style),
                Paragraph(product_type.capitalize() if product_type else "Digital", table_value_style),
            ],
            [
                Paragraph("Ticket Recomendado", table_label_style),
                Paragraph(f"R$ {price:.2f}", table_value_style),
            ],
            [
                Paragraph("Limite de Escassez", table_label_style),
                Paragraph(f"{scarcity_limit} unidades/vagas", table_value_style),
            ],
        ]

        summary_table = Table(table_data, colWidths=[130, 382])
        summary_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("LINEBELOW", (0, 0), (-1, -2), 0.5, colors.HexColor("#F1F5F9")),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ])
        )
        elements.append(summary_table)
        elements.append(Spacer(1, 12))

        # Value Proposition & Subtitle
        if subtitle:
            elements.append(Paragraph("📌 Proposta de Valor da Oferta", section_heading))
            elements.append(Paragraph(subtitle, body_style))

        # Hooks
        if hooks:
            elements.append(Paragraph("🎯 Ganchos de Atenção (Hooks de Conversão)", section_heading))
            for h in hooks:
                elements.append(Paragraph(f"• {h}", bullet_style))

        # Benefits
        if benefits:
            elements.append(Paragraph("💎 Benefícios Principais do Drop", section_heading))
            for b in benefits:
                elements.append(Paragraph(f"✓ {b}", bullet_style))

        # Marketing & Launch Roadmap
        if blueprint_content:
            elements.append(Paragraph("🚀 Estratégia de Marketing & Lançamento", section_heading))
            paragraphs = blueprint_content.strip().split("\n\n")
            for p in paragraphs:
                if p.strip():
                    elements.append(Paragraph(p.strip().replace("\n", "<br/>"), body_style))
                    elements.append(Spacer(1, 4))

        # Footer
        elements.append(Spacer(1, 15))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceAfter=6))
        footer_style = ParagraphStyle(
            "Footer",
            parent=styles["Normal"],
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#94A3B8"),
            fontName="Helvetica-Oblique",
            alignment=TA_CENTER,
        )
        elements.append(
            Paragraph(
                f"ByteMedia Drop Engine • Gerado com IA Generativa • ID: {campaign_id}",
                footer_style,
            )
        )

        doc.build(elements)
        logger.info(f"Blueprint PDF generated successfully at {pdf_path}")

    except Exception as e:
        logger.error(f"Error compiling PDF with ReportLab: {e}. Generating fallback document.")
        # Minimal valid PDF writer fallback
        with open(pdf_path, "wb") as f:
            header = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
            content = f"BYTEMEDIA BLUEPRINT - {handle}\nProduct: {title}\nPrice: R$ {price:.2f}\n\nRoadmap:\n{blueprint_content}".encode("utf-8")
            stream = b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
            stream += f"4 0 obj<</Length {len(content) + 50}>>stream\nBT /F1 12 Tf 50 720 Td ({title}) Tj ET\nendstream\nendobj\n".encode("utf-8")
            stream += b"5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n"
            xref = b"xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000224 00000 n \n0000000330 00000 n \n"
            trailer = b"trailer<</Size 6/Root 1 0 R>>\nstartxref\n400\n%%EOF"
            f.write(header + content + stream + xref + trailer)

    return pdf_path
