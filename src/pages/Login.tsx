import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-accent/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <img
              src="/academy/academy.png"
              alt="Lions League Academy"
              className="w-12 h-12 rounded-2xl object-cover shadow-lg"
            />
            <div className="text-left">
              <p className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>Lions League</p>
              <p className="text-xs -mt-1 text-gradient">Academy</p>
            </div>
          </Link>
          <h1 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Bem-vindo de volta
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Entre na sua conta para continuar seu aprendizado
          </p>
        </div>

        <div
          className="rounded-3xl border p-8 shadow-xl"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-xl)' }}
        >
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  style={{
                    background: 'var(--surface-hover)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)'
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  style={{
                    background: 'var(--surface-hover)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Lembrar-me</span>
              </label>
              <button type="button" className="text-sm font-medium text-primary hover:underline">
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold bg-gradient-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? <>
                <Loader2 className="w-5 h-5 animate-spin" /> Entrando...
              </> : <>
                Entrar
                <ArrowRight className="w-5 h-5" />
              </>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Não tem uma conta?{' '}
              <button className="font-semibold text-primary hover:underline">
                Fale com seu gestor
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
