import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Menu from '../components/Menu'
import styles from '../styles/ListarServicos.module.css'
import { apiFetch } from '../lib/api'
import { getMe } from '../lib/api'

export default function ListarServicos() {
  const router = useRouter()
  const [ordens, setOrdens] = useState([])
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
      console.log('Usuário logado:', me);
      console.log('É freelancer?', me.freelancer);
      setUser(me)
      carregarOrdensAbertas()
    })()
  }, [router])

  const carregarOrdensAbertas = async () => {
    try {
      setLoading(true)
      // Buscar ordens com status 'aberta'
      const response = await apiFetch('/api/ordens?status=aberta')

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Erro ao carregar ordens de serviço')
      }

      const data = await response.json()

      // Verificar se a resposta é um array ou um objeto paginado
      const ordensData = Array.isArray(data) ? data : (data.results || [])
      setOrdens(ordensData)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao carregar ordens:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <Menu />
      <main className={styles.main}>
        <h1 className={styles.title}>Ordens de Serviço</h1>

        <div className={styles.content}>
          {loading && <p>Carregando ordens de serviço...</p>}

          {error && <p className={styles.error}>Erro: {error}</p>}

          {!loading && !error && (
            <div className={styles.ordensList}>
              {ordens.length === 0 ? (
                <p>Nenhuma ordem de serviço em aberto encontrada.</p>
              ) : (
                ordens.map((ordem) => (
                  <div key={ordem.id_os} className={styles.ordemCard}>
                    <div className={styles.ordemHeader}>
                      <h3>OS #{ordem.id_os}</h3>
                      <span className={`${styles.status} ${styles[ordem.status]}`}>
                        {ordem.status === 'aberta' ? 'Aberta' : 
                         ordem.status === 'em_execucao' ? 'Em Execução' : 'Concluída'}
                      </span>
                    </div>
                    <p><strong>Descrição:</strong> {ordem.descricao_servico}</p>
                    <p><strong>Valor estimado:</strong> R$ {ordem.valor_estimado_minimo} - R$ {ordem.valor_estimado_maximo}</p>
                    <p><strong>Data de criação:</strong> {new Date(ordem.data_criacao).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Candidatos:</strong> {ordem.freelancers_candidatos?.length || 0}/7</p>
                    
                    <div className={styles.ordemActions}>
                      <button 
                        className={styles.detalhesBtn}
                        onClick={() => router.push(`/detalhesOrdem?id=${ordem.id_os}`)}
                      >
                        Ver Detalhes
                      </button>
                      
                      {ordem.status === 'aberta' && user?.freelancer && (
                        <button 
                          className={styles.candidatarBtn}
                          onClick={() => {
                            console.log('Clicando em candidatar para ordem:', ordem.id_os);
                            console.log('Usuário:', user);
                            router.push(`/detalhesOrdem?id=${ordem.id_os}`);
                          }}
                        >
                          Candidatar-se
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