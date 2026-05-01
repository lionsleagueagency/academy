import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Bell, Search, Menu, X, ChevronDown,
  LogOut, User, Shield, LayoutDashboard
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  isAdmin?: boolean;
}

export default function Header({ isAdmin }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/';

  return (
    <>
      <header
        className="sticky top-0 z-40 glass border-b transition-colors duration-300"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              {isAuthenticated && (
                <button
                  onClick={() => setMenuOpen(true)}
                  className="lg:hidden p-2.5 rounded-xl mr-1"
                  style={{ background: 'var(--surface-hover)' }}
                >
                  <Menu className="w-5 h-5" style={{ color: 'var(--text)' }} />
                </button>
              )}

              <Link to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-3 group">
                <img
                  src="/academy.png"
                  alt="Lions League Academy"
                  className="relative w-10 h-10 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform"
                />
                <div className="hidden sm:block">
                  <h1 className="font-display font-bold text-xl tracking-tight">
                    Lions League
                  </h1>
                  <p className="text-xs font-medium -mt-1 text-gradient">Academy</p>
                </div>
              </Link>
            </div>

            {isAuthenticated && user ? (
              <>
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Buscar treinamentos..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30"
                      style={{
                        background: 'var(--surface-hover)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)'
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={toggleTheme}
                    className="relative p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'var(--surface-hover)' }}
                    aria-label="Alternar tema"
                  >
                    <AnimatePresence mode="wait">
                      {theme === 'dark' ? (
                        <motion.div
                          key="sun"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Sun className="w-5 h-5 text-amber-400" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="moon"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Moon className="w-5 h-5 text-slate-600" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  <button
                    className="relative p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 hidden sm:flex"
                    style={{ background: 'var(--surface-hover)' }}
                  >
                    <Bell className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 sm:gap-3 p-1.5 sm:pr-3 rounded-xl transition-all hover:scale-[1.02]"
                      style={{ background: 'var(--surface-hover)' }}
                    >
                      <img
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6C5CE7&color=fff`}
                        alt={user.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text)' }}>{user.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.role === 'admin' ? 'Admin' : 'Agenciado'}</p>
                      </div>
                      <ChevronDown className="w-4 h-4 hidden sm:block" style={{ color: 'var(--text-muted)' }} />
                    </button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border p-2 z-50"
                          style={{
                            background: 'var(--surface)',
                            borderColor: 'var(--border)',
                            boxShadow: 'var(--shadow-xl)'
                          }}
                        >
                          <div className="px-3 py-2 mb-1">
                            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{user.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                          </div>
                          <div className="h-px mb-1" style={{ background: 'var(--border)' }} />
                          <button
                            onClick={() => { setProfileOpen(false); navigate(isAdmin ? '/admin/perfil' : '/dashboard/perfil'); }}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-colors hover:bg-primary/10"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <User className="w-4 h-4" /> Meu Perfil
                          </button>
                          {user.role === 'admin' && !isAdmin && (
                            <button
                              onClick={() => { setProfileOpen(false); navigate('/admin'); }}
                              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-colors hover:bg-primary/10"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              <Shield className="w-4 h-4" /> Painel Admin
                            </button>
                          )}
                          {user.role === 'admin' && isAdmin && (
                            <button
                              onClick={() => { setProfileOpen(false); navigate('/dashboard'); }}
                              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-colors hover:bg-primary/10"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              <LayoutDashboard className="w-4 h-4" /> Área do Agenciado
                            </button>
                          )}
                          <button
                            onClick={() => { setProfileOpen(false); logout(); }}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"
                          >
                            <LogOut className="w-4 h-4" /> Sair
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="relative p-2.5 rounded-xl transition-all hover:scale-105"
                  style={{ background: 'var(--surface-hover)' }}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                </button>
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  Acessar Plataforma
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <MobileMenu isAdmin={isAdmin} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

