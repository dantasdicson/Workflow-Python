from datetime import datetime
from pathlib import Path
import textwrap

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
PDF_PATH = ROOT / "urlResum.pdf"

PAGE_W, PAGE_H = 1240, 1754  # A4 at roughly 150 DPI
MARGIN = 70
LINE = 28


def font(size=24, bold=False):
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


F_TITLE = font(44, True)
F_H1 = font(32, True)
F_H2 = font(25, True)
F_BODY = font(22)
F_SMALL = font(18)
F_MONO = font(18)


def wrap_text(text, chars=88):
    lines = []
    for raw in str(text).splitlines():
        if not raw:
            lines.append("")
            continue
        lines.extend(textwrap.wrap(raw, width=chars, break_long_words=False, replace_whitespace=False))
    return lines


class PdfBuilder:
    def __init__(self):
        self.pages = []
        self.new_page()

    def new_page(self):
        img = Image.new("RGB", (PAGE_W, PAGE_H), "#f8fafc")
        self.draw = ImageDraw.Draw(img)
        self.y = MARGIN
        self.pages.append(img)
        self.draw.rectangle([0, 0, PAGE_W, 24], fill="#0f766e")
        self.draw.rectangle([0, PAGE_H - 24, PAGE_W, PAGE_H], fill="#0f766e")
        return img

    def ensure(self, needed):
        if self.y + needed > PAGE_H - MARGIN:
            self.new_page()

    def title(self, text):
        self.ensure(100)
        self.draw.text((MARGIN, self.y), text, fill="#0f172a", font=F_TITLE)
        self.y += 70

    def h1(self, text):
        self.ensure(62)
        self.draw.text((MARGIN, self.y), text, fill="#0f766e", font=F_H1)
        self.y += 46

    def h2(self, text):
        self.ensure(52)
        self.draw.text((MARGIN, self.y), text, fill="#1e293b", font=F_H2)
        self.y += 38

    def paragraph(self, text, chars=92):
        lines = wrap_text(text, chars)
        self.ensure(len(lines) * LINE + 12)
        for line in lines:
            self.draw.text((MARGIN, self.y), line, fill="#334155", font=F_BODY)
            self.y += LINE
        self.y += 10

    def bullet(self, text, chars=88):
        lines = wrap_text(text, chars)
        self.ensure(len(lines) * LINE + 8)
        for i, line in enumerate(lines):
            prefix = "- " if i == 0 else "  "
            self.draw.text((MARGIN + 18, self.y), prefix + line, fill="#334155", font=F_BODY)
            self.y += LINE
        self.y += 4

    def code(self, text, chars=104):
        lines = wrap_text(text, chars)
        h = len(lines) * 24 + 24
        self.ensure(h)
        self.draw.rounded_rectangle([MARGIN, self.y, PAGE_W - MARGIN, self.y + h], radius=8, fill="#e2e8f0")
        yy = self.y + 12
        for line in lines:
            self.draw.text((MARGIN + 18, yy), line, fill="#0f172a", font=F_MONO)
            yy += 24
        self.y += h + 16

    def table(self, rows, col_widths, header=True):
        x0 = MARGIN
        row_pad = 10
        for idx, row in enumerate(rows):
            wrapped_cols = [wrap_text(cell, max(16, int(w / 11))) for cell, w in zip(row, col_widths)]
            row_h = max(len(col) for col in wrapped_cols) * 23 + row_pad * 2
            self.ensure(row_h + 2)
            bg = "#ccfbf1" if idx == 0 and header else ("#ffffff" if idx % 2 else "#f1f5f9")
            self.draw.rectangle([x0, self.y, x0 + sum(col_widths), self.y + row_h], fill=bg, outline="#cbd5e1")
            x = x0
            for col_idx, (lines, w) in enumerate(zip(wrapped_cols, col_widths)):
                self.draw.line([x, self.y, x, self.y + row_h], fill="#cbd5e1")
                yy = self.y + row_pad
                f = F_SMALL if idx > 0 else font(18, True)
                for line in lines:
                    self.draw.text((x + 8, yy), line, fill="#0f172a", font=f)
                    yy += 23
                x += w
            self.draw.line([x, self.y, x, self.y + row_h], fill="#cbd5e1")
            self.y += row_h
        self.y += 18

    def image(self, path, title=None):
        if title:
            self.h2(title)
        img = Image.open(path).convert("RGB")
        max_w = PAGE_W - 2 * MARGIN
        scale = min(1, max_w / img.width)
        new_size = (int(img.width * scale), int(img.height * scale))
        img = img.resize(new_size)
        self.ensure(img.height + 20)
        self.pages[-1].paste(img, (MARGIN, self.y))
        self.y += img.height + 24

    def save(self):
        pdf_pages = [page.convert("P", palette=Image.Palette.ADAPTIVE, colors=256) for page in self.pages]
        pdf_pages[0].save(PDF_PATH, save_all=True, append_images=pdf_pages[1:], resolution=150)


def flowchart(path, title, nodes, edges):
    w, h = 1500, 900
    img = Image.new("RGB", (w, h), "#f8fafc")
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w, 70], fill="#0f766e")
    d.text((40, 18), title, fill="white", font=font(30, True))
    box = {}
    for key, label, x, y, bw, bh, color in nodes:
        box[key] = (x, y, x + bw, y + bh)
        d.rounded_rectangle(box[key], radius=14, fill=color, outline="#0f172a", width=2)
        lines = wrap_text(label, int(bw / 13))
        yy = y + 16
        for line in lines:
            tw = d.textlength(line, font=F_SMALL)
            d.text((x + (bw - tw) / 2, yy), line, fill="#0f172a", font=F_SMALL)
            yy += 23
    for source, target, label in edges:
        sx1, sy1, sx2, sy2 = box[source]
        tx1, ty1, tx2, ty2 = box[target]
        start = (sx2, (sy1 + sy2) // 2)
        end = (tx1, (ty1 + ty2) // 2)
        if tx1 < sx1:
            start = ((sx1 + sx2) // 2, sy2)
            end = ((tx1 + tx2) // 2, ty1)
        d.line([start, end], fill="#334155", width=4)
        arrow = [(end[0] - 12, end[1] - 8), end, (end[0] - 12, end[1] + 8)]
        if tx1 < sx1:
            arrow = [(end[0] - 8, end[1] - 12), end, (end[0] + 8, end[1] - 12)]
        d.line(arrow, fill="#334155", width=4)
        if label:
            mid = ((start[0] + end[0]) // 2, (start[1] + end[1]) // 2 - 24)
            d.rounded_rectangle([mid[0] - 110, mid[1] - 4, mid[0] + 110, mid[1] + 28], radius=6, fill="#ffffff", outline="#cbd5e1")
            tw = d.textlength(label, font=F_SMALL)
            d.text((mid[0] - tw / 2, mid[1]), label, fill="#0f172a", font=F_SMALL)
    img.save(path)


def create_flowcharts():
    auth = ROOT / "urlResum_fluxo_autenticacao.png"
    reset = ROOT / "urlResum_fluxo_senha.png"
    services = ROOT / "urlResum_fluxo_servicos.png"

    flowchart(
        auth,
        "Fluxo de autenticação e sessão",
        [
            ("login_page", "Usuário acessa /login", 60, 160, 260, 95, "#dbeafe"),
            ("next_login", "POST /api/auth/login\nNext proxy", 390, 160, 280, 95, "#cffafe"),
            ("jwt", "POST /api/auth/login/\nDjango SimpleJWT custom", 740, 160, 310, 95, "#dcfce7"),
            ("cookies", "Cookies wf_access\nwf_refresh", 1120, 160, 280, 95, "#fef3c7"),
            ("protected", "Páginas protegidas\n/meuPainel, /ordens", 390, 420, 310, 100, "#e0e7ff"),
            ("me", "GET /api/auth/me\nvalida usuário", 760, 420, 280, 100, "#dcfce7"),
            ("refresh", "POST /api/auth/refresh\nrenova access", 1120, 420, 280, 100, "#fef3c7"),
        ],
        [
            ("login_page", "next_login", "credenciais"),
            ("next_login", "jwt", "proxy"),
            ("jwt", "cookies", "tokens"),
            ("cookies", "protected", "navegação"),
            ("protected", "me", "validação"),
            ("me", "refresh", "se access expirar"),
        ],
    )

    flowchart(
        reset,
        "Fluxo de esqueci senha e troca autenticada",
        [
            ("forgot", "/esqueciSenha\nemail ou login", 60, 150, 260, 100, "#dbeafe"),
            ("request", "POST /api/auth/password-reset", 380, 150, 320, 100, "#cffafe"),
            ("email", "Django envia email\ncom link /novaSenha", 760, 150, 310, 100, "#dcfce7"),
            ("token", "/novaSenha?uid&token", 1130, 150, 280, 100, "#fef3c7"),
            ("panel", "/meuPainel\nTrocar senha", 60, 460, 260, 100, "#e0e7ff"),
            ("auth_change", "/novaSenha?trocarSenha=1", 380, 460, 320, 100, "#cffafe"),
            ("change_api", "POST /api/auth/change-password", 760, 460, 310, 100, "#dcfce7"),
            ("done", "Senha salva\nhash no banco", 1130, 460, 280, 100, "#fef3c7"),
        ],
        [
            ("forgot", "request", "solicita"),
            ("request", "email", "se encontrado"),
            ("email", "token", "link"),
            ("token", "done", "confirma"),
            ("panel", "auth_change", "redireciona"),
            ("auth_change", "change_api", "logado"),
            ("change_api", "done", "valida"),
        ],
    )

    flowchart(
        services,
        "Fluxo de ordens de serviço",
        [
            ("list", "/listarServicos\nGET status=aberta", 60, 160, 300, 100, "#dbeafe"),
            ("create", "/criarServico\nPOST /api/ordens/", 430, 160, 300, 100, "#cffafe"),
            ("detail", "/detalhesOrdem\nGET /api/ordens/{id}/", 800, 160, 320, 100, "#dcfce7"),
            ("candidate", "POST /api/ordens/{id}/candidatar/", 800, 430, 320, 100, "#fef3c7"),
            ("mine", "/minhasOrdens\ncontratante/freelancer/candidato", 60, 430, 330, 100, "#e0e7ff"),
            ("owner", "/meusServicos\nGET/DELETE ordens", 430, 430, 300, 100, "#cffafe"),
        ],
        [
            ("list", "detail", "abre"),
            ("create", "detail", "cria"),
            ("detail", "candidate", "candidatura"),
            ("mine", "detail", "consulta"),
            ("owner", "detail", "gerencia"),
        ],
    )
    return [auth, reset, services]


def build_pdf(flowcharts):
    b = PdfBuilder()
    b.title("urlResum")
    b.paragraph("Resumo detalhado de URLs, endpoints, rotas e fluxos do projeto WorkFlow. Documento gerado em "
                f"{datetime.now().strftime('%d/%m/%Y %H:%M')}.")
    b.code("Frontend local: http://localhost:3000\nBackend local:  http://127.0.0.1:8000\nRegra atual: / retorna 404; a página inicial pública é /index.")

    b.h1("1. Visão Geral")
    for item in [
        "Frontend usa Next.js Pages Router. Arquivos em frontend/pages viram rotas automaticamente.",
        "Backend usa Django REST Framework com DefaultRouter para usuarios, categorias e ordens.",
        "Autenticação principal usa JWT SimpleJWT com cookies wf_access e wf_refresh.",
        "Algumas páginas ainda chamam endpoints backend diretos em 127.0.0.1:8000; outras usam proxies em /api/* do Next.",
        "Login e CPF não devem ser alterados pelo usuário no Meu Painel. O backend ignora esses campos no PUT /api/auth/me/.",
    ]:
        b.bullet(item)

    b.h1("2. Rotas Frontend")
    frontend_rows = [
        ("Rota", "Arquivo", "Objetivo", "Autenticação"),
        ("/", "proxy.js", "Retorna 404 por regra do projeto.", "Pública"),
        ("/index", "pages/index.jsx", "Página inicial. /index é reescrita internamente para /.", "Pública, com itens condicionais ao login"),
        ("/login", "pages/login.jsx", "Login com login/senha, mensagens separadas para login inexistente e senha inválida.", "Pública"),
        ("/cadastrarUser", "pages/cadastrarUser.jsx", "Cadastro de usuário. Valida CPF e login case-insensitive.", "Pública"),
        ("/esqueciSenha", "pages/esqueciSenha.jsx", "Solicita email de reset usando email ou login.", "Pública"),
        ("/novaSenha?uid&token", "pages/novaSenha.jsx", "Define nova senha a partir do link enviado por email.", "Pública com token"),
        ("/novaSenha?trocarSenha=1", "pages/novaSenha.jsx", "Troca senha do usuário logado vindo do Meu Painel.", "Logado"),
        ("/redefinirSenha", "pages/redefinirSenha.jsx", "Rota legada de redirecionamento para novaSenha.", "Pública"),
        ("/meuPainel", "pages/meuPainel.jsx", "Carrega e edita dados do usuário. Login e CPF bloqueados.", "Logado"),
        ("/listarServicos", "pages/listarServicos.jsx", "Lista ordens abertas.", "Logado"),
        ("/criarServico", "pages/criarServico.jsx", "Criação de ordem de serviço.", "Logado"),
        ("/detalhesOrdem?id=<id>", "pages/detalhesOrdem.jsx", "Detalhe da ordem e candidatura.", "Logado"),
        ("/meusServicos", "pages/meusServicos.jsx", "Serviços criados pelo usuário e exclusão.", "Logado"),
        ("/minhasOrdens", "pages/minhasOrdens.jsx", "Ordens como contratante, freelancer ou candidato.", "Logado"),
        ("/quemSomos", "pages/quemSomos.jsx", "Página institucional.", "Pública"),
    ]
    b.table(frontend_rows, [210, 240, 470, 180])

    b.h1("3. APIs Next.js")
    next_rows = [
        ("Rota Next", "Métodos", "Destino backend", "Observações"),
        ("/api/auth/login", "POST", "/api/auth/login/", "Envia login e password. Seta wf_access e wf_refresh."),
        ("/api/auth/refresh", "POST", "/api/auth/refresh/", "Usa cookie wf_refresh para renovar access."),
        ("/api/auth/logout", "POST", "local", "Remove cookies wf_access e wf_refresh."),
        ("/api/auth/me", "GET, PUT", "/api/auth/me/", "GET dados do logado; PUT salva dados editáveis."),
        ("/api/auth/change-password", "POST", "/api/auth/change-password/", "Troca senha do usuário autenticado."),
        ("/api/auth/password-reset", "POST", "/api/auth/password-reset/", "Solicita envio de email com link de reset."),
        ("/api/auth/password-reset-confirm", "POST", "/api/auth/password-reset-confirm/", "Confirma reset via uid/token."),
        ("/api/usuarios", "POST", "/api/usuarios/", "Cadastro público de usuário."),
        ("/api/categorias", "GET", "/api/categorias/", "Lista categorias."),
        ("/api/ordens", "GET, POST", "/api/ordens/", "Proxy autenticado; repassa filtros query string."),
        ("/api/habilidades", "GET", "/api/habilidades/", "Legado: não há rota backend atual registrada para habilidades."),
    ]
    b.table(next_rows, [270, 110, 270, 450])

    b.h1("4. Endpoints Backend")
    b.h2("Autenticação")
    auth_rows = [
        ("Endpoint", "Método", "Entrada", "Retorno / regra"),
        ("/api/auth/login/", "POST", "login, password", "200 com access/refresh e cookies. 404 login não encontrado. 401 senha inválida."),
        ("/api/auth/refresh/", "POST", "refresh no body ou cookie", "200 com novo access e cookie wf_access."),
        ("/api/auth/me/", "GET", "Bearer JWT", "Dados do usuário logado."),
        ("/api/auth/me/", "PUT", "nome, sobre_nome, email, data_nascimento, num_tel, whatsapp", "Atualiza dados. Ignora login e cpf."),
        ("/api/auth/change-password/", "POST", "password", "Troca senha do usuário autenticado."),
        ("/api/auth/password-reset/", "POST", "login ou email", "Envia email e retorna mensagem com email mascarado."),
        ("/api/auth/password-reset-confirm/", "POST", "uid, token, password", "Valida token e grava nova senha."),
        ("/api/test-auth/", "GET", "Bearer JWT opcional", "Endpoint de diagnóstico de autenticação."),
    ]
    b.table(auth_rows, [270, 90, 300, 440])

    b.h2("ViewSets DRF")
    backend_rows = [
        ("Endpoint", "Métodos", "Recurso", "Notas"),
        ("/api/usuarios/", "GET, POST", "Usuários", "Lista sem paginação; POST cria usuário. Login validado sem case-sensitive."),
        ("/api/usuarios/{id}/", "GET, PUT, PATCH, DELETE", "Usuário específico", "Edição/exclusão exigem autenticação pelo ViewSet."),
        ("/api/categorias/", "GET, POST", "Categorias", "GET público. Escrita autenticada."),
        ("/api/categorias/{id}/", "GET, PUT, PATCH, DELETE", "Categoria específica", "GET público. Escrita autenticada."),
        ("/api/ordens/", "GET, POST", "Ordens de serviço", "GET aceita filtros; POST cria ordem."),
        ("/api/ordens/{id_os}/", "GET, PUT, PATCH, DELETE", "Ordem específica", "lookup_field=id_os."),
        ("/api/ordens/{id_os}/candidatar/", "POST", "Candidatura", "Adiciona freelancer à ordem; limite de 7 candidatos."),
        ("/admin/", "GET", "Django Admin", "Administração do Django."),
        ("/api-auth/", "GET/POST", "DRF login web", "Interface de login/logout do DRF."),
    ]
    b.table(backend_rows, [280, 160, 230, 430])

    b.h1("5. Parâmetros e Campos")
    b.h2("Filtros de ordens")
    for item in [
        "status: aberta, em_execucao ou concluido. Exemplo: /api/ordens/?status=aberta",
        "contratante: id_usuario do contratante. Exemplo: /api/ordens/?contratante=15",
        "freelancer_selecionado: id_usuario do freelancer selecionado.",
        "candidatos: id_usuario que aparece em freelancers_candidatos.",
    ]:
        b.bullet(item)
    b.h2("Campos principais de usuário")
    b.code("id_usuario, login, nome, sobre_nome, email, data_nascimento, num_tel, whatsapp, cpf, freelancer, categorias, categorias_ids, data_criacao")
    b.h2("Campos principais de ordem")
    b.code("id_os, descricao_servico, valor_estimado_minimo, valor_estimado_maximo, status, data_criacao, data_conclusao, imagem, contratante, freelancer_selecionado, freelancers_candidatos, categorias_necessarias")

    b.h1("6. Regras Relevantes")
    for item in [
        "Login não é case-sensitive para criação/manipulação. Há constraint no banco em Lower(login): uniq_usuario_login_ci.",
        "CPF é normalizado para dígitos e validado no serializer de usuário.",
        "Se o usuário for freelancer, deve selecionar pelo menos uma categoria no cadastro.",
        "Reset de senha por email usa SMTP configurado no backend/.env. A mensagem do frontend exibe o email mascarado.",
        "Troca de senha pelo Meu Painel usa /novaSenha?trocarSenha=1 e exige usuário autenticado.",
        "A página inicial correta do projeto é /index. O caminho / foi bloqueado para retornar 404.",
    ]:
        b.bullet(item)

    b.h1("7. Fluxogramas")
    for chart in flowcharts:
        b.image(chart, chart.stem.replace("urlResum_", "").replace("_", " ").title())

    b.h1("8. Observações Técnicas")
    for item in [
        "Há chamadas diretas ao backend em algumas páginas como criarServico e detalhesOrdem. Para padronização futura, vale migrar tudo para proxies Next em /api/*.",
        "O proxy /api/habilidades aponta para uma rota backend não registrada no urls.py atual. Se a tela voltar a depender disso, criar ViewSet/rota ou remover o proxy legado.",
        "OrdemDeServicoViewSet está com AllowAny em alguns pontos e usa usuário padrão quando não autenticado. Isso é útil em desenvolvimento, mas deve ser revisado antes de produção.",
        "Cookies de autenticação têm configurações diferentes entre proxies. Em produção, usar secure=True com HTTPS e preferir httpOnly para tokens.",
    ]:
        b.bullet(item)

    b.save()


if __name__ == "__main__":
    charts = create_flowcharts()
    build_pdf(charts)
    print(PDF_PATH)
    for chart in charts:
        print(chart)
