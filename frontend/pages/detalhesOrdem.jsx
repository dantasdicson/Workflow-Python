import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import styles from '../styles/DetalhesOrdem.module.css'
import { apiFetch, getMe } from '../lib/api'

function buildOrdensProxyPath(path) {
  return `/api/ordens-proxy?path=${encodeURIComponent(path)}`
}

function getStatusLabel(status) {
  if (status === 'aberta') return 'Aberta'
  if (status === 'em_execucao') return 'Em andamento'
  if (status === 'concluido') return 'Concluída'
  return status
}

export default function DetalhesOrdem() {
  const router = useRouter()
  const { id } = router.query
  const [ordem, setOrdem] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [candidatando, setCandidatando] = useState(false)
  const [selecionandoId, setSelecionandoId] = useState(null)
  const [conversas, setConversas] = useState([])
  const [conversaAtivaId, setConversaAtivaId] = useState(null)
  const [mensagensChat, setMensagensChat] = useState([])
  const [textoMensagem, setTextoMensagem] = useState('')
  const [enviandoMensagem, setEnviandoMensagem] = useState(false)
  const pollingRef = useRef(null)

  useEffect(() => {
    if (!router.isReady) return

    ;(async () => {
      try {
        const me = await getMe()
        if (!me) {
          router.push('/login')
          return
        }
        setUser(me)
      } catch (err) {
        setError('Erro ao verificar autenticação.')
        setLoading(false)
      }
    })()
  }, [router, router.isReady])

  const carregarOrdem = useCallback(async () => {
    const response = await fetch(buildOrdensProxyPath(`${id}/`))
    if (!response.ok) {
      throw new Error('Não foi possível carregar a ordem de serviço.')
    }
    const data = await response.json()
    setOrdem(data)
  }, [id])

  const carregarConversas = useCallback(async (adjustSelection = true) => {
    const response = await apiFetch(buildOrdensProxyPath(`${id}/conversas/`))
    if (!response.ok) {
      if (response.status === 403) {
        setConversas([])
        setConversaAtivaId(null)
        return
      }
      throw new Error('Não foi possível carregar as conversas.')
    }

    const data = await response.json()
    setConversas(data)
    if (!adjustSelection) return

    if (data.length === 0) {
      setConversaAtivaId(null)
      setMensagensChat([])
      return
    }

    const conversaPrincipal = data.find((conversa) => conversa.tipo === 'principal')
    const fallback = conversaPrincipal || data[0]
    setConversaAtivaId((currentId) => {
      const exists = data.some((conversa) => conversa.id === currentId)
      return exists ? currentId : fallback.id
    })
  }, [id])

  const carregarMensagens = useCallback(async (conversaId, showErrors = true) => {
    const response = await apiFetch(buildOrdensProxyPath(`${id}/conversas/${conversaId}/mensagens/`))
    if (!response.ok) {
      if (showErrors) {
        setMensagem('Não foi possível carregar as mensagens.')
      }
      return
    }

    const data = await response.json()
    setMensagensChat(data)
  }, [id])

  const carregarTudo = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await carregarOrdem()
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    try {
      await carregarConversas(true)
    } catch (err) {
      setMensagem('A ordem foi carregada, mas o chat nao pode ser inicializado agora.')
    }

    setLoading(false)
  }, [carregarConversas, carregarOrdem])

  useEffect(() => {
    if (!id || !user) return
    carregarTudo()
  }, [id, user, carregarTudo])

  useEffect(() => {
    if (!id || !user || !conversaAtivaId) return

    carregarMensagens(conversaAtivaId, false)
    pollingRef.current = setInterval(() => {
      carregarMensagens(conversaAtivaId, false)
      carregarConversas(false)
    }, 4000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [id, user, conversaAtivaId, carregarConversas, carregarMensagens])

  const handleCandidatar = async () => {
    if (!user?.freelancer) {
      setMensagem('Apenas freelancers podem se candidatar.')
      return
    }

    setCandidatando(true)
    setMensagem('')
    try {
      const response = await apiFetch(buildOrdensProxyPath(`${id}/candidatar/`), {
        method: 'POST',
      })
      const data = await response.json()
      if (!response.ok) {
        setMensagem(data.error || 'Não foi possível se candidatar.')
        return
      }

      setMensagem(data.message)
      await carregarTudo()
    } catch (err) {
      setMensagem('Erro ao enviar candidatura.')
    } finally {
      setCandidatando(false)
    }
  }

  const handleSelecionarFreelancer = async (freelancerId) => {
    setSelecionandoId(freelancerId)
    setMensagem('')
    try {
      const response = await apiFetch(buildOrdensProxyPath(`${id}/selecionar-freelancer/`), {
        method: 'POST',
        body: JSON.stringify({ freelancer_id: freelancerId }),
      })
      const data = await response.json()
      if (!response.ok) {
        setMensagem(data.error || 'Não foi possível selecionar o freelancer.')
        return
      }

      setMensagem(data.message)
      await carregarTudo()
    } catch (err) {
      setMensagem('Erro ao selecionar freelancer.')
    } finally {
      setSelecionandoId(null)
    }
  }

  const handleEnviarMensagem = async (event) => {
    event.preventDefault()
    if (!conversaAtivaId || !textoMensagem.trim()) return

    setEnviandoMensagem(true)
    setMensagem('')
    try {
      const response = await apiFetch(
        buildOrdensProxyPath(`${id}/conversas/${conversaAtivaId}/mensagens/`),
        {
          method: 'POST',
          body: JSON.stringify({ conteudo: textoMensagem.trim() }),
        }
      )
      const data = await response.json()
      if (!response.ok) {
        setMensagem(data.error || 'Não foi possível enviar a mensagem.')
        return
      }

      setTextoMensagem('')
      await carregarMensagens(conversaAtivaId, false)
      await carregarConversas(false)
    } catch (err) {
      setMensagem('Erro ao enviar a mensagem.')
    } finally {
      setEnviandoMensagem(false)
    }
  }

  const isCandidato = () => {
    if (!ordem || !user) return false
    return ordem.freelancers_candidatos?.some((candidato) => candidato.id_usuario === user.id_usuario)
  }

  const isContratante = ordem?.contratante?.id_usuario === user?.id_usuario
  const conversaAtiva = conversas.find((conversa) => conversa.id === conversaAtivaId) || null
  const podeEnviarMensagem = conversaAtiva?.status === 'ativa'

  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <main className={styles.main}>
          <p>Carregando detalhes da ordem...</p>
        </main>
      </div>
    )
  }

  if (error || !ordem) {
    return (
      <div className={styles.container}>
        <Navbar />
        <main className={styles.main}>
          <p className={styles.error}>{error || 'Ordem de serviço não encontrada.'}</p>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.ordemHeader}>
          <h1 className={styles.title}>Ordem de Serviço #{ordem.id_os}</h1>
          <span className={`${styles.status} ${styles[ordem.status]}`}>
            {getStatusLabel(ordem.status)}
          </span>
        </div>

        <div className={styles.ordemContent}>
          <section className={styles.section}>
            <h2>Descrição do Serviço</h2>
            <p>{ordem.descricao_servico}</p>
          </section>

          <section className={styles.section}>
            <h2>Informações Detalhadas</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Valor estimado</span>
                <span className={styles.value}>
                  R$ {parseFloat(ordem.valor_estimado_minimo).toFixed(2)} - R$ {parseFloat(ordem.valor_estimado_maximo).toFixed(2)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Contratante</span>
                <span className={styles.value}>
                  {ordem.contratante?.nome} {ordem.contratante?.sobre_nome}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Status</span>
                <span className={`${styles.statusBadge} ${styles[ordem.status]}`}>{getStatusLabel(ordem.status)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Criada em</span>
                <span className={styles.value}>
                  {new Date(ordem.data_criacao).toLocaleString('pt-BR')}
                </span>
              </div>
              {ordem.freelancer_selecionado && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Freelancer selecionado</span>
                  <span className={styles.value}>
                    {ordem.freelancer_selecionado.nome} {ordem.freelancer_selecionado.sobre_nome}
                  </span>
                </div>
              )}
              {ordem.imagem && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Imagem</span>
                  <img src={ordem.imagem} alt="Imagem da ordem de serviço" className={styles.ordemImage} />
                </div>
              )}
            </div>
          </section>

          {ordem.categorias_necessarias?.length > 0 && (
            <section className={styles.section}>
              <h2>Categorias Necessárias</h2>
              <div className={styles.categorias}>
                {ordem.categorias_necessarias.map((categoria) => (
                  <span key={categoria.id} className={styles.categoria}>
                    {categoria.nome}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className={styles.section}>
            <h2>Candidatos ({ordem.freelancers_candidatos?.length || 0}/7)</h2>
            <div className={styles.candidatos}>
              {ordem.freelancers_candidatos?.length ? (
                ordem.freelancers_candidatos.map((candidato) => {
                  const isSelecionado = ordem.freelancer_selecionado?.id_usuario === candidato.id_usuario
                  return (
                    <div key={candidato.id_usuario} className={styles.candidatoCard}>
                      <div className={styles.candidatoInfo}>
                        <h4>{candidato.nome} {candidato.sobre_nome}</h4>
                        <p>{candidato.email}</p>
                        {candidato.categorias?.length > 0 && (
                          <div className={styles.candidatoCategorias}>
                            {candidato.categorias.map((cat) => (
                              <span key={cat.id} className={styles.categoriaPequena}>
                                {cat.nome}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {isContratante && ordem.status === 'aberta' && (
                        <button
                          className={styles.selectBtn}
                          onClick={() => handleSelecionarFreelancer(candidato.id_usuario)}
                          disabled={selecionandoId === candidato.id_usuario}
                        >
                          {selecionandoId === candidato.id_usuario
                            ? 'Selecionando...'
                            : isSelecionado
                              ? 'Selecionado'
                              : 'Selecionar para iniciar'}
                        </button>
                      )}
                    </div>
                  )
                })
              ) : (
                <p>Nenhum candidato ainda.</p>
              )}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.chatHeader}>
              <div>
                <h2>Chat da Ordem</h2>
                <p className={styles.chatDescription}>
                  Em ordem aberta, cada candidato fala em um canal privado com o contratante. Após iniciar, só o freelancer selecionado continua enviando mensagens.
                </p>
              </div>
            </div>

            <div className={styles.chatLayout}>
              <aside className={styles.chatSidebar}>
                {conversas.length === 0 ? (
                  <p className={styles.emptyChat}>
                    {isContratante
                      ? 'As conversas aparecem quando freelancers se candidatam.'
                      : 'Sua conversa ficará disponível após a candidatura.'}
                  </p>
                ) : (
                  conversas.map((conversa) => (
                    <button
                      key={conversa.id}
                      className={`${styles.conversationButton} ${conversa.id === conversaAtivaId ? styles.conversationButtonActive : ''}`}
                      onClick={() => setConversaAtivaId(conversa.id)}
                    >
                      <strong>
                        {isContratante
                          ? `${conversa.freelancer.nome} ${conversa.freelancer.sobre_nome}`
                          : `${conversa.contratante.nome} ${conversa.contratante.sobre_nome}`}
                      </strong>
                      <span className={styles.conversationMeta}>
                        {conversa.tipo === 'principal' ? 'Chat principal' : 'Chat de candidatura'} · {conversa.status}
                      </span>
                      {conversa.ultima_mensagem && (
                        <span className={styles.conversationPreview}>
                          {conversa.ultima_mensagem.conteudo}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </aside>

              <div className={styles.chatPanel}>
                {conversaAtiva ? (
                  <>
                    <div className={styles.chatMessages}>
                      {mensagensChat.length === 0 ? (
                        <p className={styles.emptyChat}>Nenhuma mensagem ainda.</p>
                      ) : (
                        mensagensChat.map((item) => {
                          const isMine = item.remetente.id_usuario === user?.id_usuario
                          return (
                            <div
                              key={item.id}
                              className={`${styles.messageBubble} ${isMine ? styles.messageMine : styles.messageTheirs}`}
                            >
                              <span className={styles.messageAuthor}>
                                {item.remetente.nome} {item.remetente.sobre_nome}
                              </span>
                              <p>{item.conteudo}</p>
                              <time>{new Date(item.data_envio).toLocaleString('pt-BR')}</time>
                            </div>
                          )
                        })
                      )}
                    </div>

                    <form className={styles.chatForm} onSubmit={handleEnviarMensagem}>
                      <textarea
                        className={styles.chatInput}
                        value={textoMensagem}
                        onChange={(event) => setTextoMensagem(event.target.value)}
                        rows={3}
                        placeholder={podeEnviarMensagem ? 'Digite sua mensagem privada...' : 'Esta conversa está bloqueada para novas mensagens.'}
                        disabled={!podeEnviarMensagem || enviandoMensagem}
                      />
                      <button
                        type="submit"
                        className={styles.sendBtn}
                        disabled={!podeEnviarMensagem || enviandoMensagem || !textoMensagem.trim()}
                      >
                        {enviandoMensagem ? 'Enviando...' : 'Enviar mensagem'}
                      </button>
                    </form>
                  </>
                ) : (
                  <p className={styles.emptyChat}>Selecione uma conversa para visualizar as mensagens.</p>
                )}
              </div>
            </div>
          </section>

          {mensagem && (
            <div className={`${styles.mensagem} ${mensagem.toLowerCase().includes('erro') || mensagem.toLowerCase().includes('não foi') ? styles.erro : styles.sucesso}`}>
              {mensagem}
            </div>
          )}

          {ordem.status === 'aberta' && user?.freelancer && !isContratante && (
            <div className={styles.actions}>
              {isCandidato() ? (
                <button className={styles.candidatadoBtn} disabled>
                  Você já está candidatado
                </button>
              ) : ordem.freelancers_candidatos?.length >= 7 ? (
                <button className={styles.limiteBtn} disabled>
                  Limite de 7 candidatos atingido
                </button>
              ) : (
                <button className={styles.candidatarBtn} onClick={handleCandidatar} disabled={candidatando}>
                  {candidatando ? 'Candidatando...' : 'Candidatar-se'}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
