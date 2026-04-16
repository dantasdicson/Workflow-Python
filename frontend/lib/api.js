async function refreshSession() {
  const res = await fetch('/api/auth/refresh', { 
    method: 'POST',
    credentials: 'same-origin' // Importante para enviar cookies
  })
  return res.ok
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : path

  // Adicionar headers de autenticação
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Extrair o token dos cookies e enviar como Bearer token
  console.log('=== apiFetch Debug ===')
  console.log('URL:', url)
  console.log('Extraindo token dos cookies para enviar como Bearer token')
  
  // Função para extrair cookie específico
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  
  // Tentar pegar do cookie primeiro, depois do localStorage
  let token = getCookie('wf_access');
  if (!token) {
    token = localStorage.getItem('wf_access');
    console.log('Token encontrado no localStorage:', !!token)
  }
  console.log('Token wf_access encontrado:', !!token)
  console.log('Token (primeiros 20 chars):', token ? token.substring(0, 20) + '...' : 'null')
  console.log('Todos os cookies:', document.cookie)
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    console.log('Header Authorization adicionado:', `Bearer ${token.substring(0, 20)}...`)
  } else {
    console.log('ERRO: Token wf_access não encontrado nos cookies nem localStorage')
  }

  console.log('Headers finais:', headers)

  const requestOptions = {
    ...options,
    headers,
    credentials: 'same-origin', // Manter para compatibilidade
  }

  console.log('Fazendo requisição para:', url)
  console.log('Método:', options.method || 'GET')
  console.log('RequestOptions:', requestOptions)
  
  const res = await fetch(url, requestOptions)

  console.log('Resposta recebida:', {
    status: res.status,
    statusText: res.statusText,
    url: res.url,
    ok: res.ok
  })

  if (res.status !== 401) return res

  // Se deu 401, tentar refresh usando cookies
  const refreshed = await refreshSession()
  if (!refreshed) return res

  console.log('=== Refresh Debug ===')
  console.log('Refresh successful:', refreshed)
  console.log('Tentando novamente com cookies atualizados...')

  // Tentar novamente com os cookies atualizados
  return fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  })
}

export async function getMe() {
  const res = await apiFetch('/api/auth/me', { method: 'GET' })
  if (!res.ok) return null
  return res.json()
}
