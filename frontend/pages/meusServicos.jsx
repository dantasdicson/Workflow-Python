import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import styles from '../styles/MeusServicos.module.css'
import { apiFetch } from '../lib/api'
import { getMe } from '../lib/api'

export default function MeusServicos() {
  const router = useRouter()
  const [servicos, setServicos] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    ;(async () => {
      const me = await getMe()
      if (!me) {
        router.push('/login')
        return
      }
      setUser(me)
    })()
  }, [router])

  useEffect(() => {
    if (user && user.id_usuario) {
      carregarMeusServicos()
    }
  }, [user])

  const carregarMeusServicos = async () => {
    if (!user || !user.id_usuario) {
      console.log('Usuário não disponível ainda')
      return
    }

    try {
      setLoading(true)
      console.log('Carregando serviços para o usuário:', user.id_usuario)
      
      // Buscar ordens onde o usuário é o contratante
      const response = await apiFetch(`/api/ordens?contratante_id=${user.id_usuario}`)

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Erro ao carregar seus serviços')
      }

      const data = await response.json()
      const servicosData = Array.isArray(data) ? data : (data.results || [])
      console.log('Serviços carregados:', servicosData)
      setServicos(servicosData)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao carregar serviços:', err)
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
        return 'Em Execução'
      case 'concluido':
        return 'Concluído'
      default:
        return status
    }
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <h1 className={styles.title}>Meus Serviços</h1>

        <div className={styles.content}>
          {loading && <p>Carregando seus serviços...</p>}

          {error && <p className={styles.error}>Erro: {error}</p>}

          {!loading && !error && (
            <div className={styles.servicosList}>
              {servicos.length === 0 ? (
                <div className={styles.emptyMessage}>
                  <p>Você ainda não criou nenhum serviço.</p>
                  <button 
                    className={styles.createBtn}
                    onClick={() => router.push('/criarServico')}
                  >
                    Criar primeiro serviço
                  </button>
                </div>
              ) : (
                servicos.map((servico) => (
                  <div key={servico.id_os} className={styles.servicoCard}>
                    <div className={styles.cardHeader}>
                      <h3>OS #{servico.id_os}</h3>
                      <span className={`${styles.status} ${getStatusColor(servico.status)}`}>
                        {getStatusText(servico.status)}
                      </span>
                    </div>
                    
                    <div className={styles.cardContent}>
                      <p><strong>Descrição:</strong> {servico.descricao_servico}</p>
                      <p><strong>Valor estimado:</strong> R$ {servico.valor_estimado_minimo} - R$ {servico.valor_estimado_maximo}</p>
                      <p><strong>Data de criação:</strong> {new Date(servico.data_criacao).toLocaleDateString('pt-BR')}</p>
                      
                      {servico.freelancer_selecionado && (
                        <p><strong>Freelancer selecionado:</strong> {servico.freelancer_selecionado.nome}</p>
                      )}
                      
                      {servico.freelancers_candidatos && servico.freelancers_candidatos.length > 0 && (
                        <p><strong>Candidatos:</strong> {servico.freelancers_candidatos.length} freelancer(s)</p>
                      )}
                    </div>

                    <div className={styles.cardActions}>
                      <button 
                        className={styles.viewBtn}
                        onClick={() => router.push(`/detalhesOrdem?id=${servico.id_os}`)}
                      >
                        Ver Detalhes
                      </button>
                      {servico.status === 'aberta' && (
                        <button className={styles.editBtn}>
                          Editar
                        </button>
                      )}
                    </div>
                  </div>
                ))
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
            2026 WorkFlow. Todos os direitos reservados <span className={styles.footerRightIcon}>{"\ud83d\udd12"}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
