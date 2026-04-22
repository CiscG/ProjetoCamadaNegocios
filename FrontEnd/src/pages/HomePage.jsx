import { useState, useEffect } from 'react'
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import PropertyCard from '../components/PropertyCard'
import { PageLoader } from '../components/LoadingSpinner'

export default function HomePage() {
  const { user } = useAuth()
  const toast = useToast()

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchProperties = async (params = {}) => {
    setLoading(true)
    try {
      const data = await api.getLocais(params)
      setProperties(data)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProperties({
      cidade: search.trim() || undefined,
      preco_max: maxPrice || undefined,
    })
  }

  const clearFilters = () => {
    setSearch('')
    setMaxPrice('')
    fetchProperties()
  }

  const hasFilters = search || maxPrice

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=80"
          alt="Destinos incríveis"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 leading-tight">
            Encontre seu <span className="text-primary">lugar ideal</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg mb-8">
            Alugue imóveis incríveis em todo o Brasil
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 flex-1 px-3 py-1">
              <MapPin size={18} className="text-primary flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Qual cidade você quer visitar?"
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="sm:hidden flex items-center gap-2 text-sm text-gray-500 px-3 py-2 rounded-xl hover:bg-gray-50"
            >
              <SlidersHorizontal size={16} /> Filtros
            </button>

            <div className="hidden sm:flex items-center gap-2 border-l border-gray-100 pl-3">
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Preço máx."
                className="w-28 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                min="0"
              />
            </div>

            <button type="submit" className="btn-primary rounded-xl px-6">
              <Search size={16} /> Buscar
            </button>
          </form>

          {/* Mobile filters */}
          {showFilters && (
            <div className="sm:hidden mt-3 bg-white rounded-2xl p-4 max-w-2xl mx-auto text-left">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Preço máximo (R$/noite)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Ex: 500"
                className="input-field"
                min="0"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {hasFilters ? 'Resultados da busca' : 'Imóveis disponíveis'}
            </h2>
            {!loading && (
              <p className="text-sm text-gray-500 mt-0.5">
                {properties.length} imóve{properties.length !== 1 ? 'is' : 'l'} encontrado{properties.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
              <X size={14} /> Limpar filtros
            </button>
          )}
        </div>

        {loading ? (
          <PageLoader />
        ) : properties.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Nenhum imóvel encontrado</h3>
            <p className="text-gray-400 text-sm mb-4">Tente outras cidades ou remova os filtros.</p>
            <button onClick={clearFilters} className="btn-outline">Limpar busca</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
