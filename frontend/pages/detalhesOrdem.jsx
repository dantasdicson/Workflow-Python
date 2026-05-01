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
  if (status === 'em_execucao') return 'Em execucao'
  if (status === 'finalizado') return 'Finalizado'
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
  const [finalizando, setFinalizando] = useState(false)
  const [avaliandoContratante, setAvaliandoContratante] = useState(false)
  const [avaliacaoFinal, setAvaliacaoFinal] = useState({
    nota_freelancer: '5',
    nota_plataforma: '5',
    comentario: '',
  })
  const [avaliacaoContratante, setAvaliacaoContratante] = useState({
    nota_contratante: '5',
    comentario: '',
  })
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

  const handleFinalizarServico = async (event) => {
    event.preventDefault()
    setFinalizando(true)
    setMensagem('')
    try {
      const response = await apiFetch(buildOrdensProxyPath(`${id}/finalizar-servico/`), {
        method: 'POST',
        body: JSON.stringify({
          nota_freelancer: Number(avaliacaoFinal.nota_freelancer),
          nota_plataforma: Number(avaliacaoFinal.nota_plataforma),
          comentario: avaliacaoFinal.comentario,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setMensagem(data.error || 'Nao foi possivel finalizar a ordem.')
        return
      }

      setMensagem(data.message)
      await carregarTudo()
    } catch (err) {
      setMensagem('Erro ao finalizar a ordem.')
    } finally {
      setFinalizando(false)
    }
  }

  const handleAvaliarContratante = async (event) => {
    event.preventDefault()
    setAvaliandoContratante(true)
    setMensagem('')
    try {
      const response = await apiFetch(buildOrdensProxyPath(`${id}/avaliar-contratante/`), {
        method: 'POST',
        body: JSON.stringify({
          nota_contratante: Number(avaliacaoContratante.nota_contratante),
          comentario: avaliacaoContratante.comentario,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setMensagem(data.error || 'Nao foi possivel registrar a avaliacao.')
        return
      }

      setMensagem(data.message)
      await carregarTudo()
    } catch (err) {
      setMensagem('Erro ao registrar avaliacao.')
    } finally {
      setAvaliandoContratante(false)
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

  const abrirPerfilUsuario = (usuario, event) => {
    if (event) {
      event.stopPropagation()
    }

    if (!usuario?.id_usuario) {
      setMensagem('Nao foi possivel abrir o perfil deste usuario.')
      return
    }

    router.push(`/perfilUsuario?id=${usuario.id_usuario}`)
  }

  const isCandidato = () => {
    if (!ordem || !user) return false
    return ordem.freelancers_candidatos?.some((candidato) => candidato.id_usuario === user.id_usuario)
  }

  const isContratante = ordem?.contratante?.id_usuario === user?.id_usuario
  const isFreelancerSelecionado = ordem?.freelancer_selecionado?.id_usuario === user?.id_usuario
  const contratanteJaAvaliou = ordem?.avaliacoes?.some((avaliacao) => avaliacao.avaliador_tipo === 'contratante')
  const freelancerJaAvaliou = ordem?.avaliacoes?.some((avaliacao) => avaliacao.avaliador_tipo === 'freelancer')
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
                <button
                  type="button"
                  className={styles.profileLink}
                  onClick={() => abrirPerfilUsuario(ordem.contratante)}
                >
                  {ordem.contratante?.nome} {ordem.contratante?.sobre_nome}
                </button>
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
                  <button
                    type="button"
                    className={styles.profileLink}
                    onClick={() => abrirPerfilUsuario(ordem.freelancer_selecionado)}
                  >
                    {ordem.freelancer_selecionado.nome} {ordem.freelancer_selecionado.sobre_nome}
                  </button>
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
                        <button
                          type="button"
                          className={styles.candidatoName}
                          onClick={() => abrirPerfilUsuario(candidato)}
                        >
                          {candidato.nome} {candidato.sobre_nome}
                        </button>
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
                      <button
                        type="button"
                        className={styles.profileButton}
                        onClick={() => abrirPerfilUsuario(candidato)}
                      >
                        Ver perfil
                      </button>
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
                  conversas.map((conversa) => {
                    const participante = isContratante ? conversa.freelancer : conversa.contratante

                    return (
                      <div
                        key={conversa.id}
                        role="button"
                        tabIndex={0}
                        className={`${styles.conversationButton} ${conversa.id === conversaAtivaId ? styles.conversationButtonActive : ''}`}
                        onClick={() => setConversaAtivaId(conversa.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            setConversaAtivaId(conversa.id)
                          }
                        }}
                      >
                        <div className={styles.conversationTop}>
                          <strong>{participante.nome} {participante.sobre_nome}</strong>
                          <button
                            type="button"
                            className={styles.conversationProfileLink}
                            onClick={(event) => abrirPerfilUsuario(participante, event)}
                          >
                            Ver perfil
                          </button>
                        </div>
                        <span className={styles.conversationMeta}>
                          {conversa.tipo === 'principal' ? 'Chat principal' : 'Chat de candidatura'} · {conversa.status}
                        </span>
                        {conversa.ultima_mensagem && (
                          <span className={styles.conversationPreview}>
                            {conversa.ultima_mensagem.conteudo}
                          </span>
                        )}
                      </div>
                    )
                  })
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

          {isContratante && ordem.status === 'em_execucao' && !contratanteJaAvaliou && (
            <section className={styles.section}>
              <h2>Finalizar servico</h2>
              <form className={styles.chatForm} onSubmit={handleFinalizarServico}>
                <label>
                  Nota do profissional
                  <select
                    className={styles.chatInput}
                    value={avaliacaoFinal.nota_freelancer}
                    onChange={(event) => setAvaliacaoFinal((prev) => ({ ...prev, nota_freelancer: event.target.value }))}
                  >
                    {[0, 1, 2, 3, 4, 5].map((nota) => <option key={nota} value={nota}>{nota} estrelas</option>)}
                  </select>
                </label>
                <label>
                  Nota da plataforma
                  <select
                    className={styles.chatInput}
                    value={avaliacaoFinal.nota_plataforma}
                    onChange={(event) => setAvaliacaoFinal((prev) => ({ ...prev, nota_plataforma: event.target.value }))}
                  >
                    {[0, 1, 2, 3, 4, 5].map((nota) => <option key={nota} value={nota}>{nota} estrelas</option>)}
                  </select>
                </label>
                <textarea
                  className={styles.chatInput}
                  rows={3}
                  value={avaliacaoFinal.comentario}
                  onChange={(event) => setAvaliacaoFinal((prev) => ({ ...prev, comentario: event.target.value }))}
                  placeholder="Feedback do servico"
                />
                <button className={styles.sendBtn} type="submit" disabled={finalizando}>
                  {finalizando ? 'Finalizando...' : 'Finalizar servico'}
                </button>
              </form>
            </section>
          )}

          {isFreelancerSelecionado && ordem.status === 'finalizado' && !freelancerJaAvaliou && (
            <section className={styles.section}>
              <h2>Avaliar contratante</h2>
              <form className={styles.chatForm} onSubmit={handleAvaliarContratante}>
                <label>
                  Nota do contratante
                  <select
                    className={styles.chatInput}
                    value={avaliacaoContratante.nota_contratante}
                    onChange={(event) => setAvaliacaoContratante((prev) => ({ ...prev, nota_contratante: event.target.value }))}
                  >
                    {[0, 1, 2, 3, 4, 5].map((nota) => <option key={nota} value={nota}>{nota} estrelas</option>)}
                  </select>
                </label>
                <textarea
                  className={styles.chatInput}
                  rows={3}
                  value={avaliacaoContratante.comentario}
                  onChange={(event) => setAvaliacaoContratante((prev) => ({ ...prev, comentario: event.target.value }))}
                  placeholder="Feedback sobre o contratante"
                />
                <button className={styles.sendBtn} type="submit" disabled={avaliandoContratante}>
                  {avaliandoContratante ? 'Salvando...' : 'Salvar avaliacao'}
                </button>
              </form>
            </section>
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
