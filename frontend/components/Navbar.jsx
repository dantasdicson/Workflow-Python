import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Menu from './Menu'
import BrandMark from './BrandMark'
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
            <BrandMark />
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
