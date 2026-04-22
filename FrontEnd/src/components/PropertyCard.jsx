import { Link } from 'react-router-dom'
import { MapPin, Star, Wifi, Wind, Car, Waves } from 'lucide-react'

const PROPERTY_IMAGES = {
  '75ef00000000000000000001': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  '75ef00000000000000000002': 'https://images.unsplash.com/photo-1449844908441-895c6697abe2?w=600&q=80',
  '75ef00000000000000000003': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
}

const AMENITY_ICONS = {
  wifi: <Wifi size={13} />,
  'ar-condicionado': <Wind size={13} />,
  'ar condicionado': <Wind size={13} />,
  estacionamento: <Car size={13} />,
  piscina: <Waves size={13} />,
}

export default function PropertyCard({ property }) {
  const { _id, nome, cidade, preco_por_noite, comodidades = [], avaliacao } = property
  const imgSrc = PROPERTY_IMAGES[_id] || `https://picsum.photos/seed/${_id}/600/400`

  return (
    <Link to={`/imovel/${_id}`} className="card group block">
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={imgSrc}
          alt={nome}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {avaliacao && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            {avaliacao}
          </div>
        )}
        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
          R$ {preco_por_noite?.toLocaleString('pt-BR')}/noite
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base leading-tight truncate mb-1">{nome}</h3>
        <p className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin size={13} className="text-primary flex-shrink-0" />
          {cidade}
        </p>

        {comodidades.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {comodidades.slice(0, 3).map((c) => (
              <span key={c} className="flex items-center gap-1 badge bg-gray-50 text-gray-600 border border-gray-100">
                {AMENITY_ICONS[c.toLowerCase()] || null}
                {c}
              </span>
            ))}
            {comodidades.length > 3 && (
              <span className="badge bg-gray-50 text-gray-500">+{comodidades.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
