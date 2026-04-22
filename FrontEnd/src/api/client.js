const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.erro || data.error || `Erro ${res.status}`)
  }
  return data
}

// Normalize backend property → frontend shape
function normalizeLocal(l) {
  return {
    _id: l.id || l._id,
    nome: l.titulo || l.nome,
    cidade: l.endereco?.cidade || l.cidade,
    estado: l.endereco?.estado || l.estado,
    descricao: l.descricao,
    preco_por_noite: l.preco_por_noite,
    comodidades: l.comodidades || [],
    anfitriao_id: l.anfitriao_id,
    anfitriao_nome: l.anfitriao_nome,
  }
}

// Normalize backend reservation → frontend shape
function normalizeReserva(r) {
  return {
    _id: r.id || r._id,
    local_id: r.local_id,
    hospede_id: r.hospede_id,
    desde: r.checkin || r.desde,
    ate: r.checkout || r.ate,
    preco_total: r.valor_total ?? r.preco_total,
    status: r.status,
    local_nome: r.local?.titulo || r.local_nome,
    local_cidade: r.local?.endereco?.cidade || r.local_cidade,
  }
}

export const api = {
  login: (email, senha) =>
    request('/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),

  getLocais: async (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString()
    const data = await request(`/locais${qs ? `?${qs}` : ''}`)
    return Array.isArray(data) ? data.map(normalizeLocal) : []
  },

  createLocal: (data) =>
    request('/locais', {
      method: 'POST',
      body: JSON.stringify({
        anfitriao_id: data.anfitriao_id,
        titulo: data.nome || data.titulo,
        descricao: data.descricao || '',
        preco_por_noite: data.preco_por_noite,
        endereco: { cidade: data.cidade, estado: data.estado || 'N/A', pais: data.pais || 'Brasil' },
        comodidades: data.comodidades || [],
      }),
    }),

  getReservas: async (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString()
    const data = await request(`/reservas${qs ? `?${qs}` : ''}`)
    return Array.isArray(data) ? data.map(normalizeReserva) : []
  },

  createReserva: (data) =>
    request('/reservas', {
      method: 'POST',
      body: JSON.stringify({
        local_id: data.local_id,
        hospede_id: data.hospede_id,
        checkin: data.desde || data.checkin,
        checkout: data.ate || data.checkout,
      }),
    }),

  getOcupacao: (id) => request(`/locais/${id}/ocupacao`),
}
