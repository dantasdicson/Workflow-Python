import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Menu from './Menu'
import styles from './Navbar.module.css'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const hideMenuRoutes = ['/cadastrarUser', '/cadastrarUsuario']
  const currentPath = router.asPath.split('?')[0]
  const isHomePage = currentPath === '/index' || router.pathname === '/'
  const showMenu = !hideMenuRoutes.includes(router.pathname) && (!isHomePage || Boolean(user))

  const handleHomeClick = (e) => {
    if (currentPath === '/index') {
      e.preventDefault()
      return
    }

    router.push('/index')
  }

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me', { method: 'GET' })
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        }
      } catch (e) {
        // Usuario nao logado ou erro de sessao.
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/index')
    } catch (e) {
      setUser(null)
      router.push('/index')
    }
  }

  return (
    <>
      <header className={styles.navbar}>
        <div className={styles.logoArea}>
          <div className={styles.logoContainer}>
            <svg viewBox="0 0 32 35" width="56" height="56" className={styles.logoSvg} xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="35" rx="7" fill="#18181b"/>
              <path d="M4 8L10 28L16 8L22 28L28 8" stroke="url(#wgrad)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="wgrad" x1="4" y1="8" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f8fafc"/>
                  <stop offset="0.5" stopColor="#cbd5e1"/>
                  <stop offset="1" stopColor="#94a3b8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <p className={styles.subtitle}>Gerenciamento de servi&ccedil;os</p>
            <h1 className={styles.projectTitle}>WorkFlow Freelancers</h1>
          </div>
        </div>
        <nav>
          <div className={styles.navLinks}>
            <Link href="/index" onClick={handleHomeClick}>P&aacute;gina Inicial</Link>
            <Link href="/quemSomos">Sobre n&oacute;s</Link>
            <Link href="/listarServicos">Ordens de Servi&ccedil;o</Link>
            {user && <Link href="/meuPainel">Meu Painel</Link>}
          </div>
          <div className={styles.userRow}>
            {user && <span className={styles.welcome}>Ol&aacute;, {user.nome}</span>}
            {!loading && (
              user ? (
                <button className={styles.logoutBtn} onClick={handleLogout}>Sair</button>
              ) : (
                <Link className={styles.loginBtn} href="/login">Entrar</Link>
              )
            )}
          </div>
        </nav>
      </header>
      {showMenu && <Menu />}
    </>
  )
}
