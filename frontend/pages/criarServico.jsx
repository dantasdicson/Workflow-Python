import { useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import styles from '../styles/CriarServico.module.css'

export default function CriarServico() {
  const router = useRouter()
  const [form, setForm] = useState({
    descricao_servico: '',
    valor_estimado_minimo: '',
    valor_estimado_maximo: '',
    imagem: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'imagem') {
      setForm({ ...form, imagem: files[0] })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!form.descricao_servico || !form.valor_estimado_minimo || !form.valor_estimado_maximo) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    // Temporariamente: enviar JSON sem upload
    const payload = {
      descricao_servico: form.descricao_servico,
      valor_estimado_minimo: parseFloat(form.valor_estimado_minimo),
      valor_estimado_maximo: parseFloat(form.valor_estimado_maximo),
    }

    try {
      setLoading(true)
      const res = await fetch('/api/ordens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Erro ao criar ordem de serviço')
      }

      setSuccess(true)
      setTimeout(() => router.push('/listarServicos'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <h1 className={styles.title}>Criar Ordem de Serviço</h1>

        {success && <div className={styles.success}>Ordem criada com sucesso! Redirecionando...</div>}

        {error && <div className={styles.error}>Erro: {error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Descrição do serviço *
            <textarea
              className={styles.textarea}
              name="descricao_servico"
              value={form.descricao_servico}
              onChange={handleChange}
              required
            />
          </label>

          <div className={styles.row}>
            <label className={styles.label}>
              Valor estimado mínimo *
              <input
                className={styles.input}
                type="number"
                step="0.01"
                name="valor_estimado_minimo"
                value={form.valor_estimado_minimo}
                onChange={handleChange}
                required
              />
            </label>

            <label className={styles.label}>
              Valor estimado máximo *
              <input
                className={styles.input}
                type="number"
                step="0.01"
                name="valor_estimado_maximo"
                value={form.valor_estimado_maximo}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label className={styles.label}>
            Imagem (opcional)
            <input
              className={styles.fileInput}
              type="file"
              name="imagem"
              accept="image/*"
              onChange={handleChange}
            />
          </label>

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Ordem'}
          </button>
        </form>
      </main>
    </div>
  )
}
