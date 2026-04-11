import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Menu from '../components/Menu'
import styles from '../styles/DetalhesOrdem.module.css'
import { apiFetch } from '../lib/api'
import { getMe } from '../lib/api'

export default function DetalhesOrdem() {
  const router = useRouter()
  const [ordem, setOrdem] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [candidatando, setCandidatando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    // Verificação completa da URL e ID
    console.log('=== INÍCIO DA DEPURAÇÃO ===');
    console.log('URL atual:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Search:', window.location.search);
    
    // Pega o ID da URL
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('id')
    
    console.log('ID extraído da URL:', id);
    console.log('Tipo do ID:', typeof id);
    console.log('ID é nulo?', id === null);
    console.log('ID é undefined?', id === undefined);
    console.log('ID é string vazia?', id === '');
    
    if (!id) {
      console.log('ID não encontrado na URL');
      setError('ID da ordem não encontrado na URL')
      setLoading(false)
      return
    }

    const fetchMe = async () => {
      try {
        console.log('Buscando usuário logado...');
        const me = await getMe()
        console.log('Usuário retornado:', me);
        
        // Permite que usuários não logados vejam os detalhes
        if (me) {
          console.log('Usuário logado, carregando detalhes da ordem:', id);
          setUser(me)
        } else {
          console.log('Usuário não logado, mas permitindo visualização dos detalhes');
        }
        
        // Carrega os detalhes independentemente de estar logado
        carregarDetalhesOrdem(id)
      } catch (err) {
        console.error('Erro ao buscar usuário:', err)
        // Mesmo com erro, tenta carregar os detalhes
        carregarDetalhesOrdem(id)
      }
    }
    fetchMe()
  }, [])

  const carregarDetalhesOrdem = async (ordemId) => {
    try {
      console.log('Iniciando carregamento da ordem:', ordemId);
      console.log('Tipo do ID:', typeof ordemId);
      console.log('ID é válido?', ordemId && !isNaN(ordemId));
      
      const apiUrl = `http://127.0.0.1:8000/api/ordens/${ordemId}`
      console.log('URL completa sendo chamada:', apiUrl);
      
      setLoading(true)
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        })
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response url:', response.url);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log('Ordem não encontrada (404)');
            setError('Ordem de serviço não encontrada')
            return
          }
          if (response.status === 401) {
            console.log('Não autorizado (401), redirecionando para login');
            router.push('/login')
            return
          }
          console.log('Erro na resposta:', response.status);
          throw new Error('Erro ao carregar detalhes da ordem de serviço')
        }

        const data = await response.json()
        console.log('Dados recebidos:', data);
        setOrdem(data)
      } catch (fetchError) {
        console.error('Erro no fetch:', fetchError);
        console.error('Tipo do erro:', fetchError.name);
        console.error('Mensagem do erro:', fetchError.message);
        
        if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
          setError('Erro de conexão com o servidor. Verifique se o backend está rodando.')
        } else {
          setError(fetchError.message || 'Erro ao carregar detalhes da ordem de serviço')
        }
      }
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err);
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCandidatar = async () => {
    console.log('=== INÍCIO DA CANDIDATURA ===')
    console.log('Usuário:', user)
    console.log('É freelancer?', user?.freelancer)
    console.log('Ordem:', ordem)
    console.log('ID da ordem:', ordem?.id_os)
    
    if (!user?.freelancer) {
      console.log('Usuário não é freelancer ou não está logado')
      setMensagem('Apenas freelancers podem se candidatar')
      return
    }

    try {
      setCandidatando(true)
      setMensagem('')
      
      // Primeiro, testar se a autenticação está funcionando
      console.log('=== TESTE DE AUTENTICAÇÃO ===')
      
      // Verificar cookies disponíveis
      console.log('Todos os cookies:', document.cookie)
      
      // Função para extrair cookie
      function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
      }
      
      const accessToken = getCookie('wf_access')
      const refreshToken = getCookie('wf_refresh')
      
      console.log('wf_access encontrado:', !!accessToken)
      console.log('wf_refresh encontrado:', !!refreshToken)
      console.log('wf_access (primeiros 20 chars):', accessToken ? accessToken.substring(0, 20) + '...' : 'null')
      
      if (!accessToken) {
        console.log('ERRO: Token wf_access não encontrado nos cookies')
        setMensagem('Token de autenticação não encontrado. Faça login novamente.')
        return
      }
      
      // Testar endpoint de autenticação primeiro
      console.log('Testando endpoint de autenticação...')
      const authResponse = await fetch('http://127.0.0.1:8000/api/test-auth/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'same-origin'
      })
      
      console.log('Auth response status:', authResponse.status)
      const authData = await authResponse.json()
      console.log('Auth response data:', authData)
      
      if (!authResponse.ok || !authData.authenticated) {
        console.log('ERRO: Autenticação falhou no endpoint de teste')
        setMensagem('Autenticação falhou. Faça login novamente.')
        return
      }
      
      console.log('Autenticação funcionou! Prosseguindo com candidatura...')
      
      // Agora tentar a candidatura
      const apiUrl = `http://127.0.0.1:8000/api/ordens/${ordem.id_os}/candidatar/`
      console.log('URL da candidatura:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        credentials: 'same-origin',
        body: JSON.stringify({})
      })

      console.log('Candidatura response status:', response.status)
      console.log('Candidatura response ok:', response.ok)

      if (!response.ok) {
        console.log('Resposta não OK, status:', response.status)
        
        let errorMessage = `Erro ${response.status}: Não foi possível se candidatar`
        try {
          const errorData = await response.json()
          console.log('Error data:', errorData)
          errorMessage = errorData.error || errorData.detail || errorMessage
        } catch (e) {
          console.log('Não foi possível ler o erro como JSON')
        }
        
        setMensagem(errorMessage)
        return
      }

      const data = await response.json()
      console.log('Resposta de sucesso:', data)
      setMensagem(data.message || 'Candidatura enviada com sucesso!')
      
      // Recarregar os detalhes da ordem para atualizar a lista de candidatos
      setTimeout(() => {
        carregarDetalhesOrdem(ordem.id_os)
      }, 1000)

    } catch (err) {
      console.error('Erro na candidatura:', err)
      console.error('Tipo do erro:', err.name)
      console.error('Mensagem do erro:', err.message)
      setMensagem(`Erro: ${err.message}`)
    } finally {
      setCandidatando(false)
    }
  }

  const isCandidato = () => {
    if (!ordem || !user) return false
    return ordem.freelancers_candidatos?.some(candidato => candidato.id_usuario === user.id_usuario)
  }

  const isSelecionado = () => {
    if (!ordem || !user) return false
    return ordem.freelancer_selecionado?.id_usuario === user.id_usuario
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <Menu />
        <main className={styles.main}>
          <p>Carregando detalhes da ordem de serviço...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Navbar />
        <Menu />
        <main className={styles.main}>
          <p className={styles.error}>Erro: {error}</p>
        </main>
      </div>
    )
  }

  if (!ordem) {
    return (
      <div className={styles.container}>
        <Navbar />
        <Menu />
        <main className={styles.main}>
          <p>Ordem de serviço não encontrada</p>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <Menu />
      <main className={styles.main}>
        <div className={styles.ordemHeader}>
          <h1 className={styles.title}>Ordem de Serviço #{ordem.id_os}</h1>
          <span className={`${styles.status} ${styles[ordem.status]}`}>
            {ordem.status === 'aberta' ? 'Aberta' : 
             ordem.status === 'em_execucao' ? 'Em Execução' : 'Concluída'}
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
                <span className={styles.label}>ID da Ordem:</span>
                <span className={styles.value}>#{ordem.id_os}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Status:</span>
                <span className={`${styles.statusBadge} ${styles[ordem.status]}`}>
                  {ordem.status === 'aberta' ? 'Aberta' : 
                   ordem.status === 'em_execucao' ? 'Em Execução' : 'Concluída'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Valor Estimado:</span>
                <span className={styles.value}>
                  R$ {parseFloat(ordem.valor_estimado_minimo).toFixed(2)} - R$ {parseFloat(ordem.valor_estimado_maximo).toFixed(2)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Contratante:</span>
                <span className={styles.value}>
                  {ordem.contratante?.nome} {ordem.contratante?.sobre_nome}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Email do Contratante:</span>
                <span className={styles.value}>{ordem.contratante?.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Data de Criação:</span>
                <span className={styles.value}>
                  {new Date(ordem.data_criacao).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {ordem.data_conclusao && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Data de Conclusão:</span>
                  <span className={styles.value}>
                    {new Date(ordem.data_conclusao).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              {ordem.freelancer_selecionado && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Freelancer Selecionado:</span>
                  <span className={styles.value}>
                    {ordem.freelancer_selecionado.nome} {ordem.freelancer_selecionado.sobre_nome}
                  </span>
                </div>
              )}
              {ordem.imagem && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Imagem:</span>
                  <span className={styles.value}>
                    <img 
                      src={ordem.imagem} 
                      alt="Imagem da ordem de serviço" 
                      className={styles.ordemImage}
                    />
                  </span>
                </div>
              )}
            </div>
          </section>

          {ordem.categorias_necessarias && ordem.categorias_necessarias.length > 0 && (
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
              {ordem.freelancers_candidatos && ordem.freelancers_candidatos.length > 0 ? (
                ordem.freelancers_candidatos.map((candidato) => (
                  <div key={candidato.id_usuario} className={styles.candidatoCard}>
                    <div className={styles.candidatoInfo}>
                      <h4>{candidato.nome} {candidato.sobre_nome}</h4>
                      <p>{candidato.email}</p>
                      {candidato.categorias && candidato.categorias.length > 0 && (
                        <div className={styles.candidatoCategorias}>
                          {candidato.categorias.map((cat) => (
                            <span key={cat.id} className={styles.categoriaPequena}>
                              {cat.nome}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>Nenhum candidato ainda.</p>
              )}
            </div>
          </section>

          {mensagem && (
            <div className={`${styles.mensagem} ${
              mensagem.includes('sucesso') ? styles.sucesso : styles.erro
            }`}>
              {mensagem}
            </div>
          )}

          {ordem.status === 'aberta' && user?.freelancer && (
            <div className={styles.actions}>
              {isCandidato() ? (
                <button className={styles.candidatadoBtn} disabled>
                  Você já está candidatado
                </button>
              ) : isSelecionado() ? (
                <button className={styles.selecionadoBtn} disabled>
                  Você foi selecionado para esta ordem
                </button>
              ) : ordem.freelancers_candidatos?.length >= 7 ? (
                <button className={styles.limiteBtn} disabled>
                  Limite de 7 candidatos atingido
                </button>
              ) : (
                <button 
                  className={styles.candidatarBtn}
                  onClick={handleCandidatar}
                  disabled={candidatando}
                >
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
