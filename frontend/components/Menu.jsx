import { useRouter } from 'next/router'
import styles from './Menu.module.css'

export default function Menu({ integrated = false }) {
  const router = useRouter()
  const currentPath = router.pathname

  const getButtonClassName = (path) => (
    `${styles.menuButton} ${currentPath === path ? styles.menuButtonActive : ''}`.trim()
  )

  return (
    <nav className={`${styles.menu} ${integrated ? styles.menuIntegrated : ''}`}>
      <div className={`${styles.menuContainer} ${integrated ? styles.menuContainerIntegrated : ''}`}>
        <button className={getButtonClassName('/criarServico')} onClick={() => router.push('/criarServico')}>
          Criar Servico
        </button>
        <button className={getButtonClassName('/meusServicos')} onClick={() => router.push('/meusServicos')}>
          Meus Servicos
        </button>
        <button className={getButtonClassName('/listagemContratantes')} onClick={() => router.push('/listagemContratantes')}>
          Freelancers Disponiveis na plataforma
        </button>
        <button className={getButtonClassName('/AnuncioServico')} onClick={() => router.push('/AnuncioServico')}>
          Meu Portfólio
        </button>
        <button className={styles.menuButton}>
          Preciso de ajuda
        </button>
      </div>
    </nav>
  )
}
