# Workflow Python - Estrutura do Projeto

## 📁 Estrutura de Pastas

```
Workflow-Python/
├── backend/                 # Django Backend
│   ├── manage.py           # Script de gerenciamento Django
│   ├── workflow/           # Configurações do projeto Django
│   ├── usuarios/           # App de usuários
│   ├── ordens/            # App de ordens de serviço
│   ├── freelancers/       # App de freelancers
│   ├── templates/         # Templates Django
│   ├── db.sqlite3         # Banco de dados SQLite
│   └── requirements.txt   # Dependências Python
│
├── frontend/               # Next.js Frontend
│   ├── pages/             # Páginas Next.js
│   ├── components/        # Componentes React
│   ├── styles/           # Estilos CSS Modules
│   ├── lib/              # Utilitários e API
│   ├── public/           # Arquivos estáticos
│   └── package.json      # Dependências Node.js
│
├── .venv/                 # Ambiente virtual Python
├── .git/                 # Controle de versão
├── .vscode/              # Configurações VS Code
├── .windsurf/            # Configurações Windsurf
├── DOC/                  # Documentação
└── tools/                # Scripts e utilitários
```

## 🚀 Como Executar

### Backend (Django)
```bash
cd backend
python manage.py runserver
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

## 📝 Observações

- O backend Django está na pasta `/backend`
- O frontend Next.js está na pasta `/frontend`
- Ambos podem ser executados independentemente
- O frontend se comunica com o backend via API REST
