import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, MapPin, Clock } from 'lucide-react'

const STATUS_STYLES = {
  confirmada: 'bg-green-50 text-green-700 border border-green-200',
  pendente:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
  cancelada:  'bg-red-50 text-red-600 border border-red-200',
}

const STATUS_LABELS = {
  confirmada: 'Confirmada',
  pendente: 'Pendente',
  cancelada: 'Cancelada',
}

function fmtDate(str) {
  try {
    return format(parseISO(str), "d 'de' MMM yyyy", { locale: ptBR })
  } catch {
    return str
  }
}

export default function ReservationCard({ reservation }) {
  const { local_nome, local_cidade, desde, ate, preco_total, status } = reservation
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.pendente

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-base leading-snug">{local_nome || 'Imóvel'}</h3>
          <span className={`badge flex-shrink-0 ${statusStyle}`}>
            {STATUS_LABELS[status] || status}
          </span>
        </div>

        {local_cidade && (
          <p className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
            <MapPin size={13} className="text-primary" />
            {local_cidade}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} className="text-gray-400" />
            {fmtDate(desde)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-gray-400" />
            até {fmtDate(ate)}
          </span>
        </div>
      </div>

      {preco_total != null && (
        <div className="flex flex-col items-end justify-center border-l border-gray-100 pl-4 min-w-24">
          <p className="text-xs text-gray-400 mb-0.5">Total</p>
          <p className="text-lg font-bold text-gray-900">
            R$ {preco_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      )}
    </div>
  )
}
