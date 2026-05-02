import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import Navbar from '../components/Navbar'
import { getMediaProxyUrl } from '../lib/media'
import homeStyles from '../styles/Home.module.css'
import styles from '../styles/ListagemContratantes.module.css'
import { getMe } from '../lib/api'

const formatDate = (value) => {
  if (!value) return 'Nao informado'
  return new Date(value).toLocaleDateString('pt-BR')
}

const getFreelancerId = (anuncio) => (
  anuncio.freelancer?.id_usuario
  || anuncio.freelancer?.id
  || anuncio.freelancer_id
)

export default function ListagemContratantes() {
  const router = useRouter()
  const [anuncios, setAnuncios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPage = async () => {
      try {
        const me = await getMe()
        if (!me) {
          router.push('/login')
          return
        }

        setLoading(true)
        const res = await fetch('/api/anuncios-servico')
        if (!res.ok) {
          throw new Error('Erro ao carregar anuncios de freelancers.')
        }

        const data = await res.json()
        setAnuncios(Array.isArray(data) ? data : (data.results || []))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [router])

  return (
    <div className={homeStyles.container}>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.kicker}>Freelancers Disponiveis na plataforma</p>
          <h1 className={styles.title}>Freelancers Disponiveis na plataforma</h1>
          <p className={styles.subtitle}>
            Veja os anuncios criados pelos freelancers da plataforma, confira categorias, portfolio e escolha quem faz sentido para a sua demanda.
          </p>
        </section>

        {loading && <div className={styles.message}>Carregando anuncios de freelancers...</div>}
        {error && <div className={styles.error}>Erro: {error}</div>}

        {!loading && !error && (
          <section className={styles.listSection}>
            {anuncios.length === 0 ? (
              <div className={styles.emptyState}>
                Nenhum anuncio de freelancer foi publicado ainda.
              </div>
            ) : (
              <div className={styles.grid}>
                {anuncios.map((anuncio) => {
                  const avatarUrl = getMediaProxyUrl(anuncio.foto_avatar_url || anuncio.freelancer?.foto_perfil_url)
                  const portfolioArquivoUrl = getMediaProxyUrl(anuncio.portfolio_arquivo_url)
                  const freelancerId = getFreelancerId(anuncio)
                  const abrirPerfil = () => {
                    if (!freelancerId) {
                      setError('Nao foi possivel identificar o perfil deste freelancer.')
                      return
                    }
                    router.push(`/perfilUsuario?id=${freelancerId}`)
                  }

                  return (
                    <article key={anuncio.id} className={styles.card}>
                      <div className={styles.cardHeader}>
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={`Avatar de ${anuncio.freelancer?.nome || 'freelancer'}`}
                            className={styles.avatar}
                          />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {(anuncio.freelancer?.nome || 'F').slice(0, 1).toUpperCase()}
                          </div>
                        )}

                      <div className={styles.identity}>
                        <h2 className={styles.cardTitle}>{anuncio.titulo_profissional}</h2>
                        <button
                          type="button"
                          className={styles.freelancerName}
                          onClick={abrirPerfil}
                        >
                          {anuncio.freelancer?.nome} {anuncio.freelancer?.sobre_nome}
                        </button>
                        <p className={styles.meta}>
                          Publicado em {formatDate(anuncio.data_criacao)}
                        </p>
                      </div>
                      </div>

                      <p className={styles.description}>{anuncio.descricao}</p>

                      <div className={styles.tags}>
                        {Array.isArray(anuncio.categorias) && anuncio.categorias.length > 0 ? (
                          anuncio.categorias.map((categoria) => (
                            <span key={categoria.id} className={styles.tag}>
                              {categoria.nome}
                            </span>
                          ))
                        ) : (
                          <span className={styles.tagMuted}>Sem categorias informadas</span>
                        )}
                      </div>

                      <div className={styles.cardFooter}>
                        <div className={styles.contactInfo}>
                          <span>{anuncio.freelancer?.email || 'Email nao informado'}</span>
                          {anuncio.freelancer?.num_tel && <span>{anuncio.freelancer.num_tel}</span>}
                        </div>

                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={abrirPerfil}
                          >
                            Ver perfil
                          </button>
                          {anuncio.portfolio_url && (
                            <a
                              href={anuncio.portfolio_url}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.secondaryButton}
                            >
                              Ver portfolio
                            </a>
                          )}
                          {portfolioArquivoUrl && (
                            <a
                              href={portfolioArquivoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.primaryButton}
                            >
                              Abrir anexo
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        )}
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
