import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Home, LayoutDashboard, PlusCircle, LogOut, Menu, X, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout, isHost } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) =>
    location.pathname === path ? 'text-primary font-semibold' : 'text-gray-600 hover:text-gray-900'

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Home size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Aluga<span className="text-primary">Fácil</span>
            </span>
          </Link>

          {/* Desktop nav */}
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/')}`}>
                Imóveis
              </Link>
              <Link to="/dashboard" className={`text-sm font-medium transition-colors ${isActive('/dashboard')}`}>
                Dashboard
              </Link>
              {isHost && (
                <Link to="/novo-imovel" className={`text-sm font-medium transition-colors ${isActive('/novo-imovel')}`}>
                  Anunciar
                </Link>
              )}
            </nav>
          )}

          {/* Right area */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {isHost && (
                  <Link to="/novo-imovel" className="hidden md:flex btn-primary text-xs px-3 py-2">
                    <PlusCircle size={14} />
                    Anunciar imóvel
                  </Link>
                )}
                {/* User dropdown */}
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropOpen((v) => !v)}
                    className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs font-bold">
                      {user.nome?.[0]?.toUpperCase() || <User size={14} />}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 truncate">
                      {user.nome?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  {dropOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-slide-in">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.nome}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className="badge bg-primary/10 text-primary mt-1">
                          {user.tipo === 'ambos' ? 'Anfitrião & Hóspede' : user.tipo === 'anfitriao' ? 'Anfitrião' : 'Hóspede'}
                        </span>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      >
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                      >
                        <LogOut size={15} /> Sair
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm">Entrar</Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && user && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Home size={16} /> Imóveis
          </Link>
          <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          {isHost && (
            <Link to="/novo-imovel" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <PlusCircle size={16} /> Anunciar imóvel
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
