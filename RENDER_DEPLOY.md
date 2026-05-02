# Deploy no Render

Este projeto tem dois servicos:

- `workflow-python`: frontend Next.js, abre a pagina principal.
- `workflow-python-api`: backend Django REST API.

O arquivo `render.yaml` na raiz define os dois servicos para Blueprint do Render.

## Como aplicar

1. Envie este repositorio para o GitHub.
2. No Render, va em **Blueprints** e crie/sincronize um Blueprint apontando para este repo.
3. Confira se o servico `workflow-python` ficou com:
   - Runtime: Node
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start -- -p $PORT`
4. Confira se o servico `workflow-python-api` ficou com:
   - Runtime: Python
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Pre-Deploy Command: `python manage.py migrate`
   - Start Command: `python manage.py migrate && python inserir_categorias.py && python -m gunicorn workflow.wsgi:application`

## Importante sobre a URL atual

Para `https://workflow-python.onrender.com/` abrir a pagina do Next.js, o servico chamado `workflow-python` precisa ser o frontend.

Se o servico atual `workflow-python` foi criado como Python/Django, o Render nao permite trocar o runtime desse servico existente para Node via Blueprint. Nesse caso:

1. Renomeie ou remova o servico antigo no painel do Render.
2. Sincronize o Blueprint novamente.
3. Deixe o novo servico Node usar o nome `workflow-python`.

## Variaveis

Frontend:

```text
NEXT_PUBLIC_API_BASE_URL=https://workflow-python-api.onrender.com
```

Backend:

```text
FRONTEND_BASE_URL=https://workflow-python.onrender.com
DEBUG=False
```

Se o Render gerar outra URL para a API, atualize `NEXT_PUBLIC_API_BASE_URL` no servico frontend.
