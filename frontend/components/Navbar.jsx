import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Menu from './Menu'
import BrandMark from './BrandMark'
import styles from './Navbar.module.css'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationsRef = useRef(null)
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

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    let cancelled = false

    const loadNotifications = async () => {
      try {
        const res = await fetch('/api/notificacoes')
        if (!res.ok) return

        const data = await res.json()
        if (cancelled) return

        setNotifications(data.results || [])
        setUnreadCount(data.unread_count || 0)
      } catch (e) {
        // Ignora erro de leitura das notificacoes.
      }
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 15000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!notificationsRef.current?.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
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

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.lida) {
        await fetch(`/api/notificacoes/${notification.id}/marcar-lida`, { method: 'POST' })
        setNotifications((prev) => prev.map((item) => (
          item.id === notification.id ? { ...item, lida: true } : item
        )))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (e) {
      // Segue navegacao mesmo com falha para marcar leitura.
    }

    setNotificationsOpen(false)

    if (notification.ordem_servico_id) {
      router.push(`/detalhesOrdem?id=${notification.ordem_servico_id}`)
      return
    }

    router.push('/meuPainel')
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.topBar}>
        <div className={styles.logoArea}>
          <div className={styles.logoContainer}>
            <BrandMark />
          </div>
          <div>
            <p className={styles.subtitle}>Gerenciamento de servi&ccedil;os</p>
            <h1 className={styles.projectTitle}>WorkFlow Freelancers</h1>
          </div>
        </div>

        <div className={styles.rightSide}>
          <nav className={styles.primaryNav}>
            <div className={styles.navLinks}>
              <Link href="/index" onClick={handleHomeClick}>P&aacute;gina Inicial</Link>
              <Link href="/quemSomos">Sobre n&oacute;s</Link>
              <Link href="/listarServicos">Ordens de Servi&ccedil;o</Link>
              <Link href="/listagemContratantes">Freelancers Disponiveis na plataforma</Link>
              {user && <Link href="/meuPainel">Meu Painel</Link>}
            </div>
          </nav>

          <div className={styles.userRow}>
            {user && (
              <div className={styles.userIdentity}>
                <span className={styles.welcome}>Ol&aacute;, {user.nome}</span>

                <div className={styles.notificationsWrap} ref={notificationsRef}>
                  <button
                    className={styles.notificationsBtn}
                    type="button"
                    onClick={() => setNotificationsOpen((value) => !value)}
                    aria-label="Abrir notificacoes"
                  >
                    <svg className={styles.bellIcon} viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M12 4.75a4 4 0 0 0-4 4v1.18c0 .95-.3 1.87-.86 2.64l-1.02 1.41a1.75 1.75 0 0 0 1.42 2.77h8.92a1.75 1.75 0 0 0 1.42-2.77l-1.02-1.41A4.5 4.5 0 0 1 16 9.93V8.75a4 4 0 0 0-4-4Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.25 18.5a1.9 1.9 0 0 0 3.5 0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                    {unreadCount > 0 && (
                      <span className={styles.notificationsBadge}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className={styles.notificationsPanel}>
                      <div className={styles.notificationsHeader}>
                        <strong>Notificacoes</strong>
                        <span>{unreadCount} nao lidas</span>
                      </div>

                      <div className={styles.notificationsList}>
                        {notifications.length === 0 ? (
                          <p className={styles.notificationsEmpty}>Nenhuma notificacao no momento.</p>
                        ) : (
                          notifications.slice(0, 8).map((notification) => (
                            <button
                              key={notification.id}
                              type="button"
                              className={`${styles.notificationItem} ${notification.lida ? styles.notificationRead : styles.notificationUnread}`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <span className={styles.notificationTitle}>{notification.titulo}</span>
                              <span className={styles.notificationMessage}>{notification.mensagem}</span>
                              <span className={styles.notificationDate}>
                                {new Date(notification.data_criacao).toLocaleString('pt-BR')}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!loading && (
              user ? (
                <button className={styles.logoutBtn} onClick={handleLogout}>Sair</button>
              ) : (
                <Link className={styles.loginBtn} href="/login">Entrar</Link>
              )
            )}
          </div>
        </div>
      </div>

      {showMenu && (
        <div className={styles.bottomRail}>
          <Menu integrated />
        </div>
      )}
    </header>
  )
}
