#!/usr/bin/env python3
"""
Script para converter o arquivo de atualizações para PDF
Requer: pip install reportlab markdown
"""

import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, blue
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
import markdown

def create_pdf():
    # Caminhos dos arquivos
    input_file = "ultimasAtualizacoesImplementadas.md"
    output_file = "ultimasAtualizacoesImplementadas.pdf"
    
    # Verificar se arquivo de entrada existe
    if not os.path.exists(input_file):
        print(f"Erro: Arquivo {input_file} não encontrado!")
        return
    
    # Ler conteúdo do arquivo markdown
    with open(input_file, 'r', encoding='utf-8') as f:
        markdown_content = f.read()
    
    # Converter markdown para HTML
    html_content = markdown.markdown(markdown_content, extensions=['tables', 'fenced_code'])
    
    # Criar PDF
    doc = SimpleDocTemplate(output_file, pagesize=A4)
    story = []
    
    # Estilos personalizados
    styles = getSampleStyleSheet()
    
    # Estilo para título principal
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        textColor=HexColor('#2E4057'),
        alignment=TA_CENTER,
        borderWidth=0,
        borderColor=HexColor('#2E4057')
    )
    
    # Estilo para subtítulos
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=18,
        spaceAfter=20,
        spaceBefore=20,
        textColor=HexColor('#048A81'),
        borderWidth=0
    )
    
    # Estilo para cabeçalhos
    header_style = ParagraphStyle(
        'CustomHeader',
        parent=styles['Heading3'],
        fontSize=14,
        spaceAfter=12,
        spaceBefore=15,
        textColor=HexColor('#54C6EB'),
        borderWidth=0
    )
    
    # Estilo para corpo do texto
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6,
        leading=14,
        alignment=TA_JUSTIFY,
        textColor=black
    )
    
    # Estilo para código
    code_style = ParagraphStyle(
        'CustomCode',
        parent=styles['Code'],
        fontSize=10,
        spaceAfter=6,
        leading=12,
        backgroundColor=HexColor('#F5F5F5'),
        borderColor=HexColor('#DDDDDD'),
        borderWidth=1,
        borderPadding=5
    )
    
    # Adicionar cabeçalho
    story.append(Paragraph("📊 RESUMO DAS ÚLTIMAS ATUALIZAÇÕES IMPLEMENTADAS", title_style))
    story.append(Spacer(1, 20))
    
    # Processar linhas do markdown
    lines = markdown_content.split('\n')
    current_section = ""
    
    for line in lines:
        line = line.strip()
        
        if not line:
            story.append(Spacer(1, 6))
            continue
            
        # Títulos principais (#)
        if line.startswith('# '):
            title = line[2:].replace('**', '').replace('*', '')
            story.append(PageBreak())
            story.append(Paragraph(title, title_style))
            
        # Subtítulos (##)
        elif line.startswith('## '):
            subtitle = line[3:].replace('**', '').replace('*', '')
            story.append(Paragraph(subtitle, subtitle_style))
            
        # Cabeçalhos (###)
        elif line.startswith('### '):
            header = line[4:].replace('**', '').replace('*', '')
            story.append(Paragraph(header, header_style))
            
        # Listas com checkmarks
        elif line.startswith('- ✅') or line.startswith('- ❌') or line.startswith('- 🔄'):
            # Remover marcadores e formatar
            clean_line = line.replace('- ✅', '✅').replace('- ❌', '❌').replace('- 🔄', '🔄')
            # Substituir negrito
            clean_line = clean_line.replace('**', '<b>').replace('**', '</b>')
            story.append(Paragraph(clean_line, body_style))
            
        # Listas normais
        elif line.startswith('- '):
            clean_line = line[2:]
            clean_line = clean_line.replace('**', '<b>').replace('**', '</b>')
            story.append(Paragraph(f"• {clean_line}", body_style))
            
        # Linhas de código
        elif line.startswith('```'):
            continue  # Ignorar blocos de código por enquanto
            
        # Linhas especiais (---)
        elif line.startswith('---'):
            story.append(Spacer(1, 10))
            continue
            
        # Texto normal
        else:
            # Processar formatação básica
            clean_line = line.replace('**', '<b>').replace('**', '</b>')
            clean_line = clean_line.replace('*', '<i>').replace('*', '</i>')
            
            # Verificar se é uma linha de informação (como "Projeto:", "Versão:")
            if ':' in line and len(line) < 100:
                story.append(Paragraph(clean_line, body_style))
            else:
                story.append(Paragraph(clean_line, body_style))
    
    # Função para adicionar rodapé
    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(HexColor('#666666'))
        canvas.drawString(inch, 0.75 * inch, f"Página {doc.page}")
        canvas.drawRightString(A4[0] - inch, 0.75 * inch, "Workflow Python - Atualizações Implementadas")
        canvas.restoreState()
    
    # Construir PDF
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    
    print(f"✅ PDF gerado com sucesso: {output_file}")
    print(f"📁 Localização: {os.path.abspath(output_file)}")

if __name__ == "__main__":
    try:
        create_pdf()
    except Exception as e:
        print(f"❌ Erro ao gerar PDF: {e}")
        print("💡 Instale as dependências com: pip install reportlab markdown")
