import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import Navbar from '../components/Navbar'
import styles from '../styles/MeusServicos.module.css'
import { apiFetch, getMe } from '../lib/api'

export default function MeusServicos() {
  const router = useRouter()
  const [meusServicos, setMeusServicos] = useState([])
  const [servicosConcorrendo, setServicosConcorrendo] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const loadPage = async () => {
      try {
        const me = await getMe()
        if (!me) {
          router.push('/login')
          return
        }

        setUser(me)
        await carregarDados(me)
      } catch (err) {
        setError(err.message || 'Erro ao carregar seus servicos.')
        setLoading(false)
      }
    }

    loadPage()
  }, [router])

  const carregarDados = async (currentUser) => {
    try {
      setLoading(true)
      setError(null)

      const requisicoes = [
        apiFetch(`/api/ordens/?contratante=${currentUser.id_usuario}`),
      ]

      if (currentUser.freelancer) {
        requisicoes.push(apiFetch(`/api/ordens/?candidatos=${currentUser.id_usuario}`))
      }

      const responses = await Promise.all(requisicoes)
      const [meusRes, concorrendoRes] = responses

      if (!meusRes.ok) {
        throw new Error('Erro ao carregar os servicos criados.')
      }

      const meusData = await meusRes.json()
      setMeusServicos(Array.isArray(meusData) ? meusData : (meusData.results || []))

      if (currentUser.freelancer && concorrendoRes) {
        if (!concorrendoRes.ok) {
          throw new Error('Erro ao carregar os servicos em que voce esta concorrendo.')
        }

        const concorrendoData = await concorrendoRes.json()
        setServicosConcorrendo(Array.isArray(concorrendoData) ? concorrendoData : (concorrendoData.results || []))
      } else {
        setServicosConcorrendo([])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'aberta':
        return styles.statusAberta
      case 'em_execucao':
        return styles.statusExecucao
      case 'concluido':
        return styles.statusConcluido
      default:
        return styles.statusDefault
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'aberta':
        return 'Aberta'
      case 'em_execucao':
        return 'Em Execucao'
      case 'concluido':
        return 'Concluido'
      default:
        return status
    }
  }

  const handleExcluir = async (ordemId) => {
    const servico = meusServicos.find((item) => item.id_os === ordemId)
    const descricao = servico?.descricao_servico?.substring(0, 50) || 'esta ordem'

    if (!confirm(`Tem certeza que deseja excluir "${descricao}"?`)) {
      return
    }

    try {
      setDeleting(true)
      const response = await apiFetch(`http://127.0.0.1:8000/api/ordens/${ordemId}/`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }

        const text = await response.text()
        throw new Error(text || 'Erro ao excluir ordem.')
      }

      setMeusServicos((prev) => prev.filter((item) => item.id_os !== ordemId))
    } catch (err) {
      alert(err.message || 'Erro ao excluir ordem de servico.')
    } finally {
      setDeleting(false)
    }
  }

  const renderServicoCard = (servico, { owner = false } = {}) => (
    <article key={`${owner ? 'owner' : 'candidate'}-${servico.id_os}`} className={styles.servicoCard}>
      <div className={styles.cardHeader}>
        <h3>OS #{servico.id_os}</h3>
        <span className={`${styles.status} ${getStatusColor(servico.status)}`}>
          {getStatusText(servico.status)}
        </span>
      </div>

      <div className={styles.cardContent}>
        <p><strong>Descricao:</strong> {servico.descricao_servico}</p>
        <p><strong>Valor estimado:</strong> R$ {servico.valor_estimado_minimo} - R$ {servico.valor_estimado_maximo}</p>
        <p><strong>Data de criacao:</strong> {new Date(servico.data_criacao).toLocaleDateString('pt-BR')}</p>

        {owner ? (
          <>
            <p><strong>Candidatos:</strong> {servico.freelancers_candidatos?.length || 0}</p>
            {servico.freelancer_selecionado && (
              <p><strong>Freelancer selecionado:</strong> {servico.freelancer_selecionado.nome}</p>
            )}
          </>
        ) : (
          <>
            <p><strong>Contratante:</strong> {servico.contratante?.nome} {servico.contratante?.sobre_nome}</p>
            <p><strong>Total de candidatos:</strong> {servico.freelancers_candidatos?.length || 0}</p>
            {servico.freelancer_selecionado && (
              <p><strong>Selecionado:</strong> {servico.freelancer_selecionado.nome}</p>
            )}
          </>
        )}
      </div>

      <div className={styles.cardActions}>
        <button
          className={styles.viewBtn}
          onClick={() => router.push(`/detalhesOrdem?id=${servico.id_os}`)}
        >
          Ver Detalhes
        </button>

        {owner && servico.status === 'aberta' && (
          <button className={styles.editBtn}>
            Editar
          </button>
        )}

        {owner && (
          <button
            className={`${styles.deleteBtn} ${deleting ? styles.deleting : ''}`}
            onClick={() => handleExcluir(servico.id_os)}
            disabled={deleting}
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </button>
        )}
      </div>
    </article>
  )

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.kicker}>Painel de Servicos</p>
            <h1 className={styles.title}>Meus Servicos</h1>
            <p className={styles.subtitle}>
              Acompanhe o que voce publicou como contratante e, se atuar como freelancer, veja tambem as ordens em que esta concorrendo.
            </p>
          </div>
          <button className={styles.createBtn} onClick={() => router.push('/criarServico')}>
            Criar servico
          </button>
        </div>

        <div className={styles.content}>
          {loading && <p className={styles.message}>Carregando seus servicos...</p>}
          {error && <p className={styles.error}>Erro: {error}</p>}

          {!loading && !error && (
            <div className={`${styles.columns} ${!user?.freelancer ? styles.singleColumn : ''}`}>
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <h2 className={styles.panelTitle}>Servicos criados por voce</h2>
                    <p className={styles.panelText}>
                      Ordens em que voce esta atuando como contratante dentro da plataforma.
                    </p>
                  </div>
                  <span className={styles.countBadge}>{meusServicos.length}</span>
                </div>

                <div className={styles.servicosList}>
                  {meusServicos.length === 0 ? (
                    <div className={styles.emptyMessage}>
                      <p>Voce ainda nao criou nenhum servico.</p>
                    </div>
                  ) : (
                    meusServicos.map((servico) => renderServicoCard(servico, { owner: true }))
                  )}
                </div>
              </section>

              {user?.freelancer && (
                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <div>
                      <h2 className={styles.panelTitle}>Servicos em que voce esta concorrendo</h2>
                      <p className={styles.panelText}>
                        Ordens abertas ou em andamento nas quais voce ja se candidatou como freelancer.
                      </p>
                    </div>
                    <span className={styles.countBadge}>{servicosConcorrendo.length}</span>
                  </div>

                  <div className={styles.servicosList}>
                    {servicosConcorrendo.length === 0 ? (
                      <div className={styles.emptyMessage}>
                        <p>Voce ainda nao esta concorrendo em nenhum servico.</p>
                      </div>
                    ) : (
                      servicosConcorrendo.map((servico) => renderServicoCard(servico))
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerColumns}>
            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}><span className={styles.footerIcon}>{"\ud83c\udf10"}</span>Redes Sociais</h3>
              <ul className={styles.footerList}>
                <li><a href="#">Facebook <span className={styles.footerItemIcon}>{"\ud83d\udcd8"}</span></a></li>
                <li><a href="#">Instagram <span className={styles.footerItemIcon}>{"\ud83d\udcf8"}</span></a></li>
                <li><a href="#">WhatsApp <span className={styles.footerItemIcon}>{"\ud83d\udcac"}</span></a></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Espaco futuro</h3>
              <ul className={styles.footerList}>
                <li><a href="#">Item futuro 1</a></li>
                <li><a href="#">Item futuro 2</a></li>
                <li><a href="#">Item futuro 3</a></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Espaco futuro</h3>
              <ul className={styles.footerList}>
                <li><a href="#">Item futuro 1</a></li>
                <li><a href="#">Item futuro 2</a></li>
                <li><a href="#">Item futuro 3</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            2026 WorkFlow. Todos os direitos reservados <span className={styles.footerRightIcon}>{"\ud83d\udd12"}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
