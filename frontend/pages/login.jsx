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
      <Navbar />
      <main className={styles.main}>
        <h1 className={styles.title}>Entrar</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Login
            <input
              className={styles.input}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className={styles.label}>
            Senha
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <div className={styles.error}>Erro: {error}</div>}

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <button
            className={styles.buttonSecondary}
            type="button"
            onClick={() => router.push('/cadastrarUser')}
            disabled={loading}
          >
            Criar conta
          </button>
        </form>
      </main>
    </div>
  )
}
