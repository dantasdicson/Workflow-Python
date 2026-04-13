import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import styles from '../styles/CriarServico.module.css'
import { apiFetch, getMe } from '../lib/api'

export default function CriarServico() {
  console.log('=== COMPONENTE CriarServico RENDERIZADO ===')
  
  const router = useRouter()
  const [form, setForm] = useState({
    descricao_servico: '',
    valor_estimado_minimo: '',
    valor_estimado_maximo: '',
    imagem: null,
    categorias_necessarias: [],
  })
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [categoriasLoading, setCategoriasLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    verificarAutenticacao()
  }, [])

  const verificarAutenticacao = async () => {
    try {
      setAuthLoading(true)
      const me = await getMe()
      
      if (!me) {
        setAuthError('Você precisa estar logado para criar uma Ordem de Serviço')
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push('/login')
        }, 3000)
        return
      }
      
      setUser(me)
      // Se usuário estiver logado, carregar categorias
      carregarCategorias()
    } catch (err) {
      console.error('Erro ao verificar autenticação:', err)
      setAuthError('Erro ao verificar autenticação. Tente novamente.')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } finally {
      setAuthLoading(false)
    }
  }

  const carregarCategorias = async () => {
    try {
      setCategoriasLoading(true)
      const response = await fetch('http://127.0.0.1:8000/api/categorias/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Erro ao carregar categorias')
      }
      const data = await response.json()
      console.log('Dados recebidos da API de categorias:', data)
      console.log('Tipo dos dados:', typeof data)
      console.log('É array?', Array.isArray(data))
      
      // Garantir que categorias seja sempre um array
      const categoriasArray = Array.isArray(data) ? data : (data.results || [])
      console.log('Array final:', categoriasArray)
      
      setCategorias(categoriasArray)
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
      setError('Erro ao carregar categorias disponíveis')
      setCategorias([]) // Garantir que seja array vazio em caso de erro
    } finally {
      setCategoriasLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'imagem') {
      setForm({ ...form, imagem: files[0] })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleCategoriaChange = (categoriaId) => {
    const categoriaIdNum = parseInt(categoriaId)
    setForm(prevForm => {
      const categoriasAtuais = prevForm.categorias_necessarias || []
      const novasCategorias = categoriasAtuais.includes(categoriaIdNum)
        ? categoriasAtuais.filter(id => id !== categoriaIdNum)
        : [...categoriasAtuais, categoriaIdNum]
      return { ...prevForm, categorias_necessarias: novasCategorias }
    })
  }

  const handleSubmit = async (e) => {
    console.log('=== handleSubmit CHAMADO ===')
    
    try {
      e.preventDefault()
      console.log('preventDefault funcionou')
      
      if (!user || !user.id_usuario) {
        setError('Usuário não autenticado')
        return
      }
      
      setLoading(true)
      setError(null)
      
      // Preparar dados para enviar
      const formData = new FormData()
      formData.append('descricao_servico', form.descricao_servico)
      formData.append('valor_estimado_minimo', form.valor_estimado_minimo)
      formData.append('valor_estimado_maximo', form.valor_estimado_maximo)
      formData.append('contratante_id', user.id_usuario) // Enviando ID do usuário como contratante
      
      if (form.imagem) {
        formData.append('imagem', form.imagem)
      }
      
      // Enviar categorias
      if (form.categorias_necessarias && form.categorias_necessarias.length > 0) {
        form.categorias_necessarias.forEach(categoriaId => {
          formData.append('categorias_necessarias', categoriaId)
        })
      }
      
      console.log('Enviando dados:', {
        descricao: form.descricao_servico,
        valorMin: form.valor_estimado_minimo,
        valorMax: form.valor_estimado_maximo,
        contratante_id: user.id_usuario,
        categorias: form.categorias_necessarias
      })
      
      console.log('=== DEBUG REQUISIÇÃO ===')
      console.log('URL: http://127.0.0.1:8000/api/ordens/')
      console.log('Método: POST')
      console.log('FormData entries:')
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value)
      }
      console.log('=== FIM DEBUG REQUISIÇÃO ===')
      
      // Extrair token JWT dos cookies para autenticação manual
      function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
      }
      
      const token = getCookie('wf_access');
      console.log('Token JWT encontrado:', !!token);
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Header Authorization adicionado');
      } else {
        console.log('ERRO: Token wf_access não encontrado nos cookies');
        console.log('Cookies disponíveis:', document.cookie);
      }
      
      const response = await fetch('http://127.0.0.1:8000/api/ordens/', {
        method: 'POST',
        body: formData,
        headers: headers,
        mode: 'cors',
        credentials: 'include'
      })
      
      if (!response.ok) {
        console.log('=== ERRO NA RESPOSTA ===')
        console.log('Status:', response.status)
        console.log('Status Text:', response.statusText)
        
        try {
          const errorData = await response.json()
          console.log('Error Data:', JSON.stringify(errorData, null, 2))
          
          // Tentar diferentes campos de erro
          const errorMessage = errorData.error || errorData.detail || errorData.message || JSON.stringify(errorData)
          console.log('Mensagem de erro:', errorMessage)
          throw new Error(errorMessage)
        } catch (jsonError) {
          console.log('Erro ao fazer parse do JSON:', jsonError)
          const text = await response.text()
          console.log('Resposta como texto:', text)
          throw new Error(text || 'Erro ao criar ordem de serviço')
        }
      }
      
      const data = await response.json()
      console.log('Ordem criada com sucesso:', data)
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/meusServicos')
      }, 2000)
      
    } catch (error) {
      console.error('ERRO NO handleSubmit:', error)
      setError(error.message || 'Erro ao criar ordem de serviço')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <h1 className={styles.title}>Criar Ordem de Serviço</h1>

        {authLoading && (
          <div className={styles.loadingContainer}>
            <p>Verificando autenticação...</p>
          </div>
        )}

        {authError && (
          <div className={styles.authErrorContainer}>
            <div className={styles.authErrorIcon}>{"\ud83d\udd12"}</div>
            <h2>Acesso Restrito</h2>
            <p>{authError}</p>
            <p className={styles.redirectMessage}>
              Você será redirecionado para a página de login em instantes...
            </p>
            <button 
              className={styles.redirectButton}
              onClick={() => router.push('/login')}
            >
              Ir para Login Agora
            </button>
          </div>
        )}

        {!authLoading && !authError && user && (
          <>
        {success && (
        <div className={styles.successModal}>
          <div className={styles.successContent}>
            <div className={styles.successIcon}>{"\u2713"}</div>
            <h2 className={styles.successTitle}>Ordem Criada com Sucesso!</h2>
            <p className={styles.successMessage}>
              Sua ordem de serviço foi publicada e agora está disponível para freelancers visualizarem e se candidatarem.
            </p>
            <div className={styles.successDetails}>
              <p><strong>ID da Ordem:</strong> Será exibido na página de listagem</p>
              <p><strong>Status:</strong> Aguardando candidatos</p>
            </div>
            <div className={styles.redirectInfo}>
              <div className={styles.loadingSpinner}></div>
              <p>Redirecionando para a lista de serviços...</p>
            </div>
          </div>
        </div>
      )}

        {error && <div className={styles.error}>Erro: {error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Descrição do serviço *
            <textarea
              className={styles.textarea}
              name="descricao_servico"
              value={form.descricao_servico}
              onChange={handleChange}
              required
            />
          </label>

          <div className={styles.row}>
            <label className={styles.label}>
              Valor estimado mínimo *
              <input
                className={styles.input}
                type="number"
                step="0.01"
                name="valor_estimado_minimo"
                value={form.valor_estimado_minimo}
                onChange={handleChange}
                required
              />
            </label>

            <label className={styles.label}>
              Valor estimado máximo *
              <input
                className={styles.input}
                type="number"
                step="0.01"
                name="valor_estimado_maximo"
                value={form.valor_estimado_maximo}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label className={styles.label}>
            Imagem (opcional)
            <input
              className={styles.fileInput}
              type="file"
              name="imagem"
              accept="image/*"
              onChange={handleChange}
            />
          </label>

          <label className={styles.label}>
            Categorias necessárias *
            <div className={styles.categoriasContainer}>
              {categoriasLoading ? (
                <p>Carregando categorias...</p>
              ) : categorias.length === 0 ? (
                <p>Nenhuma categoria disponível.</p>
              ) : (
                categorias.map((categoria) => (
                  <div key={categoria.id} className={styles.categoriaCheckbox}>
                    <input
                      type="checkbox"
                      id={`categoria-${categoria.id}`}
                      value={categoria.id}
                      checked={form.categorias_necessarias.includes(categoria.id)}
                      onChange={() => handleCategoriaChange(categoria.id)}
                    />
                    <label htmlFor={`categoria-${categoria.id}`} className={styles.categoriaLabel}>
                      {categoria.nome}
                    </label>
                  </div>
                ))
              )}
            </div>
            {form.categorias_necessarias.length === 0 && (
              <p className={styles.warning}>Selecione pelo menos uma categoria.</p>
            )}
          </label>

          <button 
            className={styles.button} 
            type="submit" 
            disabled={loading}
            onClick={(e) => {
              console.log('=== BOTÃO CLICADO - onClick ===')
              console.log('Loading state:', loading)
              console.log('Form data:', form)
            }}
          >
            {loading ? 'Criando...' : 'Criar Ordem'}
          </button>
        </form>
          </>
        )}
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
