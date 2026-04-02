import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Menu from '../components/Menu'
import styles from '../styles/ListarServicos.module.css'

export default function ListarServicos() {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    carregarOrdensAbertas()
  }, [])

  const carregarOrdensAbertas = async () => {
    try {
      setLoading(true)
      // Buscar ordens com status 'em_aberto' (Em Aberto)
      const response = await fetch('http://127.0.0.1:8000/api/ordens/?status=em_aberto')

      if (!response.ok) {
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
                    <h3>OS #{ordem.id_os}</h3>
                    <p><strong>Descrição:</strong> {ordem.descricao_servico}</p>
                    <p><strong>Valor estimado:</strong> R$ {ordem.valor_estimado_minimo} - R$ {ordem.valor_estimado_maximo}</p>
                    <p><strong>Status:</strong> {ordem.status}</p>
                    <p><strong>Data de criação:</strong> {new Date(ordem.data_criacao).toLocaleDateString('pt-BR')}</p>
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