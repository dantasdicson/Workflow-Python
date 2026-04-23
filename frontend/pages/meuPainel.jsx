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
  freelancer: false,
  categorias_ids: [],
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
  freelancer: Boolean(data.freelancer),
  categorias_ids: Array.isArray(data.categorias) ? data.categorias.map((categoria) => categoria.id) : [],
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
  const [categorias, setCategorias] = useState([])
  const [loadingCategorias, setLoadingCategorias] = useState(true)

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

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        setLoadingCategorias(true)
        const res = await fetch('/api/categorias')
        if (!res.ok) {
          throw new Error('Erro ao carregar categorias.')
        }

        const data = await res.json()
        setCategorias(Array.isArray(data) ? data : (data.results || []))
      } catch (err) {
        setError((prev) => prev || err.message)
      } finally {
        setLoadingCategorias(false)
      }
    }

    loadCategorias()
  }, [])

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'freelancer' && !value) {
        next.categorias_ids = []
      }
      return next
    })
  }

  const toggleCategoria = (categoriaId) => {
    setForm((prev) => {
      const selected = new Set(prev.categorias_ids)
      if (selected.has(categoriaId)) {
        selected.delete(categoriaId)
      } else {
        selected.add(categoriaId)
      }
      return { ...prev, categorias_ids: Array.from(selected) }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (form.freelancer && form.categorias_ids.length < 1) {
      setError('Selecione pelo menos uma categoria para atuar como freelancer.')
      return
    }

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
          freelancer: form.freelancer,
          categorias_ids: form.freelancer ? form.categorias_ids : [],
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
              <div className={styles.accountTypeRow}>
                <span className={styles.accountTypeLabel}>Tipo de conta</span>
                <span className={`${styles.accountTypeBadge} ${form.freelancer ? styles.freelancerBadge : styles.contractorBadge}`}>
                  {form.freelancer ? 'Freelancer' : 'Contratante'}
                </span>
              </div>
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

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.freelancer}
                    onChange={handleChange('freelancer')}
                    disabled={!editing || saving}
                  />
                  Atuar como freelancer na plataforma
                </label>
              </div>

              <section className={styles.categoriesPanel}>
                <div className={styles.categoriesHeader}>
                  <div>
                    <h2 className={styles.categoriesTitle}>Categorias de atuação</h2>
                    <p className={styles.categoriesText}>
                      Ao marcar a opção de freelancer, escolha as categorias que melhor representam os serviços que você oferece.
                    </p>
                  </div>
                  {form.freelancer && (
                    <span className={styles.categoriesCount}>
                      Selecionadas: {form.categorias_ids.length}
                    </span>
                  )}
                </div>

                {loadingCategorias ? (
                  <div className={styles.message}>Carregando categorias...</div>
                ) : form.freelancer ? (
                  <div className={styles.categoriesGrid}>
                    {categorias.map((categoria) => {
                      const checked = form.categorias_ids.includes(categoria.id)
                      return (
                        <label key={categoria.id} className={styles.categoryOption}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCategoria(categoria.id)}
                            disabled={!editing || saving}
                          />
                          <span>{categoria.nome}</span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <p className={styles.categoriesText}>
                    Ative a opção de freelancer para escolher suas categorias de atuação.
                  </p>
                )}
              </section>

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
