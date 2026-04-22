import { useId } from 'react'
import styles from './BrandMark.module.css'

export default function BrandMark({ className = '', title = 'WorkFlow' }) {
  const id = useId().replace(/:/g, '')
  const bgId = `wf-bg-${id}`
  const lineId = `wf-line-${id}`
  const glowId = `wf-glow-${id}`

  return (
    <svg
      className={`${styles.mark} ${className}`}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={bgId} x1="10" y1="7" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f172a" />
          <stop offset="0.48" stopColor="#155e75" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id={lineId} x1="10" y1="47" x2="54" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f8fafc" />
          <stop offset="0.45" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#facc15" />
        </linearGradient>
        <filter id={glowId} x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="2.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect className={styles.shell} x="4" y="4" width="56" height="56" rx="14" fill={`url(#${bgId})`} />
      <path className={styles.gridLine} d="M13 18H51" />
      <path className={styles.gridLine} d="M13 32H51" />
      <path className={styles.gridLine} d="M13 46H51" />
      <path className={styles.gridLine} d="M18 13V51" />
      <path className={styles.gridLine} d="M32 13V51" />
      <path className={styles.gridLine} d="M46 13V51" />

      <path
        className={styles.flowShadow}
        d="M13 18L21 47L32 22L43 47L52 18"
        filter={`url(#${glowId})`}
      />
      <path
        className={styles.flowLine}
        d="M13 18L21 47L32 22L43 47L52 18"
        stroke={`url(#${lineId})`}
      />
      <path className={styles.sparkLine} d="M17 49C25 55 39 55 48 49" />
      <circle className={styles.node} cx="52" cy="18" r="4.5" />
      <circle className={styles.nodeCore} cx="52" cy="18" r="2" />
    </svg>
  )
}
