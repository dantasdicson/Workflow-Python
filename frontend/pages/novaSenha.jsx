import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import BrandMark from '../components/BrandMark'
import styles from '../styles/Login.module.css'

export default function NovaSenha() {
  const router = useRouter()
  const [uid, setUid] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const authenticatedMode = router.query.trocarSenha === '1'

  useEffect(() => {
    if (!router.isReady) return

    const queryUid = Array.isArray(router.query.uid) ? router.query.uid[0] : router.query.uid
    const queryToken = Array.isArray(router.query.token) ? router.query.token[0] : router.query.token

    setUid(queryUid || '')
    setToken(queryToken || '')
  }, [router.isReady, router.query.uid, router.query.token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!authenticatedMode && (!uid || !token)) {
      setError('Link de redefinicao invalido. Solicite um novo link.')
      return
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    if (password !== repeatPassword) {
      setError('As senhas nao conferem.')
      return
    }

    try {
      setLoading(true)
      const endpoint = authenticatedMode ? '/api/auth/change-password' : '/api/auth/password-reset-confirm'
      const payload = authenticatedMode ? { password } : { uid, token, password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const detail = Array.isArray(data?.detail) ? data.detail.join(' ') : data?.detail
        throw new Error(detail || 'Erro ao redefinir senha.')
      }

      setSuccess(data?.detail || 'Senha redefinida com sucesso.')
      setPassword('')
      setRepeatPassword('')
      setTimeout(() => router.push(authenticatedMode ? '/meuPainel' : '/login'), 1800)
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
                <BrandMark />
              </div>
              <h1 className={styles.brandName}>WorkFlow</h1>
            </div>
          </div>

          <div className={styles.loginBody}>
            <h2 className={styles.loginTitle}>Cadastrar nova senha</h2>
            <p className={styles.loginDescription}>
              {authenticatedMode
                ? 'Digite e confirme sua nova senha.'
                : 'Digite e confirme sua nova senha para acessar sua conta.'}
            </p>

            <form className={styles.loginForm} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Nova senha</label>
                <div className={styles.inputWrapper}>
                  <input
                    className={`${styles.input} ${styles.inputWithAction}`}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Digite a nova senha"
                    required
                  />
                  <div className={styles.inputIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <button
                    className={styles.passwordToggle}
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'}
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

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Repetir nova senha</label>
                <div className={styles.inputWrapper}>
                  <input
                    className={`${styles.input} ${styles.inputWithAction}`}
                    type={showRepeatPassword ? 'text' : 'password'}
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Repita a nova senha"
                    required
                  />
                  <div className={styles.inputIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <button
                    className={styles.passwordToggle}
                    type="button"
                    onClick={() => setShowRepeatPassword((current) => !current)}
                    aria-label={showRepeatPassword ? 'Ocultar repeticao da senha' : 'Mostrar repeticao da senha'}
                  >
                    {showRepeatPassword ? (
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
              {success && <div className={styles.successMessage}>{success}</div>}

              <button className={styles.loginButton} type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Cadastrar nova senha'}
              </button>

              <button className={styles.registerButton} type="button" onClick={() => router.push(authenticatedMode ? '/meuPainel' : '/login')} disabled={loading}>
                {authenticatedMode ? 'Voltar para Meu Painel' : 'Voltar para o login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
