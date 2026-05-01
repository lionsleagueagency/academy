import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Trophy, Users, Settings,
  BarChart3, FileText, HelpCircle, Shield, Tag, User, UserCog
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

interface SidebarProps {
  isAdmin?: boolean;
}

export default function Sidebar({ isAdmin }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const links = isAdmin ? adminLinks : agentLinks;

  if (!user) return null;

  return (
    <aside
      className="fixed left-0 top-16 lg:top-20 bottom-0 w-64 border-r z-40 hidden lg:flex flex-col transition-colors duration-300"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)'
      }}
    >
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {isAdmin && (
          <div className="px-3 mb-4">
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
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ color: isActive ? 'var(--primary)' : 'var(--text-secondary)' }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'var(--primary)', opacity: 0.08 }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <link.icon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: 'var(--surface-hover)' }}>
          <img
            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6C5CE7&color=fff`}
            alt=""
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{user.name}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.role === 'admin' ? 'Admin' : 'Agenciado'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
