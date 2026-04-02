import Navbar from '../components/Navbar'
import DashboardPanel from '../components/DashboardPanel'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.loginAlert}>
          <span>Realize login para poder ver serviços em aberto</span>
        </div>
        <h1 className={styles.title}>
          Gerencie serviços com freelancers de forma eficiente
        </h1>
        <DashboardPanel />
      </main>
    </div>
  )
}