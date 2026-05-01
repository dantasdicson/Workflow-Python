import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import styles from '../styles/ListarServicos.module.css'
import { apiFetch, getMe } from '../lib/api'

export default function ListarServicos() {
  const router = useRouter()
  const [ordens, setOrdens] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const carregarOrdensAbertas = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiFetch('/api/ordens?status=aberta')

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Erro ao carregar ordens de serviço')
      }

      const data = await response.json()
      const ordensData = Array.isArray(data) ? data : (data.results || [])
      setOrdens(ordensData)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao carregar ordens:', err)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    ;(async () => {
      const me = await getMe()
      if (!me) {
        router.push('/login')
        return
      }

      setUser(me)
      carregarOrdensAbertas()
    })()
  }, [carregarOrdensAbertas, router])

  const formatarMoeda = (valor) => {
    const numero = Number(valor)
    if (Number.isNaN(numero)) return 'A combinar'

    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    })
  }

  const formatarData = (valor) => {
    if (!valor) return 'Sem data'
    return new Date(valor).toLocaleDateString('pt-BR')
  }

  const getStatusLabel = (status) => {
    if (status === 'aberta') return 'Aberta'
    if (status === 'em_execucao') return 'Em execução'
    return 'Finalizado'
  }

  const getContratanteNome = (ordem) => {
    const idContratante = ordem.contratante?.id_usuario || ordem.usuario?.id_usuario || ordem.id_usuario
    return ordem.contratante?.nome || ordem.usuario?.nome || (idContratante ? `ID ${idContratante}` : 'Não informado')
  }

  const getContratanteId = (ordem) => ordem.contratante?.id_usuario || ordem.usuario?.id_usuario || ordem.id_usuario

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <span className={styles.pageEyebrow}>Marketplace de serviços</span>
          <h1 className={styles.title}>Ordens de Serviço</h1>
        </div>

        <div className={styles.content}>
          {loading && <p className={styles.stateText}>Carregando ordens de serviço...</p>}

          {error && <p className={styles.error}>Erro: {error}</p>}

          {!loading && !error && (
            <div className={styles.ordensList}>
              {ordens.length === 0 ? (
                <p className={styles.stateText}>Nenhuma ordem de serviço em aberto encontrada.</p>
              ) : (
                ordens.map((ordem) => {
                  const candidatos = ordem.freelancers_candidatos?.length || 0
                  const categorias = ordem.categorias_necessarias || []

                  return (
                    <article key={ordem.id_os} className={styles.ordemCard}>
                      <div className={styles.ordemHeader}>
                        <div>
                          <span className={styles.cardEyebrow}>Ordem de serviço</span>
                          <h3>OS #{ordem.id_os}</h3>
                        </div>
                        <span className={`${styles.status} ${styles[ordem.status]}`}>
                          {getStatusLabel(ordem.status)}
                        </span>
                      </div>

                      {categorias.length > 0 && (
                        <div className={styles.categoryRow}>
                          {categorias.slice(0, 2).map((categoria) => (
                            <span key={categoria.id_categoria || categoria.id} className={styles.categoryPill}>
                              {categoria.nome_categoria || categoria.nome}
                            </span>
                          ))}
                          {categorias.length > 2 && (
                            <span className={styles.categoryMore}>+{categorias.length - 2}</span>
                          )}
                        </div>
                      )}

                      <p className={styles.descricao}>{ordem.descricao_servico}</p>

                      <div className={styles.valorBox}>
                        <span>Valor estimado</span>
                        <strong>
                          {formatarMoeda(ordem.valor_estimado_minimo)} - {formatarMoeda(ordem.valor_estimado_maximo)}
                        </strong>
                      </div>

                      <dl className={styles.metaGrid}>
                        <div>
                          <dt>Criação</dt>
                          <dd>{formatarData(ordem.data_criacao)}</dd>
                        </div>
                        <div>
                          <dt>Candidatos</dt>
                          <dd>{candidatos}/7</dd>
                        </div>
                        <div className={styles.metaWide}>
                          <dt>Contratante</dt>
                          <dd>
                            <button
                              type="button"
                              className={styles.profileLink}
                              onClick={() => router.push(`/perfilUsuario?id=${getContratanteId(ordem)}`)}
                            >
                              {getContratanteNome(ordem)}
                            </button>
                          </dd>
                        </div>
                      </dl>

                      <div className={styles.ordemActions}>
                        <button
                          className={styles.detalhesBtn}
                          onClick={() => router.push(`/detalhesOrdem?id=${ordem.id_os}`)}
                        >
                          Ver detalhes
                        </button>

                        {ordem.status === 'aberta' && user?.freelancer && (
                          <button
                            className={styles.candidatarBtn}
                            onClick={() => router.push(`/detalhesOrdem?id=${ordem.id_os}`)}
                          >
                            Candidatar-se
                          </button>
                        )}
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerColumns}>
            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}><span className={styles.footerIcon}>{'>'}</span>Redes Sociais</h3>
              <ul className={styles.footerList}>
                <li><a href="#">Facebook <span className={styles.footerItemIcon}></span></a></li>
                <li><a href="#">Instagram <span className={styles.footerItemIcon}></span></a></li>
                <li><a href="#">WhatsApp <span className={styles.footerItemIcon}></span></a></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Espaço futuro</h3>
              <ul className={styles.footerList}>
                <li><a href="#">Item futuro 1</a></li>
                <li><a href="#">Item futuro 2</a></li>
                <li><a href="#">Item futuro 3</a></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Espaço futuro</h3>
              <ul className={styles.footerList}>
                <li><a href="#">Item futuro 1</a></li>
                <li><a href="#">Item futuro 2</a></li>
                <li><a href="#">Item futuro 3</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            2026 WorkFlow. Todos os direitos reservados <span className={styles.footerRightIcon}></span>
          </div>
        </div>
      </footer>
    </div>
  )
}
