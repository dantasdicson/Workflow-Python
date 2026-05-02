# Backend no Render com PostgreSQL

Use o Render para o backend Django e para o banco PostgreSQL. O frontend Next.js fica no Vercel.

O arquivo `render.yaml` na raiz define:

- `workflow-python-api`: Web Service Python/Django.
- `workflow-python-db`: PostgreSQL usado pelo Django.

## Aplicando pelo Blueprint

1. Envie este repositorio para o GitHub.
2. No Render, va em **Blueprints** e crie/sincronize um Blueprint apontando para este repo.
3. Confira se foi criado o banco `workflow-python-db`.
4. Confira se o servico `workflow-python-api` ficou com:
   - Runtime: Python
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Pre-Deploy Command: `python manage.py migrate`
   - Start Command: `python manage.py migrate && python povoar_dados_demo.py && python -m gunicorn workflow.wsgi:application`
   - Environment Variable `DATABASE_URL` ligada ao banco `workflow-python-db`.

## Se criar manualmente

1. Crie um PostgreSQL no Render.
2. Copie a **Internal Database URL** do banco.
3. No Web Service `workflow-python-api`, adicione:

```text
DATABASE_URL=postgresql://...
```

4. Mantenha o Start Command:

```text
python manage.py migrate && python povoar_dados_demo.py && python -m gunicorn workflow.wsgi:application
```

5. Clique em **Manual Deploy > Clear build cache & deploy**.

## Variaveis

Backend:

```text
DATABASE_URL=<Internal Database URL do PostgreSQL do Render>
DATABASE_SSL_REQUIRE=False
FRONTEND_BASE_URL=https://workflow-python.vercel.app
DEBUG=False
```

## Observacao sobre dados

Ao trocar de SQLite para PostgreSQL, os dados do arquivo `db.sqlite3` nao migram automaticamente. O comando `povoar_dados_demo.py` cria categorias, usuarios e servicos de exemplo no PostgreSQL durante o deploy.

Para migrar dados reais do SQLite antigo, e necessario fazer um dump/load separado.
