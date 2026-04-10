import Navbar from '../components/Navbar'
import styles from '../styles/QuemSomos.module.css'

export default function QuemSomos() {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>{"\ud83c\udfe2"} Quem Somos</h1>
          
          <div className={styles.aboutSection}>
            <div className={styles.aboutContent}>
              <h2 className={styles.subtitle}>Sobre o Workflow</h2>
              <p className={styles.description}>
                O Workflow é uma plataforma que conecta empresas e freelancers de forma prática. 
                Nela, profissionais podem se cadastrar, mostrar suas habilidades e se preparar para realizar serviços.
              </p>
              
              <p className={styles.description}>
                Depois de aprovados, os freelancers podem visualizar e se candidatar às ordens de serviço disponíveis. 
                Assim, têm acesso a novas oportunidades de trabalho, enquanto as empresas encontram profissionais 
                qualificados com mais facilidade.
              </p>
              
              <p className={styles.description}>
                O objetivo do Workflow é organizar e facilitar a contratação de serviços, tornando todo o processo 
                mais rápido, seguro e eficiente para todos os envolvidos.
              </p>
            </div>
          </div>

          <div className={styles.contactSection}>
            <h2 className={styles.contactTitle}>Entre em Contato</h2>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>{"\ud83d\udce7"}</div>
                <div className={styles.contactDetails}>
                  <h3>E-mail</h3>
                  <a href="mailto:contato@workflow.com" className={styles.contactLink}>
                    contato@workflow.com
                  </a>
                </div>
              </div>
              
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>{"\ud83d\udcac"}</div>
                <div className={styles.contactDetails}>
                  <h3>Telefone</h3>
                  <a href="tel:+5511999999999" className={styles.contactLink}>
                    +55 11 99999-9999
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.missionSection}>
            <h2 className={styles.missionTitle}>Nossa Missão</h2>
            <p className={styles.missionDescription}>
              Transformar a forma como empresas e freelancers se conectam, 
              criando um ecossistema digital eficiente, seguro e acessível 
              para todos os profissionais de serviço.
            </p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerColumns}>
            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}><span className={styles.footerIcon}>{"\ud83c\udf10"}</span>Redes Sociais</h3>
              <ul className={styles.footerList}>
                <li><a href="#">Facebook <span className={styles.footerItemIcon}>{"\ud83d\udcd8"}</span></a></li>
                <li><a href="#">Instagram <span className={styles.footerItemIcon}>{"\ud83d\udcf8"}</span></a></li>
                <li><a href="#">WhatsApp <span className={styles.footerItemIcon}>{"\ud83d\udcac"}</span></a></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Espaço futuro</h3>
              <ul className={styles.footerList}>
                <li><a href="#">Item futuro 1</a></li>
                <li><a href="#">Item futuro 2</a></li>
                <li><a href="#">Item futuro 3</a></li>
              </ul>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Espaço futuro</h3>
              <ul className={styles.footerList}>
                <li><a href="#">Item futuro 1</a></li>
                <li><a href="#">Item futuro 2</a></li>
                <li><a href="#">Item futuro 3</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            2026 WorkFlow. Todos os direitos reservados <span className={styles.footerRightIcon}>{"\ud83d\udd12"}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
