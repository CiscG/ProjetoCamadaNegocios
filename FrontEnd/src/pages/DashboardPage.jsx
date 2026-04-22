import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, Building2, PlusCircle, Inbox } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import ReservationCard from '../components/ReservationCard'
import PropertyCard from '../components/PropertyCard'
import { PageLoader } from '../components/LoadingSpinner'

export default function DashboardPage() {
  const { user, isHost, isGuest } = useAuth()
  const toast = useToast()

  const [tab, setTab] = useState(isGuest ? 'reservas' : 'imoveis')
  const [reservas, setReservas] = useState([])
  const [imoveis, setImoveis] = useState([])
  const [hostReservas, setHostReservas] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const promises = []
        if (isGuest) promises.push(api.getReservas({ hospede_id: user.id }))
        else promises.push(Promise.resolve([]))
        if (isHost) {
          promises.push(api.getLocais({ anfitriao_id: user.id }))
          promises.push(api.getReservas({ anfitriao_id: user.id }))
        } else {
          promises.push(Promise.resolve([]))
          promises.push(Promise.resolve([]))
        }
        const [r, l, hr] = await Promise.all(promises)
        setReservas(r)
        setImoveis(l)
        setHostReservas(hr)
      } catch (err) {
        toast(err.message, 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.id])

  const tabs = [
    ...(isGuest ? [{ id: 'reservas', label: 'Minhas Reservas', icon: <CalendarCheck size={16} />, count: reservas.length }] : []),
    ...(isHost ? [
      { id: 'imoveis', label: 'Meus Imóveis', icon: <Building2 size={16} />, count: imoveis.length },
      { id: 'hospedes', label: 'Reservas Recebidas', icon: <CalendarCheck size={16} />, count: hostReservas.length },
    ] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Olá, <span className="font-medium text-gray-700">{user.nome?.split(' ')[0]}</span>! 👋
              </p>
            </div>
            {isHost && (
              <Link to="/novo-imovel" className="btn-primary">
                <PlusCircle size={16} /> Anunciar imóvel
              </Link>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b border-gray-100">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px ${
                  tab === t.id
                    ? 'text-primary border-primary bg-primary/5'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t.icon}
                {t.label}
                {t.count > 0 && (
                  <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${tab === t.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <PageLoader />
        ) : (
          <>
            {tab === 'reservas' && (
              <div>
                {reservas.length === 0 ? (
                  <EmptyState
                    icon={<CalendarCheck size={28} className="text-gray-400" />}
                    title="Nenhuma reserva ainda"
                    description="Explore imóveis e faça sua primeira reserva!"
                    action={<Link to="/" className="btn-primary">Explorar imóveis</Link>}
                  />
                ) : (
                  <div className="space-y-3">
                    {reservas.map((r, i) => <ReservationCard key={i} reservation={r} />)}
                  </div>
                )}
              </div>
            )}

            {tab === 'imoveis' && (
              <div>
                {imoveis.length === 0 ? (
                  <EmptyState
                    icon={<Building2 size={28} className="text-gray-400" />}
                    title="Nenhum imóvel anunciado"
                    description="Anuncie seu imóvel e comece a receber hóspedes."
                    action={<Link to="/novo-imovel" className="btn-primary"><PlusCircle size={16} /> Anunciar agora</Link>}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {imoveis.map((p) => <PropertyCard key={p._id} property={p} />)}
                  </div>
                )}
              </div>
            )}

            {tab === 'hospedes' && (
              <div>
                {hostReservas.length === 0 ? (
                  <EmptyState
                    icon={<Inbox size={28} className="text-gray-400" />}
                    title="Nenhuma reserva recebida"
                    description="Quando hóspedes reservarem seus imóveis, aparecem aqui."
                  />
                ) : (
                  <div className="space-y-3">
                    {hostReservas.map((r, i) => <ReservationCard key={i} reservation={r} />)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-24 animate-fade-in">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-gray-400 text-sm mb-6">{description}</p>
      {action}
    </div>
  )
}
