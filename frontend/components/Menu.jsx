import { useRouter } from 'next/router'
import styles from './Menu.module.css'

export default function Menu() {
  const router = useRouter()

  return (
    <nav className={styles.menu}>
      <div className={styles.menuContainer}>
        <button className={styles.menuButton} onClick={() => router.push('/criarServico')}>
          Criar Serviço
        </button>
        <button className={styles.menuButton} onClick={() => router.push('/meusServicos')}>
          Meus Serviços
        </button>
        <button className={styles.menuButton}>
          Preciso de ajuda
        </button>
      </div>
    </nav>
  )
}