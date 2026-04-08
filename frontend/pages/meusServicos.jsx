import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Menu from '../components/Menu'
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
      carregarMeusServicos()
    })()
  }, [router])

  const carregarMeusServicos = async () => {
    try {
      setLoading(true)
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
      <Menu />
      <main className={styles.main}>
        <h1 className={styles.title}>Meus Serviços</h1>

        <div className={styles.content}>
          {loading && <p>Carregando seus serviços...</p>}

          {error && <p className={styles.error}>Erro: {error}</p>}

          {!loading && !error && (
            <div className={styles.servicosList}>
              {servicos.length === 0 ? (
                <p className={styles.emptyMessage}>
                  Você ainda não criou nenhum serviço. 
                  <button 
                    className={styles.createBtn}
                    onClick={() => router.push('/criarServico')}
                  >
                    Criar primeiro serviço
                  </button>
                </p>
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
                      <button className={styles.viewBtn}>
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
    </div>
  )
}
