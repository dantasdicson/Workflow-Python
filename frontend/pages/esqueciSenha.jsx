import { useState } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Login.module.css'

export default function EsqueciSenha() {
  const router = useRouter()
  const [login, setLogin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      setLoading(true)
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.detail || 'Erro ao solicitar redefinicao de senha')
      }

      setSuccess(data?.detail || 'Se o email ou login estiver cadastrado, enviaremos um link para o email da conta.')
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
            <h2 className={styles.loginTitle}>Esqueci minha senha</h2>
            <p className={styles.loginDescription}>Digite seu email ou login para receber o link no email cadastrado.</p>

            <form className={styles.loginForm} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Email ou Login</label>
                <div className={styles.inputWrapper}>
                  <input
                    className={styles.input}
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    autoComplete="username"
                    placeholder="Digite seu email ou login"
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

              {error && <div className={styles.errorMessage}>{error}</div>}
              {success && <div className={styles.successMessage}>{success}</div>}

              <button className={styles.loginButton} type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar link'}
              </button>

              <button className={styles.registerButton} type="button" onClick={() => router.push('/login')} disabled={loading}>
                Voltar para o login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
