import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import Navbar from '../components/Navbar'
import homeStyles from '../styles/Home.module.css'
import styles from '../styles/PerfilUsuario.module.css'

function getMediaProxyUrl(url) {
  if (!url) return null

  try {
    const parsedUrl = new URL(url, window.location.origin)
    if (parsedUrl.pathname.startsWith('/media/')) {
      return `/media-proxy/${parsedUrl.pathname.slice('/media/'.length)}${parsedUrl.search}`
    }
  } catch (e) {
    // Mantem a URL original se ela nao puder ser interpretada.
  }

  return url
}

export default function PerfilUsuario() {
  const router = useRouter()
  const { id } = router.query
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const carregarPerfil = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/usuarios/${id}/perfil-publico/`)

        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Perfil nao encontrado.' : 'Erro ao carregar perfil.')
        }

        setPerfil(await response.json())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    carregarPerfil()
  }, [id])

  const nomeCompleto = [perfil?.nome, perfil?.sobre_nome].filter(Boolean).join(' ')
  const nota = Number(perfil?.avaliacao_media || 0).toFixed(2)
  const fotoPerfilUrl = getMediaProxyUrl(perfil?.foto_perfil_url)

  return (
    <div className={homeStyles.container}>
      <Navbar />

      <main className={styles.main}>
        {loading && <div className={styles.message}>Carregando perfil...</div>}
        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && perfil && (
          <section className={styles.profilePanel}>
            <div className={styles.avatar}>
              {fotoPerfilUrl ? (
                <span
                  className={styles.avatarImage}
                  style={{ backgroundImage: `url(${fotoPerfilUrl})` }}
                  aria-label={`Foto de ${nomeCompleto || 'usuario'}`}
                />
              ) : (
                <span>{(perfil.nome || 'U').slice(0, 1).toUpperCase()}</span>
              )}
            </div>

            <div className={styles.profileMain}>
              <div className={styles.topLine}>
                <span className={styles.kicker}>Perfil publico</span>
                <span className={styles.roleBadge}>{perfil.freelancer ? 'Freelancer' : 'Contratante'}</span>
              </div>

              <div className={styles.identity}>
                <h1>{nomeCompleto || 'Usuario'}</h1>
              </div>

              <div className={styles.metaList}>
                <div>
                  <strong>{nota}</strong>
                  <span>nota media</span>
                </div>
                <div>
                  <strong>{perfil.total_avaliacoes || 0}</strong>
                  <span>avaliacoes</span>
                </div>
                <div>
                  <strong>{perfil.data_criacao ? new Date(perfil.data_criacao).toLocaleDateString('pt-BR') : 'Nao informado'}</strong>
                  <span>desde</span>
                </div>
              </div>

              <div className={styles.ratingScale} aria-hidden="true">
                <span style={{ width: `${Math.min(Number(nota || 0) * 20, 100)}%` }} />
              </div>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Categorias</h2>
                  <span>{perfil.categorias?.length || 0}</span>
                </div>
                {perfil.categorias?.length ? (
                  <div className={styles.categoryGrid}>
                    {perfil.categorias.map((categoria) => (
                      <span key={categoria.id}>{categoria.nome}</span>
                    ))}
                  </div>
                ) : (
                  <p>Este usuario ainda nao informou categorias.</p>
                )}
              </section>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
