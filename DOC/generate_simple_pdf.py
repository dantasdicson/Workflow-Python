#!/usr/bin/env python3
"""
Script simples para gerar PDF básico sem dependências externas
Usando HTML para PDF via conversão manual
"""

import os
import html

def create_simple_pdf():
    input_file = "ultimasAtualizacoesImplementadas.md"
    output_file = "ultimasAtualizacoesImplementadas.html"
    
    # Verificar se arquivo de entrada existe
    if not os.path.exists(input_file):
        print(f"Erro: Arquivo {input_file} não encontrado!")
        return
    
    # Ler conteúdo do arquivo markdown
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Converter markdown para HTML básico
    html_content = f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Últimas Atualizações Implementadas</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
        }}
        h1 {{
            color: #2E4057;
            text-align: center;
            border-bottom: 3px solid #048A81;
            padding-bottom: 10px;
            page-break-before: always;
        }}
        h2 {{
            color: #048A81;
            border-left: 4px solid #54C6EB;
            padding-left: 15px;
            margin-top: 30px;
        }}
        h3 {{
            color: #54C6EB;
            margin-top: 25px;
        }}
        ul {{
            margin: 10px 0;
            padding-left: 20px;
        }}
        li {{
            margin: 5px 0;
        }}
        .check {{
            color: #28a745;
            font-weight: bold;
        }}
        .cross {{
            color: #dc3545;
            font-weight: bold;
        }}
        .refresh {{
            color: #ffc107;
            font-weight: bold;
        }}
        .progress {{
            background: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }}
        .progress-bar {{
            background: #048A81;
            height: 20px;
            border-radius: 10px;
        }}
        .highlight {{
            background: #e8f4f8;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }}
        .footer {{
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            padding: 10px;
            background: #f8f9fa;
            border-top: 1px solid #dee2e6;
            font-size: 12px;
            color: #6c757d;
        }}
        .page-break {{
            page-break-before: always;
        }}
        @media print {{
            body {{ margin: 20px; }}
            .no-print {{ display: none; }}
        }}
    </style>
</head>
<body>
    <div class="no-print">
        <p style="text-align: center; background: #d4edda; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
            <strong>📄 Dica:</strong> Para salvar como PDF, pressione Ctrl+P ou Cmd+P e selecione "Salvar como PDF"
        </p>
    </div>
"""
    
    # Processar conteúdo markdown
    lines = content.split('\n')
    in_code_block = False
    
    for line in lines:
        line = line.strip()
        
        if not line:
            html_content += "<br>\n"
            continue
            
        # Blocos de código
        if line.startswith('```'):
            in_code_block = not in_code_block
            if in_code_block:
                html_content += '<pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">\n'
            else:
                html_content += '</pre>\n'
            continue
            
        if in_code_block:
            html_content += html.escape(line) + '\n'
            continue
            
        # Títulos
        if line.startswith('# '):
            title = line[2:].replace('**', '').replace('*', '')
            html_content += f'<h1>{title}</h1>\n'
        elif line.startswith('## '):
            subtitle = line[3:].replace('**', '').replace('*', '')
            html_content += f'<h2>{subtitle}</h2>\n'
        elif line.startswith('### '):
            header = line[4:].replace('**', '').replace('*', '')
            html_content += f'<h3>{header}</h3>\n'
            
        # Linhas separadoras
        elif line.startswith('---'):
            html_content += '<hr style="margin: 20px 0; border: 1px solid #dee2e6;">\n'
            
        # Listas com checkmarks
        elif line.startswith('- ✅'):
            item = line[4:].replace('**', '<strong>').replace('**', '</strong>')
            html_content += f'<ul><li><span class="check">✅</span> {item}</li></ul>\n'
        elif line.startswith('- ❌'):
            item = line[4:].replace('**', '<strong>').replace('**', '</strong>')
            html_content += f'<ul><li><span class="cross">❌</span> {item}</li></ul>\n'
        elif line.startswith('- 🔄'):
            item = line[4:].replace('**', '<strong>').replace('**', '</strong>')
            html_content += f'<ul><li><span class="refresh">🔄</span> {item}</li></ul>\n'
            
        # Listas normais
        elif line.startswith('- '):
            item = line[2:].replace('**', '<strong>').replace('**', '</strong>')
            html_content += f'<ul><li>{item}</li></ul>\n'
            
        # Barras de progresso (detectar padrão █████)
        elif '███' in line:
            html_content += f'<div class="progress">{line}</div>\n'
            
        # Texto em destaque
        elif line.startswith('**') and line.endswith('**'):
            text = line[2:-2]
            html_content += f'<div class="highlight"><strong>{text}</strong></div>\n'
            
        # Texto normal
        else:
            # Processar formatação básica
            formatted_line = line.replace('**', '<strong>').replace('**', '</strong>')
            formatted_line = formatted_line.replace('*', '<em>').replace('*', '</em>')
            
            # Verificar se é linha de informação
            if ':' in line and len(line) < 100:
                html_content += f'<p><strong>{formatted_line}</strong></p>\n'
            else:
                html_content += f'<p>{formatted_line}</p>\n'
    
    # Fechar HTML
    html_content += """
    <div class="footer">
        Workflow Python - Últimas Atualizações Implementadas | Gerado em 15/04/2026
    </div>
</body>
</html>
"""
    
    # Salvar arquivo HTML
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ Arquivo HTML gerado com sucesso: {output_file}")
    print(f"📁 Localização: {os.path.abspath(output_file)}")
    print(f"🖨️  Para converter para PDF: Abra o arquivo no navegador e pressione Ctrl+P → Salvar como PDF")

if __name__ == "__main__":
    create_simple_pdf()
