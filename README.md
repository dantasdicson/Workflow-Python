# Workflow Python 🚀

Sistema de gerenciamento de serviços freelancers com Django REST Framework e Next.js.

![Django](https://img.shields.io/badge/Django-4.2-092E20?style=for-the-badge&logo=django&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.2.1-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-5.3.1-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

## 📋 Sobre o Projeto

Sistema completo para gerenciamento de ordens de serviço freelancers, permitindo:
- Cadastro de usuários (contratantes e freelancers)
- Criação e gestão de ordens de serviço
- Sistema de candidatura para freelancers
- Upload de imagens para ordens
- Autenticação JWT segura

## 🏗️ Estrutura do Projeto

```
Workflow-Python/
├── backend/                 # Django REST API
│   ├── manage.py           # Script de gerenciamento
│   ├── workflow/           # Configurações do projeto
│   ├── usuarios/           # App de usuários
│   ├── ordens/            # App de ordens de serviço
│   ├── freelancers/       # App de freelancers
│   ├── templates/         # Templates Django
│   ├── db.sqlite3         # Banco de dados
│   └── requirements.txt   # Dependências Python
│
├── frontend/               # Next.js Application
│   ├── pages/             # Páginas da aplicação
│   ├── components/        # Componentes React
│   ├── styles/           # Estilos CSS Modules
│   ├── lib/              # Utilitários e API
│   └── public/           # Arquivos estáticos
│
└── README_STRUCTURE.md    # Documentação detalhada
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Django 4.2** - Framework web Python
- **Django REST Framework 3.14.0** - API REST
- **django-cors-headers 4.0.0** - Configuração CORS
- **djangorestframework-simplejwt 5.3.1** - Autenticação JWT
- **SQLite** - Banco de dados

### Frontend
- **Next.js 16.2.1** - Framework React
- **React 19.2.4** - Biblioteca UI
- **CSS Modules** - Estilização
- **Formidable** - Upload de arquivos

## 🚀 Instalação e Execução

### Pré-requisitos
- Python 3.8+
- Node.js 18+
- npm ou yarn

### Backend (Django)

1. **Criar ambiente virtual:**
```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
```

2. **Instalar dependências:**
```bash
cd backend
pip install -r requirements.txt
```

3. **Executar migrações:**
```bash
python manage.py makemigrations
python manage.py migrate
```

4. **Criar superusuário (opcional):**
```bash
python manage.py createsuperuser
```

5. **Iniciar servidor:**
```bash
python manage.py runserver
```

### Frontend (Next.js)

1. **Instalar dependências:**
```bash
cd frontend
npm install
```

2. **Iniciar servidor de desenvolvimento:**
```bash
npm run dev
```

## 📱 Funcionalidades Implementadas

### ✅ Concluídas
- [x] Autenticação JWT com refresh tokens
- [x] CRUD de usuários (contratantes/freelancers)
- [x] CRUD de habilidades
- [x] CRUD de ordens de serviço
- [x] Upload de imagens para ordens
- [x] Sistema de candidatura para freelancers
- [x] Interface responsiva com Next.js
- [x] Listagem de ordens abertas
- [x] Página "Meus Serviços"
- [x] Página "Criar Serviço"
- [x] Filtragem por status
- [x] Validação de formulários

### 🚧 Em Progresso
- [ ] Sistema de mensagens entre contratante e freelancer
- [ ] Sistema de avaliação e feedback
- [ ] Integração com gateway de pagamento
- [ ] Notificações por email
- [ ] Dashboard administrativo

## 📡 APIs Disponíveis

### Autenticação
- `POST /api/auth/login/` - Login de usuário
- `POST /api/auth/refresh/` - Refresh token
- `GET /api/auth/me/` - Dados do usuário logado

### Usuários
- `GET /api/usuarios/` - Listar usuários
- `POST /api/usuarios/` - Criar usuário
- `GET /api/usuarios/{id}/` - Detalhes do usuário
- `PUT /api/usuarios/{id}/` - Atualizar usuário
- `DELETE /api/usuarios/{id}/` - Deletar usuário

### Habilidades
- `GET /api/habilidades/` - Listar habilidades
- `POST /api/habilidades/` - Criar habilidade
- `GET /api/habilidades/{id}/` - Detalhes da habilidade
- `PUT /api/habilidades/{id}/` - Atualizar habilidade
- `DELETE /api/habilidades/{id}/` - Deletar habilidade

### Ordens de Serviço
- `GET /api/ordens/` - Listar ordens (suporta filtros)
- `POST /api/ordens/` - Criar ordem (com upload de imagem)
- `GET /api/ordens/{id}/` - Detalhes da ordem
- `PUT /api/ordens/{id}/` - Atualizar ordem
- `DELETE /api/ordens/{id}/` - Deletar ordem

## 🔧 Configuração

### Variáveis de Ambiente (Backend)
```bash
# No arquivo workflow/settings.py
SECRET_KEY='sua-chave-secreta'
DEBUG=True
ALLOWED_HOSTS=['localhost', '127.0.0.1']
```

### Variáveis de Ambiente (Frontend)
```bash
# No arquivo .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📝 Exemplos de Uso

### Criar Ordem de Serviço
```javascript
const formData = new FormData();
formData.append('descricao_servico', 'Desenvolvimento de site');
formData.append('valor_estimado_minimo', '1000');
formData.append('valor_estimado_maximo', '2000');
formData.append('imagem', file);

const response = await fetch('/api/ordens', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Login de Usuário
```javascript
const response = await fetch('/api/auth/login/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    login: 'usuario',
    password: 'senha123'
  })
});
```

## 🧪 Testes

Para executar os testes (quando implementados):
```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm test
```

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Contato

Seu Nome - [@seu-twitter](https://twitter.com/seu-twitter) - seuemail@example.com

Link do Projeto: [https://github.com/seu-usuario/workflow-python](https://github.com/seu-usuario/workflow-python)