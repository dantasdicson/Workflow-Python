import { useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Login.module.css'

export default function RedefinirSenha() {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return

    const uid = Array.isArray(router.query.uid) ? router.query.uid[0] : router.query.uid
    const token = Array.isArray(router.query.token) ? router.query.token[0] : router.query.token
    const query = new URLSearchParams()

    if (uid) query.set('uid', uid)
    if (token) query.set('token', token)

    router.replace(`/novaSenha${query.toString() ? `?${query.toString()}` : ''}`)
  }, [router])

  return (
    <div className={styles.container}>
      <div className={styles.loginWrapper}>
        <div className={styles.loginCard}>
          <div className={styles.loginBody}>
            <h2 className={styles.loginTitle}>Redirecionando...</h2>
            <p className={styles.loginDescription}>Abrindo a pagina para cadastrar sua nova senha.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
