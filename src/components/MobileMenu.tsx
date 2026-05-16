import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Trophy, Users, Settings,
  BarChart3, FileText, HelpCircle, Shield, Tag, User,
  X, UserCog
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const agentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/cursos', icon: BookOpen, label: 'Meus Cursos' },
  { to: '/dashboard/certificados', icon: Trophy, label: 'Certificados' },
  { to: '/dashboard/comunidade', icon: Users, label: 'Comunidade' },
  { to: '/dashboard/perfil', icon: User, label: 'Meu Perfil' },
  { to: '/dashboard/ajuda', icon: HelpCircle, label: 'Ajuda' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Visão Geral' },
  { to: '/admin/cursos', icon: BookOpen, label: 'Cursos' },
  { to: '/admin/categorias', icon: Tag, label: 'Categorias' },
  { to: '/admin/alunos', icon: Users, label: 'Agenciados' },
  { to: '/admin/administradores', icon: UserCog, label: 'Administradores' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/relatorios', icon: FileText, label: 'Relatórios' },
  { to: '/admin/config', icon: Settings, label: 'Configurações' },
  { to: '/admin/perfil', icon: User, label: 'Meu Perfil' },
];

interface MobileMenuProps {
  isAdmin?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isAdmin, isOpen, onClose }: MobileMenuProps) {
  const location = useLocation();
  const { user } = useAuth();
  const links = isAdmin ? adminLinks : agentLinks;

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] z-50 flex flex-col lg:hidden"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <img
                  src="/academy/academy.png"
                  alt="Lions League Academy"
                  className="w-10 h-10 rounded-xl object-cover shadow-lg"
                />
                <div>
                  <h1 className="font-display font-bold text-lg tracking-tight" style={{ color: 'var(--text)' }}>Lions League</h1>
                  <p className="text-xs font-medium -mt-0.5 text-gradient">Academy</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl"
                style={{ background: 'var(--surface-hover)' }}
              >
                <X className="w-5 h-5" style={{ color: 'var(--text)' }} />
              </button>
            </div>

            {/* User info */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6C5CE7&color=fff`}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text)' }}>{user.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                    {user.role === 'admin' ? 'Administrador' : 'Agenciado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {isAdmin && (
                <div className="px-3 mb-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Painel Admin</span>
                  </div>
                </div>
              )}

              {links.map((link) => {
                const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{ color: isActive ? 'var(--primary)' : 'var(--text-secondary)' }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobile-menu-active"
                        className="absolute left-0 w-1 h-8 rounded-r-full bg-gradient-primary"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
