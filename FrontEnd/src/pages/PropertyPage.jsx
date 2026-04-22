import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Wifi, Wind, Car, Waves, ArrowLeft, Calendar, AlertCircle } from 'lucide-react'
import { format, parseISO, differenceInCalendarDays, isWithinInterval, parseISO as parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { PageLoader } from '../components/LoadingSpinner'
import LoadingSpinner from '../components/LoadingSpinner'

const PROPERTY_IMAGES = {
  '75ef00000000000000000001': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
  '75ef00000000000000000002': 'https://images.unsplash.com/photo-1449844908441-895c6697abe2?w=1200&q=80',
  '75ef00000000000000000003': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
}

const AMENITY_ICONS = {
  wifi: <Wifi size={16} />, 'ar-condicionado': <Wind size={16} />, 'ar condicionado': <Wind size={16} />,
  estacionamento: <Car size={16} />, piscina: <Waves size={16} />,
}

function isBlocked(date, blockedRanges) {
  return blockedRanges.some(({ desde, ate }) => {
    try {
      return isWithinInterval(new Date(date), { start: parseISO(desde), end: parseISO(ate) })
    } catch { return false }
  })
}

export default function PropertyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isGuest } = useAuth()
  const toast = useToast()

  const [property, setProperty] = useState(null)
  const [ocupacao, setOcupacao] = useState([])
  const [loading, setLoading] = useState(true)

  const [desde, setDesde] = useState('')
  const [ate, setAte] = useState('')
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([api.getLocais(), api.getOcupacao(id)])
      .then(([locais, ocup]) => {
        const found = locais.find((l) => l._id === id)
        if (!found) throw new Error('Imóvel não encontrado')
        setProperty(found)
        setOcupacao(ocup)
      })
      .catch((err) => {
        toast(err.message, 'error')
        navigate('/')
      })
      .finally(() => setLoading(false))
  }, [id])

  const nights = desde && ate ? Math.max(0, differenceInCalendarDays(new Date(ate), new Date(desde))) : 0
  const total = nights * (property?.preco_por_noite || 0)

  const handleBook = async (e) => {
    e.preventDefault()
    if (!desde || !ate) return toast('Selecione as datas.', 'error')
    if (nights <= 0) return toast('A data de saída deve ser após a de entrada.', 'error')
    if (isBlocked(desde, ocupacao) || isBlocked(ate, ocupacao)) {
      return toast('Datas indisponíveis para esse período.', 'error')
    }
    setBooking(true)
    try {
      await api.createReserva({ local_id: id, hospede_id: user.id, desde, ate })
      toast('Reserva realizada com sucesso! 🎉', 'success')
      const ocup = await api.getOcupacao(id)
      setOcupacao(ocup)
      setDesde('')
      setAte('')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <PageLoader />
  if (!property) return null

  const imgSrc = PROPERTY_IMAGES[id] || `https://picsum.photos/seed/${id}/1200/600`
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero image */}
      <div className="relative h-72 sm:h-96 overflow-hidden bg-gray-200">
        <img src={imgSrc} alt={property.nome} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{property.nome}</h1>
          <p className="flex items-center gap-1.5 text-white/90 text-sm">
            <MapPin size={14} /> {property.cidade}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-gray-900">
                  R$ {property.preco_por_noite?.toLocaleString('pt-BR')}
                </span>
                <span className="text-gray-500 text-sm">/noite</span>
              </div>
              {property.descricao && (
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">{property.descricao}</p>
              )}
            </div>

            {/* Amenities */}
            {property.comodidades?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="font-semibold text-gray-900 text-base mb-4">Comodidades</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.comodidades.map((c) => (
                    <div key={c} className="flex items-center gap-2.5 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5">
                      <span className="text-primary">{AMENITY_ICONS[c.toLowerCase()] || <span>✓</span>}</span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blocked dates info */}
            {ocupacao.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-1">Datas indisponíveis</p>
                    <div className="space-y-0.5">
                      {ocupacao.map((o, i) => (
                        <p key={i} className="text-xs text-amber-700">
                          {format(parseISO(o.desde), 'dd/MM/yyyy')} → {format(parseISO(o.ate), 'dd/MM/yyyy')}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: booking widget */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                <Calendar size={18} className="text-primary" /> Fazer reserva
              </h2>

              {!isGuest ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    Apenas hóspedes podem fazer reservas.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBook} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Check-in</label>
                    <input
                      type="date"
                      value={desde}
                      min={today}
                      onChange={(e) => setDesde(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Check-out</label>
                    <input
                      type="date"
                      value={ate}
                      min={desde || today}
                      onChange={(e) => setAte(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  {nights > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>R$ {property.preco_por_noite?.toLocaleString('pt-BR')} × {nights} noite{nights !== 1 ? 's' : ''}</span>
                        <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                        <span>Total</span>
                        <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={booking} className="btn-primary w-full py-3.5">
                    {booking ? <LoadingSpinner size="sm" className="border-white border-t-transparent" /> : 'Reservar agora'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
