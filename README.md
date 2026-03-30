# Workflow - Sistema de Gerenciamento de Serviços

Migração do projeto Java/JSF para Python/Django.

## Setup

1. Criar ambiente virtual:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

2. Instalar dependências:
```bash
pip install -r requirements.txt
```

3. Executar migrações:
```bash
python manage.py makemigrations
python manage.py migrate
```

4. Iniciar servidor:
```bash
python manage.py runserver
```

## APIs Disponíveis

- `/api/habilidades/` - CRUD de Habilidades
- `/api/ordens/` - CRUD de Ordens de Serviço
- `/api/usuarios/` - CRUD de Usuários

## Próximos Passos

- Implementar autenticação JWT
- Criar frontend React
- Migrar dados do PostgreSQL
- Adicionar testes