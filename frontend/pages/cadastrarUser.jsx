import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import styles from '../styles/CadastrarUser.module.css'

export default function CadastrarUser() {
  const router = useRouter()

  const onlyDigits = (value) => String(value || '').replace(/\D/g, '')

  const isValidCpf = (value) => {
    const cpf = onlyDigits(value)
    if (cpf.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cpf)) return false

    const nums = cpf.split('').map((d) => Number(d))
    const d1sum = nums.slice(0, 9).reduce((acc, n, i) => acc + n * (10 - i), 0)
    let d1 = (d1sum * 10) % 11
    if (d1 === 10) d1 = 0
    if (d1 !== nums[9]) return false

    const d2sum = nums.slice(0, 10).reduce((acc, n, i) => acc + n * (11 - i), 0)
    let d2 = (d2sum * 10) % 11
    if (d2 === 10) d2 = 0
    return d2 === nums[10]
  }

  const [categorias, setCategorias] = useState([])
  const [loadingCat, setLoadingCat] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)

  const [form, setForm] = useState({
    login: '',
    password: '',
    repeatPassword: '',
    nome: '',
    sobre_nome: '',
    email: '',
    data_nascimento: '',
    num_tel: '',
    whatsapp: false,
    cpf: '',
    freelancer: false,
    categorias_ids: [],
  })

  useEffect(() => {
    ;(async () => {
      try {
        setLoadingCat(true)
        const res = await fetch('/api/categorias')
        if (!res.ok) throw new Error('Erro ao carregar categorias')
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data.results || [])
        setCategorias(list)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoadingCat(false)
      }
    })()
  }, [])

  const selectedCount = form.categorias_ids.length

  const categoriasById = useMemo(() => {
    const m = new Map()
    for (const c of categorias) m.set(c.id, c)
    return m
  }, [categorias])

  const toggleCategoria = (id) => {
    setForm((prev) => {
      const set = new Set(prev.categorias_ids)
      if (set.has(id)) {
        set.delete(id)
      } else {
        set.add(id)
      }
      return { ...prev, categorias_ids: Array.from(set) }
    })
  }

  const handleChange = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value

    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'freelancer' && !value) {
        next.categorias_ids = []
      }
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.repeatPassword) {
      setError('As senhas não conferem.')
      return
    }

    if (!isValidCpf(form.cpf)) {
      setError('CPF inválido.')
      return
    }

    if (form.freelancer && form.categorias_ids.length < 1) {
      setError('Selecione pelo menos 1 categoria para Freelancer.')
      return
    }

    try {
      setSubmitting(true)
      const { repeatPassword, ...payload } = form

      payload.cpf = onlyDigits(payload.cpf)

      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Erro ao cadastrar usuário')
      }

      router.push('/login')
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.panelGrid}>
          <section className={styles.panelLeft}>
            <h1 className={styles.title}>Criar conta</h1>
            <p className={styles.subtitle}>
              Preencha seus dados. Se você for Freelancer, selecione pelo menos 1 habilidade.
            </p>
          </section>

          <section className={styles.panelRight}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <label className={styles.label}>
                  Login
                  <input className={styles.input} value={form.login} onChange={handleChange('login')} required />
                </label>
                <label className={styles.label}>
                  Email
                  <input className={styles.input} type="email" value={form.email} onChange={handleChange('email')} required />
                </label>
              </div>

              <div className={styles.row}>
                <label className={`${styles.label} ${styles.span2}`}>
                  Senha
                  <div className={styles.passwordField}>
                    <input
                      className={styles.input}
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange('password')}
                      required
                    />
                    <button
                      className={styles.eyeButton}
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </label>
              </div>

              <div className={styles.row}>
                <label className={`${styles.label} ${styles.span2}`}>
                  Repetir senha
                  <div className={styles.passwordField}>
                    <input
                      className={styles.input}
                      type={showRepeatPassword ? 'text' : 'password'}
                      value={form.repeatPassword}
                      onChange={handleChange('repeatPassword')}
                      required
                    />
                    <button
                      className={styles.eyeButton}
                      type="button"
                      onClick={() => setShowRepeatPassword((v) => !v)}
                      aria-label={showRepeatPassword ? 'Ocultar repetir senha' : 'Mostrar repetir senha'}
                    >
                      {showRepeatPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </label>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>
                  Nome
                  <input className={styles.input} value={form.nome} onChange={handleChange('nome')} required />
                </label>
                <label className={styles.label}>
                  Sobrenome
                  <input className={styles.input} value={form.sobre_nome} onChange={handleChange('sobre_nome')} />
                </label>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>
                  Data de nascimento
                  <input className={styles.input} type="date" value={form.data_nascimento} onChange={handleChange('data_nascimento')} />
                </label>
                <div />
              </div>

              <div className={styles.row}>
                <label className={styles.label}>
                  Telefone
                  <input className={styles.input} value={form.num_tel} onChange={handleChange('num_tel')} />
                </label>
                <label className={styles.labelCheckbox}>
                  <input type="checkbox" checked={form.whatsapp} onChange={handleChange('whatsapp')} />
                  WhatsApp?
                </label>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>
                  CPF
                  <input className={styles.input} value={form.cpf} onChange={handleChange('cpf')} required />
                </label>
                <div />
              </div>

              <div className={styles.categoriasBlock}>
                <div className={styles.categoriasHeader}>
                  <div className={styles.categoriasTitle}>Categorias</div>
                  <label className={styles.labelCheckbox}>
                    <input type="checkbox" checked={form.freelancer} onChange={handleChange('freelancer')} />
                    Freelancer?
                  </label>
                  {form.freelancer && (
                    <div className={styles.categoriasHint}>
                      Selecionadas: {selectedCount}
                    </div>
                  )}
                </div>

                {loadingCat ? (
                  <div className={styles.helpText}>Carregando categorias...</div>
                ) : (
                  <div className={styles.categoriasGrid}>
                    {categorias.map((c) => {
                      const checked = form.categorias_ids.includes(c.id)
                      const disabled = !form.freelancer
                      return (
                        <label key={c.id} className={styles.categoriaItem} data-disabled={disabled ? '1' : '0'}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleCategoria(c.id)}
                          />
                          <span className={styles.categoriaName}>{categoriasById.get(c.id)?.nome || c.nome}</span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {!form.freelancer && (
                  <div className={styles.helpText}>
                    Se você marcar Freelancer, será obrigatório selecionar pelo menos 1 categoria.
                  </div>
                )}
              </div>

              {error && <div className={styles.error}>Erro: {error}</div>}

              <div className={styles.actions}>
                <button className={styles.button} type="submit" disabled={submitting}>
                  {submitting ? 'Criando...' : 'Criar conta'}
                </button>
                <button className={styles.buttonSecondary} type="button" onClick={() => router.push('/login')} disabled={submitting}>
                  Voltar
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
