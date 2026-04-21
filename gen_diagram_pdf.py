from django.db.backends import ddl_references
from fpdf import FPDF

content = '''Diagramas - Workflow Python

1) Diagrama de Atividades

1.1) Cadastro e autenticação
- Usuário registra
- Usuário faz login
- Usuário faz logout
- Usuário atualiza perfil
- Usuário torna-se freelancer

1.2) Gestão de habilidades
- Criar habilidade
- Listar habilidades
- Atualizar habilidade
- Deletar habilidade
- Associar habilidade a usuário

1.3) Ordem de serviço (contratante)
- Criar ordem
- Listar ordens
- Visualizar detalhes
- Editar antes de aceitar
- Cancelar ordem

1.4) Candidatura do freelancer
- Freelancer visualiza ordens
- Freelancer candidata-se
- Freelancer cancela candidatura

1.5) Seleção e execução
- Contratante vê candidatos
- Contratante seleciona freelancer
- Ordem passa para em_andamento
- Conclusão de ordem

1.6) Diagrama de Atividades (Mermaid)
flowchart TD
  A[Início] --> B[Usuário acessa app]
  B --> C[Efetua login?]
  C -->|Não| D[Exibe tela de login/cadastro]
  C -->|Sim| E[Verifica usuário.freelancer]

  E -->|False| F[Perfil cliente/contratante]
  E -->|True| G[Perfil freelancer]

  subgraph Contratante
    F1[Ver ordens abertas] --> F2[Cria ordem de serviço]
    F2 --> F3[Define habilidades + valores]
    F3 --> F4[Publica ordem (status: aberta)]
    F4 --> F5[Visualiza candidatos]
    F5 --> F6[Seleciona freelancer]
    F6 --> F7[Ordem -> em_andamento]
    F7 --> F8[Marcar concluída / cancelar]
    F8 --> F9[Status: concluida/cancelada]
  end
  F --> F1

  subgraph Freelancer
    G1[Ver ordens abertas]
    G2[Candidatar-se a ordem]
    G3[Cancelar candidatura]
    G4[Se selecionado -> status: em_andamento]
    G5[Executar serviço e reportar]
    G6[Ordem concluída pelo contratante]
  end
  G --> G1
  G1 --> G2
  G2 --> G3
  G3 --> G1
  G2 --> G4
  G4 --> G5
  G5 --> G6

  F9 --> Z[Fim]
  G6 --> Z
  D --> Z

2) Diagrama de Caso de Uso (UML)

2.1) Atores
- Usuário: Pessoa que acessa o sistema
- Contratante: Usuário que cria ordens de serviço
- Freelancer: Usuário que executa serviços

2.2) Casos de Uso
- Registrar-se: Usuário cria uma conta
- Fazer Login: Usuário autentica-se no sistema
- Atualizar Perfil: Usuário modifica suas informações
- Tornar-se Freelancer: Usuário ativa perfil de freelancer
- Criar Ordem: Contratante publica uma nova ordem
- Listar Ordens: Usuário visualiza ordens disponíveis
- Candidatar-se a Ordem: Freelancer aplica para uma ordem
- Selecionar Freelancer: Contratante escolhe um candidato
- Executar Serviço: Freelancer realiza o trabalho
- Concluir Ordem: Contratante finaliza a ordem

2.3) Diagrama de Caso de Uso (Mermaid)
usecase "Registrar-se" as UC1
usecase "Fazer Login" as UC2
usecase "Atualizar Perfil" as UC3
usecase "Tornar-se Freelancer" as UC4
usecase "Criar Ordem" as UC5
usecase "Listar Ordens" as UC6
usecase "Candidatar-se a Ordem" as UC7
usecase "Selecionar Freelancer" as UC8
usecase "Executar Serviço" as UC9
usecase "Concluir Ordem" as UC10

actor "Usuário" as U
actor "Contratante" as C
actor "Freelancer" as F

U --> UC1
U --> UC2
U --> UC3
U --> UC4
U --> UC6

C --> UC5
C --> UC8
C --> UC10

F --> UC7
F --> UC9
'''

pdf = FPDF()
pdf.set_auto_page_break(auto=True, margin=15)
pdf.add_page()
pdf.set_font('Arial', 'B', 16)
pdf.cell(0, 10, 'Diagramas - Workflow Python', ln=True)
pdf.ln(5)
pdf.set_font('Arial', '', 12)
for line in content.splitlines():
    pdf.multi_cell(0, 8, line)

# Adicionar imagem do diagrama de atividades se existir
try:
    pdf.image('activity.png', x=10, y=None, w=180)
    pdf.ln(10)
except FileNotFoundError:
    pdf.cell(0, 10, 'Imagem do diagrama de atividades não encontrada.', ln=True)

output_path = 'diagramas_workflow_python.pdf'
pdf.output(output_path)
print(f'PDF criado em {output_path}')


