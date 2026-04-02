import styles from './Navbar.module.css'

export default function Navbar() {
  return (
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
          <p className={styles.subtitle}>Gerenciamento de serviços</p>
          <h1 className={styles.projectTitle}>WorkFlow Freelancers</h1>
        </div>
      </div>
      <nav>
        <a href="#about">Sobre nós</a>
        <a href="/listarServicos">Ordens de Serviço</a>
        <a href="#dashboard">Meu Painel</a>
        <button className={styles.loginBtn}>Entrar</button>
      </nav>
    </header>
  )
}