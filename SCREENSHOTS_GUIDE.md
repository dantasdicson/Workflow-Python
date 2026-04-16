# 📸 GUIA DE SCREENSHOTS PARA LINKEDIN

## 🎯 **OBJETIVO**
Capturar as telas mais importantes do sistema Workflow para divulgação profissional no LinkedIn

## 🚀 **PREPARAÇÃO DO AMBIENTE**

### 1. Verificar Servidores
- **Backend Django**: `python manage.py runserver` (porta 8000)
- **Frontend React**: `npm start` (porta 3000)
- **Acessar**: http://localhost:3000

### 2. Dados de Teste
- **Usuário**: Dock (ID: 20)
- **Senha**: (definida durante testes)
- **Ordens de serviço**: Criar algumas ordens para demonstração

## 📋 **LISTA DE SCREENSHOTS ESSENCIAIS**

### 🏠 **1. Página Inicial (Home)**
- **URL**: http://localhost:3000/
- **O que mostrar**: 
  - Design limpo e profissional
  - Navegação intuitiva
  - Call-to-action principal
- **Dica**: Capturar em tela cheia

### 📝 **2. Página de Login**
- **URL**: http://localhost:3000/login
- **O que mostrar**:
  - Formulário de autenticação
  - Design moderno
  - Link para cadastro
- **Dica**: Preencher com dados de teste

### 📋 **3. Listar Serviços**
- **URL**: http://localhost:3000/listar-servicos
- **O que mostrar**:
  - Lista de ordens disponíveis
  - Cards informativos
  - Sistema de filtros
  - Valores formatados (R$ 3.500,00)
- **Dica**: Ter várias ordens para mostrar variedade

### ➕ **4. Criar Nova Ordem**
- **URL**: http://localhost:3000/criar-ordem
- **O que mostrar**:
  - Formulário completo
  - Campos de valor monetário
  - Categorias de serviço
  - Interface amigável
- **Dica**: Preencher com dados realistas

### 🔍 **5. Detalhes da Ordem**
- **URL**: http://localhost:3000/detalhes/[ID]
- **O que mostrar**:
  - Informações completas
  - Botão "Candidatar-se"
  - Status da ordem
  - Informações do contratante
- **Dica**: Mostrar ordem com candidatos

### 👤 **6. Meus Serviços**
- **URL**: http://localhost:3000/meus-servicos
- **O que mostrar**:
  - Ordens do usuário logado
  - Botões de ação (Excluir, Editar)
  - Status das ordens
  - Dashboard pessoal
- **Dica**: Ter ordens em diferentes status

### 🎯 **7. Funcionalidade de Exclusão**
- **O que mostrar**:
  - Botão "Excluir" em ação
  - Confirmação de exclusão
  - Mensagem de sucesso
  - Atualização automática da lista
- **Dica**: Capturar o fluxo completo

### 📊 **8. Candidatura a Serviço**
- **O que mostrar**:
  - Botão "Candidatar-se"
  - Confirmação
  - Lista de candidatos
  - Status atualizado
- **Dica**: Mostrar freelancer se candidatando

## 🎨 **DICAS PARA SCREENSHOTS PROFISSIONAIS**

### Formato e Qualidade
- **Resolução**: 1920x1080 (Full HD)
- **Formato**: PNG (melhor qualidade)
- **Navegador**: Chrome/Edge em tela cheia (F11)
- **Zoom**: 100% (sem zoom)

### Melhores Práticas
1. **Limpar o navegador**: Fechar abas desnecessárias
2. **Dados consistentes**: Usar dados realistas nos formulários
3. **Estado ideal**: Mostrar o sistema com dados populados
4. **Sem erros**: Garantir que não há mensagens de erro visíveis
5. **Interface limpa**: Fechar dev tools (F12) antes de capturar

### Identidade Visual
- **Logo**: Garantir que o logo está visível
- **Cores**: Manter a paleta de cores consistente
- **Tipografia**: Verificar se textos estão legíveis
- **Layout**: Capturar layouts equilibrados

## 📁 **ORGANIZAÇÃO DOS ARQUIVOS**

### Estrutura de Pastas
```
screenshots/
├── home/
│   ├── home-page.png
│   └── home-navigation.png
├── auth/
│   ├── login-page.png
│   └── register-page.png
├── services/
│   ├── list-services.png
│   ├── service-details.png
│   └── create-order.png
├── user-dashboard/
│   ├── my-services.png
│   └── delete-flow.png
└── features/
    ├── apply-service.png
    └── candidate-list.png
```

### Nomenclatura
- Use nomes descritivos em inglês
- Inclua número sequencial se necessário
- Evite caracteres especiais
- Use hifens para separar palavras

## 🚀 **FLUXO DE CAPTURA**

### Passo a Passo
1. **Preparar ambiente**
   - Iniciar servidores
   - Limpar cache do navegador
   - Fazer login com usuário de teste

2. **Criar dados de demonstração**
   - Criar 3-4 ordens diferentes
   - Variar categorias e valores
   - Adicionar candidatos em algumas

3. **Capturar telas principais**
   - Home → Login → Listar → Criar → Detalhes
   - Meus Serviços → Excluir → Candidatar

4. **Validar qualidade**
   - Verificar resolução
   - Confirmar que não há erros
   - Testar fluxo completo

5. **Organizar arquivos**
   - Salvar na estrutura correta
   - Renomear arquivos
   - Backup das imagens

## 💡 **IDEIAS PARA POSTAGEM NO LINKEDIN**

### Texto Sugerido
```
🚀 Novo Projeto: Sistema de Workflow de Serviços!

Desenvolvi uma plataforma completa para gestão de ordens de serviço com:

✅ Frontend: React + TailwindCSS
✅ Backend: Django + Django REST Framework
✅ Features: CRUD completo, autenticação, candidaturas
✅ UI/UX: Design moderno e responsivo

O sistema permite:
• Criar e gerenciar ordens de serviço
• Freelancers se candidatarem a projetos
• Contratantes gerenciarem seus serviços
• Fluxo completo de aprovação

Tech stack utilizada:
- React.js com hooks modernos
- Django REST Framework para APIs
- PostgreSQL para dados
- TailwindCSS para estilização

#DesenvolvimentoWeb #React #Django #FullStack #Python #JavaScript #UIUX
```

### Formatos de Postagem
1. **Carrossel**: 5-7 imagens mostrando o fluxo
2. **Vídeo**: Screen recording do sistema em ação
3. **Single Post**: Melhor screenshot com destaque

## 🔧 **TROUBLESHOOTING**

### Problemas Comuns
- **Servidor não responde**: Verificar se ambos os servidores estão ativos
- **CSS não carrega**: Limpar cache do navegador
- **Dados não aparecem**: Verificar conexão com backend
- **Imagens cortadas**: Usar modo de tela cheia

### Soluções Rápidas
- Reiniciar servidores: `Ctrl+C` → `python manage.py runserver`
- Limpar cache: `Ctrl+Shift+R`
- Verificar console: F12 → Aba Console
- Testar API: http://localhost:8000/api/ordens/

---

## ✅ **CHECKLIST FINAL**

Antes de finalizar:
- [ ] Todos os servidores estão funcionando
- [ ] Dados de teste estão populados
- [ ] Screenshots capturados em alta qualidade
- [ ] Arquivos organizados corretamente
- [ ] Texto para LinkedIn preparado
- [ ] Sistema testado end-to-end

**Sucesso! 🎉**
