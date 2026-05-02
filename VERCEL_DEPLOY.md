# Frontend no Vercel

Use o Vercel somente para o frontend Next.js.

## Configuracao do projeto

Ao importar o repositorio `Workflow-Python` no Vercel, configure:

```text
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Install Command: npm install
Output Directory: .next
```

Normalmente o Vercel detecta Next.js automaticamente depois que voce escolhe `frontend` como root.

## Variaveis de ambiente

Adicione em **Settings > Environment Variables**:

```text
NEXT_PUBLIC_API_BASE_URL=https://workflow-python-api.onrender.com
NODE_ENV=production
```

Depois clique em **Redeploy** para aplicar as variaveis.

## URL final

Depois do deploy, o Vercel vai gerar uma URL parecida com:

```text
https://workflow-python.vercel.app
```

Copie a URL real gerada pelo Vercel e coloque no backend do Render em:

```text
FRONTEND_BASE_URL=https://sua-url-real-do-vercel
```

# Backend no Render

Use o Render somente para o backend Django.

Configure o Web Service assim:

```text
Name: workflow-python-api
Runtime: Python
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: gunicorn workflow.wsgi:application
```

Se o servico foi criado manualmente no Render, use este Start Command para garantir que o banco SQLite receba as tabelas antes de iniciar:

```text
python manage.py migrate && gunicorn workflow.wsgi:application
```

Variaveis do backend:

```text
PYTHON_VERSION=3.12.10
DEBUG=False
SECRET_KEY=gere-uma-chave-grande
FRONTEND_BASE_URL=https://sua-url-real-do-vercel
DEFAULT_FROM_EMAIL=no-reply@workflow.local
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

Se usar Blueprint no Render, o arquivo `render.yaml` ja define o backend.
