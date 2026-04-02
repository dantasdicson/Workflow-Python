import styles from './Menu.module.css'

export default function Menu() {
  return (
    <nav className={styles.menu}>
      <div className={styles.menuContainer}>
        <button className={styles.menuButton}>
          Criar Serviço
        </button>
        <button className={styles.menuButton}>
          Meus Serviços
        </button>
        <button className={styles.menuButton}>
          Preciso de ajuda
        </button>
      </div>
    </nav>
  )
}