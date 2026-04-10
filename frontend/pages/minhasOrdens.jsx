import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import styles from '../styles/Home.module.css'
import { apiFetch } from '../lib/api'
import { getMe } from '../lib/api'

export default function MinhasOrdens() {
  const router = useRouter()
  const [ordens, setOrdens] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const me = await getMe()
        if (!me) {
          router.push('/login')
          return
        }
        setUser(me)
        carregarMinhasOrdens(me.id_usuario)
      } catch (err) {
        console.error('Erro ao verificar usuário:', err)
        router.push('/login')
      }
    })()
  }, [router])

  const carregarMinhasOrdens = async (userId) => {
    try {
      setLoading(true)
      
      // Buscar ordens onde o usuário é o contratante
      const responseContratante = await apiFetch(`/api/ordens?contratante=${userId}`)
      
      // Buscar ordens onde o usuário é o freelancer selecionado
      const responseFreelancer = await apiFetch(`/api/ordens?freelancer=${userId}`)
      
      // Buscar ordens onde o usuário é candidato
      const responseCandidato = await apiFetch(`/api/ordens?candidatos=${userId}`)
      
      if (!responseContratante.ok || !responseFreelancer.ok || !responseCandidato.ok) {
        throw new Error('Erro ao carregar suas ordens de serviço')
      }

      const dataContratante = await responseContratante.json()
      const dataFreelancer = await responseFreelancer.json()
      const dataCandidato = await responseCandidato.json()

      // Combinar todas as ordens
      const ordensContratante = Array.isArray(dataContratante) ? dataContratante : (dataContratante.results || [])
      const ordensFreelancer = Array.isArray(dataFreelancer) ? dataFreelancer : (dataFreelancer.results || [])
      const ordensCandidato = Array.isArray(dataCandidato) ? dataCandidato : (dataCandidato.results || [])
      
      // Combinar e remover duplicatas
      const todasOrdens = [...ordensContratante, ...ordensFreelancer, ...ordensCandidato]
      const ordensUnicas = todasOrdens.filter((ordem, index, self) => 
        index === self.findIndex((o) => o.id_os === ordem.id_os)
      )
      
      // Ordenar por data de criação (mais recentes primeiro)
      ordensUnicas.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao))
      
      setOrdens(ordensUnicas)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao carregar minhas ordens:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'aberta':
        return styles.statusAberta
      case 'em_execucao':
        return styles.statusExecucao
      case 'concluida':
        return styles.statusConcluida
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
      case 'concluida':
        return 'Concluída'
      default:
        return status
    }
  }

  const getRoleText = (ordem) => {
    if (ordem.contratante?.id_usuario === user?.id_usuario) {
      return 'Contratante'
    }
    if (ordem.freelancer_selecionado?.id_usuario === user?.id_usuario) {
      return 'Freelancer Selecionado'
    }
    if (ordem.freelancers_candidatos?.some(c => c.id_usuario === user?.id_usuario)) {
      return 'Candidato'
    }
    return 'Desconhecido'
  }

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        <h1 className={styles.title}>Minhas Ordens de Serviço</h1>
        
        <div className={styles.content}>
          {loading && <p>Carregando suas ordens de serviço...</p>}
          
          {error && <p className={styles.error}>Erro: {error}</p>}
          
          {!loading && !error && (
            <div className={styles.ordensList}>
              {ordens.length === 0 ? (
                <p className={styles.emptyMessage}>Você não possui ordens de serviço.</p>
              ) : (
                ordens.map((ordem) => (
                  <div key={ordem.id_os} className={styles.ordemCard}>
                    <div className={styles.ordemHeader}>
                      <h3>OS #{ordem.id_os}</h3>
                      <span className={`${styles.status} ${getStatusClass(ordem.status)}`}>
                        {getStatusText(ordem.status)}
                      </span>
                      <span className={styles.role}>
                        {getRoleText(ordem)}
                      </span>
                    </div>
                    
                    <div className={styles.ordemContent}>
                      <p><strong>Descrição:</strong> {ordem.descricao_servico}</p>
                      <p><strong>Valor estimado:</strong> R$ {ordem.valor_estimado_minimo} - R$ {ordem.valor_estimado_maximo}</p>
                      <p><strong>Data de criação:</strong> {new Date(ordem.data_criacao).toLocaleDateString('pt-BR')}</p>
                      
                      {ordem.contratante && (
                        <p><strong>Contratante:</strong> {ordem.contratante.nome}</p>
                      )}
                      
                      {ordem.freelancer_selecionado && (
                        <p><strong>Freelancer:</strong> {ordem.freelancer_selecionado.nome}</p>
                      )}
                      
                      <p><strong>Candidatos:</strong> {ordem.freelancers_candidatos?.length || 0}/7</p>
                      
                      {ordem.categorias_necessarias && ordem.categorias_necessarias.length > 0 && (
                        <div className={styles.categorias}>
                          <p><strong>Categorias necessárias:</strong></p>
                          <div className={styles.categoriasList}>
                            {ordem.categorias_necessarias.map((categoria) => (
                              <span key={categoria.id} className={styles.categoriaTag}>
                                {categoria.nome}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {ordem.data_conclusao && (
                        <p><strong>Data de conclusão:</strong> {new Date(ordem.data_conclusao).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                    
                    <div className={styles.ordemActions}>
                      <button 
                        className={styles.detalhesBtn}
                        onClick={() => router.push(`/detalhesOrdem?id=${ordem.id_os}`)}
                      >
                        Ver Detalhes
                      </button>
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
              <h3 className={styles.footerTitle}><span className={styles.footerIcon}></span>Redes Sociais</h3>
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
