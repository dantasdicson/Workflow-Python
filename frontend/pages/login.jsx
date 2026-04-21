import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import styles from '../styles/Login.module.css'

export default function Login() {
  const router = useRouter()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          router.push('/index')
        }
      } catch (e) {
        // não autenticado, continua na página de login
      }
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      setLoading(true)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      })

      if (!res.ok) {
        let detail = 'Login inválido'
        try {
          const data = await res.json()
          if (data?.detail) detail = data.detail
        } catch (e) {
          // ignore
        }
        throw new Error(detail)
      }

      const data = await res.json()
      
      console.log('=== Login Debug COMPLETO ===')
      console.log('Status da resposta:', res.status)
      console.log('Dados recebidos:', data)
      console.log('Login successful:', data.ok)
      console.log('Tem access?', !!data.access)
      console.log('Tem refresh?', !!data.refresh)
      console.log('Access token (primeiros 20 chars):', data.access ? data.access.substring(0, 20) + '...' : 'null')
      console.log('Refresh token (primeiros 20 chars):', data.refresh ? data.refresh.substring(0, 20) + '...' : 'null')
      
      // Armazenar tokens no localStorage como fallback
      if (data.access && data.refresh) {
        localStorage.setItem('wf_access', data.access)
        localStorage.setItem('wf_refresh', data.refresh)
        console.log('✅ Tokens armazenados no localStorage como fallback')
        console.log('Verificando se foi salvo:', localStorage.getItem('wf_access') ? 'SIM' : 'NÃO')
      } else {
        console.log('❌ Tokens não encontrados na resposta!')
      }
      console.log('Login realizado com sucesso, redirecionando...')
      
      // Pequeno delay para garantir que os cookies sejam definidos
      setTimeout(() => {
        window.location.href = '/listarServicos'
      }, 100)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginWrapper}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <div className={styles.logoSection}>
              <div className={styles.logo}>
                <svg viewBox="0 0 32 35" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="35" rx="7" fill="#2563eb"/>
                  <path d="M6 27 L10 13 L13 21 L16 13 L19 21 L22 13 L26 27" 
                        stroke="white" 
                        strokeWidth="3" 
                        fill="none" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className={styles.brandName}>WorkFlow</h1>
            </div>
          </div>

          <div className={styles.loginBody}>
            <h2 className={styles.loginTitle}>Bem-vindo de volta</h2>
            <p className={styles.loginDescription}>Entre na sua conta para continuar</p>

            <form className={styles.loginForm} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Login</label>
                <div className={styles.inputWrapper}>
                  <input
                    className={styles.input}
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    autoComplete="username"
                    placeholder="Digite seu login"
                    required
                  />
                  <div className={styles.inputIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Senha</label>
                <div className={styles.inputWrapper}>
                  <input
                    className={`${styles.input} ${styles.inputWithAction}`}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    required
                  />
                  <div className={styles.inputIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <circle cx="12" cy="16" r="1"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <button
                    className={styles.passwordToggle}
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12a11.2 11.2 0 0 1 5.06-5.94"/>
                        <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58"/>
                        <path d="M9.9 4.24A10.86 10.86 0 0 1 12 4c5 0 9.27 3.11 11 8a11.47 11.47 0 0 1-2.22 3.38"/>
                        <path d="M1 1l22 22"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && <div className={styles.errorMessage}>{error}</div>}

              <button className={styles.loginButton} type="submit" disabled={loading}>
                {loading ? (
                  <span className={styles.buttonLoader}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>

              <div className={styles.divider}>
                <span>ou</span>
              </div>

              <button
                className={styles.registerButton}
                type="button"
                onClick={() => router.push('/cadastrarUser')}
                disabled={loading}
              >
                Criar nova conta
              </button>

              <button
                className={styles.forgotButton}
                type="button"
                onClick={() => router.push('/esqueciSenha')}
                disabled={loading}
              >
                Esqueci minha senha
              </button>
            </form>
          </div>

          <div className={styles.loginFooter}>
            <p className={styles.footerText}>
              © 2026 WorkFlow Freelancers. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
