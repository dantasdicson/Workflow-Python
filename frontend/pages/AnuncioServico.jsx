import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import Navbar from '../components/Navbar'
import homeStyles from '../styles/Home.module.css'
import styles from '../styles/AnuncioServico.module.css'

const initialForm = {
  titulo_profissional: '',
  descricao: '',
  habilidades_ids: [],
  foto_avatar: null,
  portfolio_url: '',
  portfolio_arquivo: null,
}

const getApiErrorMessage = (data) => {
  if (!data) return null
  if (typeof data.detail === 'string') return data.detail

  const firstFieldError = Object.values(data).find((value) => Array.isArray(value) && value.length > 0)
  if (firstFieldError) return firstFieldError.join(' ')

  return null
}

export default function AnuncioServico() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [categorias, setCategorias] = useState([])
  const [anuncioAtual, setAnuncioAtual] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true)
        const [meRes, categoriasRes, anuncioRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/categorias'),
          fetch('/api/anuncios-servico/meu-anuncio'),
        ])

        if (meRes.status === 401) {
          router.push('/login')
          return
        }

        const meData = await meRes.json()
        setUser(meData)

        const categoriasData = categoriasRes.ok ? await categoriasRes.json() : []
        setCategorias(Array.isArray(categoriasData) ? categoriasData : (categoriasData.results || []))

        if (anuncioRes.ok) {
          const anuncioData = await anuncioRes.json()
          setAnuncioAtual(anuncioData)
          setForm({
            titulo_profissional: anuncioData.titulo_profissional || '',
            descricao: anuncioData.descricao || '',
            habilidades_ids: Array.isArray(anuncioData.habilidades) ? anuncioData.habilidades.map((item) => item.id) : [],
            foto_avatar: null,
            portfolio_url: anuncioData.portfolio_url || '',
            portfolio_arquivo: null,
          })
          setAvatarPreview(anuncioData.foto_avatar_url || null)
        } else if (anuncioRes.status !== 404) {
          const anuncioError = await anuncioRes.json().catch(() => ({}))
          throw new Error(getApiErrorMessage(anuncioError) || 'Erro ao carregar anuncio atual.')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [router])

  const handleChange = (field) => (event) => {
    const isFileField = field === 'portfolio_arquivo' || field === 'foto_avatar'
    const value = isFileField ? event.target.files?.[0] || null : event.target.value
    if (field === 'foto_avatar') {
      setAvatarPreview(value ? URL.createObjectURL(value) : (anuncioAtual?.foto_avatar_url || null))
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleCategoria = (categoriaId) => {
    setForm((prev) => {
      const selected = new Set(prev.habilidades_ids)
      if (selected.has(categoriaId)) {
        selected.delete(categoriaId)
      } else {
        selected.add(categoriaId)
      }
      return { ...prev, habilidades_ids: Array.from(selected) }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!user?.freelancer) {
      setError('Ative seu perfil freelancer no Meu Painel para publicar um anuncio.')
      return
    }

    if (!form.portfolio_url && !form.portfolio_arquivo && !anuncioAtual?.portfolio_arquivo_url) {
      setError('Informe uma URL de portfolio ou envie um arquivo de ate 5 MB.')
      return
    }

    try {
      setSaving(true)

      const body = new FormData()
      body.append('titulo_profissional', form.titulo_profissional)
      body.append('descricao', form.descricao)
      body.append('portfolio_url', form.portfolio_url)
      form.habilidades_ids.forEach((id) => body.append('habilidades_ids', String(id)))
      if (form.foto_avatar) {
        body.append('foto_avatar', form.foto_avatar)
      }
      if (form.portfolio_arquivo) {
        body.append('portfolio_arquivo', form.portfolio_arquivo)
      }

      const method = anuncioAtual ? 'PUT' : 'POST'
      const res = await fetch('/api/anuncios-servico/meu-anuncio', {
        method,
        body,
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(getApiErrorMessage(data) || 'Erro ao salvar anuncio.')
      }

      setAnuncioAtual(data)
      setForm((prev) => ({
        ...prev,
        foto_avatar: null,
        portfolio_arquivo: null,
        habilidades_ids: Array.isArray(data.habilidades) ? data.habilidades.map((item) => item.id) : prev.habilidades_ids,
      }))
      setAvatarPreview(data.foto_avatar_url || null)
      setSuccess(anuncioAtual ? 'Anuncio atualizado com sucesso.' : 'Anuncio publicado com sucesso.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={homeStyles.container}>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.panel}>
          <div className={styles.header}>
            <div>
              <p className={styles.kicker}>Meu Portfólio</p>
              <h1 className={styles.title}>Divulgue seu trabalho como freelancer</h1>
              <p className={styles.subtitle}>
                Monte seu anuncio profissional com titulo, bio, habilidades e portfolio para apresentar seu servico na plataforma.
              </p>
            </div>
            {user?.freelancer && (
              <span className={styles.statusBadge}>
                {anuncioAtual ? 'Anuncio publicado' : 'Novo anuncio'}
              </span>
            )}
          </div>

          {loading ? (
            <div className={styles.message}>Carregando dados...</div>
          ) : !user?.freelancer ? (
            <div className={styles.blockedBox}>
              <h2>Perfil freelancer necessario</h2>
              <p>Ative o modo freelancer no Meu Painel e selecione suas categorias para publicar seu anuncio.</p>
              <button className={styles.secondaryButton} type="button" onClick={() => router.push('/meuPainel')}>
                Ir para Meu Painel
              </button>
            </div>
          ) : (
            <>
              {error && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>{success}</div>}

              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.grid}>
                  <label className={styles.label}>
                    Titulo profissional
                    <input
                      className={styles.input}
                      value={form.titulo_profissional}
                      onChange={handleChange('titulo_profissional')}
                      placeholder="Ex: Tecnico de Refrigeracao"
                      required
                    />
                  </label>

                  <label className={styles.label}>
                    URL do portfolio
                    <input
                      className={styles.input}
                      type="url"
                      value={form.portfolio_url}
                      onChange={handleChange('portfolio_url')}
                      placeholder="https://seuportfolio.com"
                    />
                  </label>
                </div>

                <label className={styles.label}>
                  Descricao / bio
                  <textarea
                    className={styles.textarea}
                    value={form.descricao}
                    onChange={handleChange('descricao')}
                    placeholder="Descreva sua experiencia, diferenciais e os tipos de servico que voce atende."
                    required
                  />
                </label>

                <section className={styles.sectionCard}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>Habilidades</h2>
                      <p className={styles.sectionText}>
                        Selecione as categorias ja cadastradas que representam seu servico.
                      </p>
                    </div>
                    <span className={styles.countBadge}>{form.habilidades_ids.length} selecionadas</span>
                  </div>

                  <div className={styles.categoriesGrid}>
                    {categorias.map((categoria) => (
                      <label key={categoria.id} className={styles.categoryOption}>
                        <input
                          type="checkbox"
                          checked={form.habilidades_ids.includes(categoria.id)}
                          onChange={() => toggleCategoria(categoria.id)}
                        />
                        <span>{categoria.nome}</span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className={styles.sectionCard}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>Foto de avatar</h2>
                      <p className={styles.sectionText}>
                        Essa imagem sera a foto principal da divulgacao do seu trabalho.
                      </p>
                    </div>
                  </div>

                  <label className={styles.label}>
                    Avatar da divulgacao
                    <input
                      className={styles.input}
                      type="file"
                      accept="image/*"
                      onChange={handleChange('foto_avatar')}
                    />
                  </label>

                  {(avatarPreview || anuncioAtual?.foto_avatar_url) && (
                    <div className={styles.avatarCurrent}>
                      <img
                        src={avatarPreview || anuncioAtual?.foto_avatar_url}
                        alt="Avatar da divulgacao"
                        className={styles.avatarThumb}
                      />
                    </div>
                  )}
                </section>

                <section className={styles.sectionCard}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>Portfolio</h2>
                      <p className={styles.sectionText}>
                        Envie um arquivo de ate 5 MB ou informe uma URL. Voce pode manter os dois.
                      </p>
                    </div>
                  </div>

                  <label className={styles.label}>
                    Arquivo do portfolio
                    <input
                      className={styles.input}
                      type="file"
                      onChange={handleChange('portfolio_arquivo')}
                    />
                  </label>

                  {anuncioAtual?.portfolio_arquivo_url && (
                    <p className={styles.fileInfo}>
                      Arquivo atual:{' '}
                      <a href={anuncioAtual.portfolio_arquivo_url} target="_blank" rel="noreferrer">
                        abrir portfolio enviado
                      </a>
                    </p>
                  )}

                  {form.portfolio_arquivo && (
                    <p className={styles.fileInfo}>
                      Novo arquivo selecionado: {form.portfolio_arquivo.name}
                    </p>
                  )}
                </section>

                <div className={styles.actions}>
                  <button className={styles.primaryButton} type="submit" disabled={saving}>
                    {saving ? 'Salvando...' : anuncioAtual ? 'Atualizar anuncio' : 'Publicar anuncio'}
                  </button>
                </div>
              </form>

              <section className={styles.previewCard}>
                <p className={styles.kicker}>Preview</p>
                <div className={styles.previewHeader}>
                  <div className={styles.previewAvatarWrap}>
                    {avatarPreview || anuncioAtual?.foto_avatar_url ? (
                      <img
                        src={avatarPreview || anuncioAtual?.foto_avatar_url}
                        alt="Avatar do anuncio"
                        className={styles.previewAvatar}
                      />
                    ) : (
                      <div className={styles.previewAvatarPlaceholder}>Foto</div>
                    )}
                  </div>
                  <div className={styles.previewIdentity}>
                    <h2 className={styles.previewTitle}>{form.titulo_profissional || 'Seu titulo profissional aparece aqui'}</h2>
                    <p className={styles.previewName}>{user?.nome} {user?.sobre_nome}</p>
                  </div>
                </div>
                <p className={styles.previewText}>
                  {form.descricao || 'Sua bio vai aparecer aqui para apresentar experiencia, especialidades e diferencial.'}
                </p>
                <div className={styles.previewTags}>
                  {form.habilidades_ids.length > 0 ? (
                    categorias
                      .filter((categoria) => form.habilidades_ids.includes(categoria.id))
                      .map((categoria) => (
                        <span key={categoria.id} className={styles.tag}>
                          {categoria.nome}
                        </span>
                      ))
                  ) : (
                    <span className={styles.tagMuted}>Selecione habilidades para montar o cartao.</span>
                  )}
                </div>
              </section>
            </>
          )}
        </section>
      </main>

      <footer className={homeStyles.footer}>
        <div className={homeStyles.footerInner}>
          <div className={homeStyles.footerColumns}>
            <div className={homeStyles.footerColumn}>
              <h3 className={homeStyles.footerTitle}>Redes Sociais</h3>
              <ul className={homeStyles.footerList}>
                <li><a href="#">Facebook</a></li>
                <li><a href="#">Instagram</a></li>
                <li><a href="#">WhatsApp</a></li>
              </ul>
            </div>

            <div className={homeStyles.footerColumn}>
              <h3 className={homeStyles.footerTitle}>Espaco futuro</h3>
              <ul className={homeStyles.footerList}>
                <li><a href="#">Item futuro 1</a></li>
                <li><a href="#">Item futuro 2</a></li>
                <li><a href="#">Item futuro 3</a></li>
              </ul>
            </div>

            <div className={homeStyles.footerColumn}>
              <h3 className={homeStyles.footerTitle}>Espaco futuro</h3>
              <ul className={homeStyles.footerList}>
                <li><a href="#">Item futuro 1</a></li>
                <li><a href="#">Item futuro 2</a></li>
                <li><a href="#">Item futuro 3</a></li>
              </ul>
            </div>
          </div>

          <div className={homeStyles.footerBottom}>
            2026 WorkFlow. Todos os direitos reservados
          </div>
        </div>
      </footer>
    </div>
  )
}
