# Workflow Python

Sistema web para gestao de ordens de servico entre contratantes e freelancers, com backend em Django REST Framework e frontend em Next.js.

![Django](https://img.shields.io/badge/Django-4.2-092E20?style=for-the-badge&logo=django&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.2.1-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-5.3.1-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

## Visao Geral

O projeto permite:

- cadastro e autenticacao de usuarios
- alternancia entre perfil de contratante e freelancer
- selecao de categorias de atuacao para freelancers
- criacao, listagem e exclusao de ordens de servico
- candidatura de freelancers em ordens abertas
- selecao de freelancer pelo contratante
- chat privado por ordem de servico
- upload de imagem nas ordens
- notificacoes ligadas a candidaturas, selecao e mensagens
- recuperacao e troca de senha

## Stack

### Backend

- Django 4.2
- Django REST Framework
- Simple JWT
- django-filter
- django-cors-headers
- SQLite

### Frontend

- Next.js 16
- React 19
- CSS Modules
- Formidable

## Estrutura

```text
Workflow-Python/
|-- backend/
|   |-- manage.py
|   |-- workflow/
|   |-- usuarios/
|   |-- ordens/
|   |-- templates/
|   `-- requirements.txt
|-- frontend/
|   |-- pages/
|   |-- components/
|   |-- lib/
|   |-- public/
|   `-- styles/
`-- README_STRUCTURE.md
```

## Funcionalidades Implementadas

### Autenticacao e conta

- login por `login + senha`
- JWT com refresh token
- cookies `httpOnly` para sessao no frontend
- endpoint de perfil do usuario autenticado
- troca de senha autenticada
- recuperacao de senha por email
- validacao de login unico, email unico e CPF unico

### Perfil de usuario

- cadastro de usuarios contratantes e freelancers
- atualizacao de perfil no "Meu Painel"
- exibicao do tipo da conta no painel
- alteracao do modo freelancer diretamente no painel
- selecao e persistencia de categorias ao ativar perfil freelancer
- obrigatoriedade de pelo menos 1 categoria para usuarios freelancer

### Categorias

- CRUD de categorias no backend
- listagem publica para uso em cadastro, painel e ordens

### Ordens de servico

- criacao de ordem autenticada
- contratante vinculado automaticamente ao usuario logado
- valores minimo e maximo estimados
- vinculo de categorias necessarias
- upload opcional de imagem
- status:
  - `aberta`
  - `em_execucao`
  - `concluido`
- listagem com filtros
- exclusao com regras de seguranca:
  - somente o contratante pode excluir
  - nao pode excluir se houver candidatos
  - nao pode excluir em execucao ou concluida

### Candidaturas

- freelancers podem se candidatar apenas em ordens abertas
- o contratante nao pode se candidatar na propria ordem
- limite de 7 candidatos por ordem
- notificacao para freelancer e contratante ao candidatar

### Selecao de freelancer

- o contratante pode escolher um freelancer candidato
- a selecao muda a ordem para `em_execucao`
- o freelancer escolhido vira `freelancer_selecionado`
- os demais candidatos recebem notificacao de encerramento da candidatura

### Chat por ordem de servico

- cada ordem possui conversas privadas por candidato
- durante a fase `aberta`, o contratante pode conversar separadamente com cada candidato
- ao mudar para `em_execucao`, apenas a conversa do freelancer selecionado continua ativa
- conversas dos nao selecionados ficam bloqueadas para novas mensagens
- leitura e envio de mensagens por conversa
- notificacao ao destinatario quando chega nova mensagem
- atualizacao do chat no frontend por polling

### Notificacoes

- notificacoes em candidatura
- notificacoes em selecao de freelancer
- notificacoes em novas mensagens do chat

### Frontend

- login, cadastro e recuperacao de senha
- listagem de servicos
- pagina "Criar Servico"
- pagina "Meus Servicos"
- pagina "Minhas Ordens"
- pagina "Meu Painel"
- pagina de detalhes da ordem com:
  - informacoes completas
  - lista de candidatos
  - selecao de freelancer
  - chat privado por ordem

## Regras de Negocio Importantes

- apenas usuarios autenticados podem criar ordens
- apenas freelancers podem se candidatar
- freelancer precisa ter ao menos 1 categoria
- apenas o contratante pode selecionar o freelancer da ordem
- apenas participantes da ordem podem acessar o chat
- apos a ordem entrar em execucao, apenas contratante e freelancer selecionado podem enviar mensagens

## Endpoints Gerais

Base do backend local:

```text
http://127.0.0.1:8000
```

### Autenticacao

- `POST /api/auth/login/`
  - autentica usuario
  - retorna access e refresh
  - grava cookies de sessao

- `POST /api/auth/refresh/`
  - renova o access token

- `GET /api/auth/me/`
  - retorna o usuario autenticado

- `PUT /api/auth/me/`
  - atualiza perfil do usuario autenticado
  - permite atualizar dados pessoais, `freelancer` e `categorias_ids`

- `POST /api/auth/change-password/`
  - altera senha do usuario autenticado

- `POST /api/auth/password-reset/`
  - envia email de redefinicao de senha

- `POST /api/auth/password-reset-confirm/`
  - confirma redefinicao de senha com `uid`, `token` e `password`

- `GET /api/test-auth/`
  - endpoint de teste de autenticacao

### Usuarios

- `GET /api/usuarios/`
  - lista usuarios

- `POST /api/usuarios/`
  - cria usuario

- `GET /api/usuarios/{id}/`
  - detalha usuario

- `PUT /api/usuarios/{id}/`
  - atualiza usuario

- `DELETE /api/usuarios/{id}/`
  - remove usuario

Campos principais de usuario:

- `login`
- `password`
- `nome`
- `sobre_nome`
- `email`
- `data_nascimento`
- `num_tel`
- `whatsapp`
- `cpf`
- `freelancer`
- `categorias_ids`

### Categorias

- `GET /api/categorias/`
  - lista categorias

- `POST /api/categorias/`
  - cria categoria

- `GET /api/categorias/{id}/`
  - detalha categoria

- `PUT /api/categorias/{id}/`
  - atualiza categoria

- `DELETE /api/categorias/{id}/`
  - remove categoria

### Ordens de servico

- `GET /api/ordens/`
  - lista ordens
  - suporta filtros

- `POST /api/ordens/`
  - cria ordem autenticada

- `GET /api/ordens/{id_os}/`
  - detalha ordem

- `PUT /api/ordens/{id_os}/`
  - atualiza ordem

- `DELETE /api/ordens/{id_os}/`
  - exclui ordem com validacoes de permissao e status

Campos principais da ordem:

- `descricao_servico`
- `valor_estimado_minimo`
- `valor_estimado_maximo`
- `status`
- `imagem`
- `categorias_necessarias_ids`
- `contratante_id`
- `freelancer_selecionado_id`

Filtros suportados em ordens:

- `contratante`
- `freelancer_selecionado`
- `status`
- `candidatos`

### Candidaturas e selecao

- `POST /api/ordens/{id_os}/candidatar/`
  - realiza candidatura do freelancer autenticado

- `POST /api/ordens/{id_os}/selecionar-freelancer/`
  - seleciona freelancer candidato
  - body:

```json
{
  "freelancer_id": 25
}
```

### Chat da ordem

- `GET /api/ordens/{id_os}/conversas/`
  - lista conversas disponiveis para o usuario autenticado

- `GET /api/ordens/{id_os}/conversas/{conversa_id}/mensagens/`
  - lista mensagens da conversa

- `POST /api/ordens/{id_os}/conversas/{conversa_id}/mensagens/`
  - envia mensagem na conversa
  - body:

```json
{
  "conteudo": "Mensagem privada entre contratante e freelancer"
}
```

## Endpoints Proxy no Frontend

O frontend possui rotas intermediarias para autenticar chamadas com cookies:

- `GET|POST /api/auth/me`
- `POST /api/auth/refresh`
- `GET /api/categorias`
- `GET|POST /api/ordens`
- `GET|POST|PUT|PATCH|DELETE /api/ordens-proxy?path=...`

Exemplos:

- `/api/ordens-proxy?path=28/`
- `/api/ordens-proxy?path=28/conversas/`
- `/api/ordens-proxy?path=28/conversas/1/mensagens/`

## Instalacao e Execucao

### Pre-requisitos

- Python 3.8+
- Node.js 18+
- npm

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Variaveis e Configuracao

### Backend

Configuracoes principais em `backend/workflow/settings.py`:

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `FRONTEND_BASE_URL`
- `DEFAULT_FROM_EMAIL`
- `EMAIL_BACKEND`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `EMAIL_USE_TLS`

### Frontend

Variavel usada pelos proxies:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Testes

### Backend

```bash
cd backend
python manage.py test
```

Atualmente ha testes implementados para:

- criacao de conversa ao candidatar
- bloqueio de chats nao selecionados
- permissao de mensagens apos selecao do freelancer

### Frontend

```bash
cd frontend
npm run lint
```

## Status Atual do Projeto

### Implementado

- autenticacao e sessao
- cadastro e edicao de perfil
- categorias para freelancers
- ordens de servico
- candidaturas
- selecao de freelancer
- chat privado por ordem
- notificacoes
- recuperacao de senha

### Ainda nao implementado

- dashboard administrativo
- sistema de avaliacao e feedback
- pagamentos
- notificacoes por email transacionais completas alem da redefinicao de senha
- websocket para chat em tempo real real-time; hoje o chat usa polling

## Licenca

Projeto sob licenca MIT.

## Contato

Dicson Dantas  
WhatsApp: [wa.me/5584996047536](https://wa.me/5584996047536)  
Email: dicsondantas@unigranrio.br

Repositorio:

https://github.com/dantasdicson/workflow-python
