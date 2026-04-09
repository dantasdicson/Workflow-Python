import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import styles from '../styles/Login.module.css'

export default function Login() {
  const router = useRouter()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          router.push('/')
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

      await res.json()
      window.location.href = '/listarServicos'
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
                    className={styles.input}
                    type="password"
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
