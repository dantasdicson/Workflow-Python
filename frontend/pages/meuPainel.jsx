import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import homeStyles from '../styles/Home.module.css'
import styles from '../styles/MeuPainel.module.css'

const initialForm = {
  login: '',
  nome: '',
  sobre_nome: '',
  email: '',
  data_nascimento: '',
  num_tel: '',
  whatsapp: false,
  cpf: '',
}

const normalizeUser = (data = {}) => ({
  login: data.login || data.username || '',
  nome: data.nome || data.first_name || '',
  sobre_nome: data.sobre_nome || data.sobrenome || data.last_name || '',
  email: data.email || '',
  data_nascimento: String(data.data_nascimento || data.dataNascimento || '').slice(0, 10),
  num_tel: data.num_tel || data.telefone || data.phone || '',
  whatsapp: Boolean(data.whatsapp),
  cpf: data.cpf || '',
})

const getApiErrorMessage = (data) => {
  if (!data) return null
  if (typeof data.detail === 'string') return data.detail

  const firstFieldError = Object.values(data).find((value) => Array.isArray(value) && value.length > 0)
  if (firstFieldError) return firstFieldError.join(' ')

  return null
}

export default function MeuPainel() {
  const router = useRouter()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/auth/me')

        if (res.status === 401) {
          router.push('/login')
          return
        }

        if (!res.ok) {
          throw new Error('Erro ao carregar dados do usuario.')
        }

        const data = await res.json()
        setForm(normalizeUser(data))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      setSaving(true)
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          sobre_nome: form.sobre_nome,
          email: form.email,
          data_nascimento: form.data_nascimento || null,
          num_tel: form.num_tel,
          whatsapp: form.whatsapp,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data) || 'Erro ao salvar alteracoes.')
      }

      setForm(normalizeUser(data))
      setEditing(false)
      setSuccess('Dados salvos com sucesso.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={homeStyles.container}>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.panel}>
          <div className={styles.headerRow}>
            <div>
              <p className={styles.kicker}>Meu Painel</p>
              <h1 className={styles.title}>Dados da conta</h1>
            </div>
            <button
              className={styles.editButton}
              type="button"
              onClick={() => {
                setEditing((value) => !value)
                setSuccess(null)
                setError(null)
              }}
              aria-label={editing ? 'Cancelar edicao' : 'Editar dados'}
            >
              <span aria-hidden="true">{editing ? 'X' : 'Editar'}</span>
            </button>
            <button
              className={styles.passwordButton}
              type="button"
              onClick={() => router.push('/novaSenha?trocarSenha=1')}
            >
              Trocar senha
            </button>
          </div>

          {loading ? (
            <div className={styles.message}>Carregando dados...</div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.grid}>
                <label className={styles.label}>
                  Login
                  <input className={styles.input} value={form.login} disabled placeholder="Nao informado" required />
                </label>

                <label className={styles.label}>
                  Email
                  <input className={styles.input} type="email" value={form.email} onChange={handleChange('email')} disabled={!editing || saving} placeholder="Nao informado" required />
                </label>

                <label className={styles.label}>
                  Nome
                  <input className={styles.input} value={form.nome} onChange={handleChange('nome')} disabled={!editing || saving} placeholder="Nao informado" required />
                </label>

                <label className={styles.label}>
                  Sobrenome
                  <input className={styles.input} value={form.sobre_nome} onChange={handleChange('sobre_nome')} disabled={!editing || saving} placeholder="Nao informado" />
                </label>

                <label className={styles.label}>
                  Data de nascimento
                  <input className={styles.input} type="date" value={form.data_nascimento} onChange={handleChange('data_nascimento')} disabled={!editing || saving} />
                </label>

                <label className={styles.label}>
                  Telefone
                  <input className={styles.input} value={form.num_tel} onChange={handleChange('num_tel')} disabled={!editing || saving} placeholder="Nao informado" />
                </label>

                <label className={styles.label}>
                  CPF
                  <input className={styles.input} value={form.cpf} disabled placeholder="Nao informado" required />
                </label>

                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={form.whatsapp} onChange={handleChange('whatsapp')} disabled={!editing || saving} />
                  Receber contato pelo WhatsApp
                </label>
              </div>

              {error && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>{success}</div>}

              {editing && (
                <div className={styles.actions}>
                  <button className={styles.saveButton} type="submit" disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar alteracoes'}
                  </button>
                </div>
              )}
            </form>
          )}
        </section>
      </main>

      <footer className={homeStyles.footer}>
        <div className={homeStyles.footerInner}>
          <div className={homeStyles.footerColumns}>
            <div className={homeStyles.footerColumn}>
              <h3 className={homeStyles.footerTitle}>Redes Sociais</h3>
              <ul className={homeStyles.footerList}>
                <li><a href="#">Facebook</a></li>
                <li><a href="#">Instagram</a></li>
                <li><a href="#">WhatsApp</a></li>
              </ul>
            </div>

            <div className={homeStyles.footerColumn}>
              <h3 className={homeStyles.footerTitle}>Espaco futuro</h3>
              <ul className={homeStyles.footerList}>
                <li><a href="#">Item futuro 1</a></li>
                <li><a href="#">Item futuro 2</a></li>
                <li><a href="#">Item futuro 3</a></li>
              </ul>
            </div>

            <div className={homeStyles.footerColumn}>
              <h3 className={homeStyles.footerTitle}>Espaco futuro</h3>
              <ul className={homeStyles.footerList}>
                <li><a href="#">Item futuro 1</a></li>
                <li><a href="#">Item futuro 2</a></li>
                <li><a href="#">Item futuro 3</a></li>
              </ul>
            </div>
          </div>

          <div className={homeStyles.footerBottom}>
            2026 WorkFlow. Todos os direitos reservados
          </div>
        </div>
      </footer>
    </div>
  )
}
