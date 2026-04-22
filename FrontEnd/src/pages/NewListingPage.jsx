import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, X, Building2 } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

const AMENITY_OPTIONS = ['WiFi', 'Ar-condicionado', 'Estacionamento', 'Piscina', 'Cozinha', 'Lavanderia', 'TV', 'Academia']

export default function NewListingPage() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nome: '',
    cidade: '',
    estado: '',
    descricao: '',
    preco_por_noite: '',
    comodidades: [],
  })
  const [loading, setLoading] = useState(false)

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      comodidades: f.comodidades.includes(a) ? f.comodidades.filter((x) => x !== a) : [...f.comodidades, a],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nome || !form.cidade || !form.estado || !form.preco_por_noite) {
      return toast('Preencha nome, cidade, estado e preço por noite.', 'error')
    }
    const price = parseFloat(form.preco_por_noite)
    if (isNaN(price) || price <= 0) return toast('Preço inválido.', 'error')

    setLoading(true)
    try {
      await api.createLocal({
        ...form,
        preco_por_noite: price,
        anfitriao_id: user.id,
      })
      toast('Imóvel anunciado com sucesso! 🏠', 'success')
      navigate('/dashboard')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Anunciar imóvel</h1>
            <p className="text-gray-500 text-sm">Preencha os detalhes do seu espaço</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Informações básicas</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do imóvel *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => set('nome', e.target.value)}
                  placeholder="Ex: Apartamento moderno no centro"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cidade *</label>
                <input
                  type="text"
                  value={form.cidade}
                  onChange={(e) => set('cidade', e.target.value)}
                  placeholder="Ex: São Paulo"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado *</label>
                <input
                  type="text"
                  value={form.estado}
                  onChange={(e) => set('estado', e.target.value)}
                  placeholder="Ex: SP"
                  className="input-field"
                  maxLength={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => set('descricao', e.target.value)}
                  placeholder="Descreva seu imóvel, diferenciais, regras..."
                  rows={4}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Precificação</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço por noite (R$) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">R$</span>
                <input
                  type="number"
                  value={form.preco_por_noite}
                  onChange={(e) => set('preco_por_noite', e.target.value)}
                  placeholder="0,00"
                  className="input-field pl-10"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Comodidades</h2>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => {
                const selected = form.comodidades.includes(a)
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                      selected
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {selected && <X size={12} />}
                    {a}
                  </button>
                )
              })}
            </div>
            {form.comodidades.length > 0 && (
              <p className="text-xs text-gray-500 mt-3">{form.comodidades.length} comodidade{form.comodidades.length !== 1 ? 's' : ''} selecionada{form.comodidades.length !== 1 ? 's' : ''}</p>
            )}
          </section>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-ghost flex-1 border border-gray-200">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3.5">
              {loading ? <LoadingSpinner size="sm" className="border-white border-t-transparent" /> : (
                <><PlusCircle size={16} /> Publicar imóvel</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
