import styles from './DashboardPanel.module.css'

export default function DashboardPanel() {
  return (
    <aside className={styles.panel}>
      <h2>Painel operacional</h2>
      <div className={styles.cards}>
        <div className={styles.card}>
          <span>Serviços ativos</span>
          <strong>128</strong>
          <span className={styles.badge}>+18%</span>
        </div>
        <div className={styles.card}>
          <span>Freelancers online</span>
          <strong>46</strong>
          <span className={styles.badge}>em campo</span>
        </div>
        <div className={styles.card}>
          <span>Concluídos no prazo</span>
          <strong>92%</strong>
          <span className={styles.badge}>eficiência</span>
        </div>
        <div className={styles.card}>
          <span>Satisfação média</span>
          <strong>4.9</strong>
          <span className={styles.badge}>excelente</span>
        </div>
      </div>
    </aside>
  )
}