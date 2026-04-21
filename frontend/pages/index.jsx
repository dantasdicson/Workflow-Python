import Navbar from '../components/Navbar'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <h1 className={styles.title}>
          Conecte-se a freelancers e contrate seu serviÃƒÂ§o com rapidez e seguranÃƒÂ§a! {"\ud83d\udc68\u200d\ud83d\udcbb"}
        </h1>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerColumns}>
            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}><span className={styles.footerIcon}>Ã°Å¸Å’Â</span>Redes Sociais</h3>
              <ul className={styles.footerList}>
                <li><a href="#">Facebook <span className={styles.footerItemIcon}>Ã°Å¸â€œËœ</span></a></li>
                <li><a href="#">Instagram <span className={styles.footerItemIcon}>Ã°Å¸â€œÂ·</span></a></li>
                <li><a href="#">WhatsApp <span className={styles.footerItemIcon}>Ã°Å¸â€™Â¬</span></a></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>EspaÃƒÂ§o futuro</h3>
              <ul className={styles.footerList}>
                <li><a href="#">Item futuro 1</a></li>
                <li><a href="#">Item futuro 2</a></li>
                <li><a href="#">Item futuro 3</a></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>EspaÃƒÂ§o futuro</h3>
              <ul className={styles.footerList}>
                <li><a href="#">Item futuro 1</a></li>
                <li><a href="#">Item futuro 2</a></li>
                <li><a href="#">Item futuro 3</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            2026 WorkFlow. Todos os direitos reservados <span className={styles.footerRightIcon}>Ã°Å¸â€â€™</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
