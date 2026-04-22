import Navbar from '../components/Navbar'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <h1 className={styles.homeTitle}>
          O Workflow foi feito para conectar talentos a oportunidades reais.
        </h1>
        <div className={styles.homeCopy}>
          <p>
            Com referencias como Workana, 99Freelas, GetNinjas, aqui clientes encontram profissionais qualificados para qualquer tipo de servico, com agilidade e seguranca.
          </p>
          <p>
            Freelancers tem acesso a projetos todos os dias e liberdade para trabalhar do seu jeito. Tudo em um ambiente simples e confiavel.
          </p>
          <p className={styles.homeTagline}>
            Workflow: onde projetos e talentos se encontram. <span className={styles.inlineEmoji}>{"\ud83d\udc68\u200d\ud83d\udcbb"}</span>
          </p>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerColumns}>
            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Redes Sociais</h3>
              <ul className={styles.footerList}>
                <li><a href="#">Facebook</a></li>
                <li><a href="#">Instagram</a></li>
                <li><a href="#">WhatsApp</a></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Espaco futuro</h3>
              <ul className={styles.footerList}>
                <li><a href="#">Item futuro 1</a></li>
                <li><a href="#">Item futuro 2</a></li>
                <li><a href="#">Item futuro 3</a></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Espaco futuro</h3>
              <ul className={styles.footerList}>
                <li><a href="#">Item futuro 1</a></li>
                <li><a href="#">Item futuro 2</a></li>
                <li><a href="#">Item futuro 3</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            2026 WorkFlow. Todos os direitos reservados
          </div>
        </div>
      </footer>
    </div>
  )
}
