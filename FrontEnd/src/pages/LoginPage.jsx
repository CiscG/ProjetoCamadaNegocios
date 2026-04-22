import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

const DEMO_USERS = [
  { label: 'Anfitrião', email: 'carlos@email.com', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Hóspede', email: 'maria@email.com', color: 'bg-green-50 text-green-700 border-green-200' },
  { label: 'Ambos', email: 'ana@email.com', color: 'bg-purple-50 text-purple-700 border-purple-200' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !senha) return toast('Preencha email e senha.', 'error')
    setLoading(true)
    try {
      await login(email, senha)
      toast('Bem-vindo(a)! 🎉', 'success')
      navigate('/')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail)
    setSenha('123456')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel – decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 items-center justify-center p-12 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80"
          alt="Casa bonita"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 text-white text-center max-w-md">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Home size={28} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Aluga<span className="text-primary">Fácil</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Encontre o lugar perfeito para sua próxima estadia ou anuncie seu imóvel para o mundo.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[['100+', 'Imóveis'], ['50+', 'Cidades'], ['1k+', 'Hóspedes']].map(([n, l]) => (
              <div key={l} className="bg-white/10 rounded-xl p-3">
                <p className="text-2xl font-bold text-primary">{n}</p>
                <p className="text-xs text-gray-400 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Home size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Aluga<span className="text-primary">Fácil</span>
            </span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Entrar na sua conta</h2>
            <p className="text-gray-500 text-sm mb-7">Bem-vindo(a) de volta! ✨</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="input-field pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? <LoadingSpinner size="sm" className="border-white border-t-transparent" /> : 'Entrar'}
              </button>
            </form>

            {/* Demo users */}
            <div className="mt-6">
              <p className="text-xs text-gray-400 text-center mb-3 font-medium uppercase tracking-wide">
                Usuários de demonstração
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => fillDemo(u.email)}
                    className={`border rounded-xl px-2 py-2 text-xs font-medium transition-all hover:shadow-sm active:scale-95 ${u.color}`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">Senha: 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
