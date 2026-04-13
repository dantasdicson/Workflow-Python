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
  const [deleting, setDeleting] = useState(false)

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
      
      // Buscar todas as ordens e filtrar no frontend
      const response = await apiFetch('/api/ordens')

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Erro ao carregar seus serviços')
      }

      const data = await response.json()
      const todosServicos = Array.isArray(data) ? data : (data.results || [])
      console.log('Todos os serviços carregados:', todosServicos)
      console.log('ID do usuário logado:', user.id_usuario)
      
      // Filtrar apenas os serviços do usuário logado
      const servicosDoUsuario = todosServicos.filter(servico => {
        // Verificar se o serviço tem contratante e se o ID do contratante corresponde ao usuário logado
        const isDoUsuario = servico.contratante && servico.contratante.id_usuario === user.id_usuario
        console.log(`- Serviço ${servico.id_os}: Contratante = ${servico.contratante?.id_usuario} | Usuário logado = ${user.id_usuario} | É do usuário? ${isDoUsuario}`)
        return isDoUsuario
      })
      
      console.log('Serviços filtrados para o usuário:', servicosDoUsuario)
      setServicos(servicosDoUsuario)
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

  const handleExcluir = async (ordemId) => {
    const servico = servicos.find(s => s.id_os === ordemId)
    const servicoDescricao = servico?.descricao_servico?.substring(0, 50) + '...' || 'esta ordem'
    
    console.log('=== DEBUG EXCLUSÃO ===')
    console.log('ordemId recebido:', ordemId)
    console.log('servico encontrado:', servico)
    console.log('lista de serviços completa:', servicos)
    console.log('IDs disponíveis:', servicos.map(s => s.id_os))
    
    // Teste direto da API primeiro
    console.log('=== TESTE DIRETO DA API ===')
    try {
      const testResponse = await fetch(`http://127.0.0.1:8000/api/ordens/${ordemId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      console.log('Teste direto - Status:', testResponse.status)
      console.log('Teste direto - OK:', testResponse.ok)
      const testText = await testResponse.text()
      console.log('Teste direto - Resposta:', testText)
    } catch (testError) {
      console.log('Teste direto - Erro:', testError)
    }
    console.log('=== FIM TESTE DIRETO ===')
    
    if (!confirm(`Tem certeza que deseja excluir permanentemente:\n\n"${servicoDescricao}"\n\nEsta ação não pode ser desfeita!`)) {
      return
    }

    try {
      setDeleting(true)
      console.log('Excluindo ordem:', ordemId)

      const deleteUrl = `/api/ordens/${ordemId}/`
      console.log('Fazendo requisição DELETE para:', deleteUrl)
      console.log('URL completa:', `http://127.0.0.1:8000${deleteUrl}`)
      
      const response = await apiFetch(`/api/ordens/${ordemId}/`, {
        method: 'DELETE'
      })

      console.log('Resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        console.log('Erro na resposta - Status:', response.status)
        
        let errorMessage = 'Erro ao excluir ordem de serviço'
        let responseText = ''
        
        try {
          // Primeiro tentar ler como texto para não consumir o stream
          responseText = await response.text()
          console.log('Resposta como texto:', responseText)
          
          // Tentar parsear como JSON
          try {
            const errorData = JSON.parse(responseText)
            console.log('Dados do erro:', errorData)
            errorMessage = errorData.error || errorData.detail || errorData.message || responseText
          } catch (jsonError) {
            console.log('Não foi possível parsear como JSON, usando texto bruto')
            errorMessage = responseText || errorMessage
          }
        } catch (e) {
          console.log('Erro ao ler resposta:', e)
          errorMessage = 'Erro ao comunicar com o servidor'
        }
        
        if (response.status === 404) {
          alert('Ordem de serviço não encontrada')
          return
        }
        if (response.status === 403) {
          alert('Você não tem permissão para excluir esta ordem')
          return
        }
        if (response.status === 401) {
          alert('Sessão expirada. Faça login novamente.')
          router.push('/login')
          return
        }
        
        alert(`Erro ${response.status}: ${errorMessage}`)
        return
      }

      // Remover a ordem da lista localmente com animação suave
      setTimeout(() => {
        setServicos(prev => prev.filter(servico => servico.id_os !== ordemId))
        // Feedback de sucesso mais amigável
        const successMsg = document.createElement('div')
        successMsg.textContent = 'Ordem excluída com sucesso!'
        successMsg.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 1000;
          animation: slideIn 0.3s ease;
        `
        document.body.appendChild(successMsg)
        setTimeout(() => successMsg.remove(), 3000)
      }, 500)
      
    } catch (err) {
      console.error('Erro ao excluir ordem:', err)
      alert('Erro ao excluir ordem de serviço. Tente novamente.')
    } finally {
      setDeleting(false)
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
                      <p><strong>ID do Contratante:</strong> {servico.id_usuario}</p>
                      {servico.usuario && (
                        <p><strong>Nome do Contratante:</strong> {servico.usuario.nome}</p>
                      )}
                      
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
                      <button 
                        className={`${styles.deleteBtn} ${deleting ? styles.deleting : ''}`}
                        onClick={() => handleExcluir(servico.id_os)}
                        disabled={deleting}
                        title="Excluir ordem de serviço permanentemente"
                      >
                        {deleting ? (
                          <>
                            <span className={styles.deleteIcon}>{'\u23f3'}</span>
                            Excluindo...
                          </>
                        ) : (
                          <>
                            <span className={styles.deleteIcon}>{'\ud83d\uddd1\ufe0f'}</span>
                            Excluir
                          </>
                        )}
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
