import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Trophy, Users, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const agentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/dashboard/cursos', icon: BookOpen, label: 'Cursos' },
  { to: '/dashboard/certificados', icon: Trophy, label: 'Certs' },
  { to: '/dashboard/comunidade', icon: Users, label: 'Comunidade' },
  { to: '/dashboard/perfil', icon: User, label: 'Perfil' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Home' },
  { to: '/admin/cursos', icon: BookOpen, label: 'Cursos' },
  { to: '/admin/alunos', icon: Users, label: 'Agenciados' },
  { to: '/admin/config', icon: Trophy, label: 'Config' },
  { to: '/admin/perfil', icon: User, label: 'Perfil' },
];

interface MobileNavProps {
  isAdmin?: boolean;
}

export default function MobileNav({ isAdmin }: MobileNavProps) {
  const location = useLocation();
  const { user } = useAuth();
  const links = isAdmin ? adminLinks : agentLinks;

  if (!user) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t lg:hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-around h-16 safe-area-pb">
        {links.map((link) => {
          const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className="flex flex-col items-center justify-center gap-1 w-16 h-full relative"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-primary"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <link.icon
                className="w-5 h-5 transition-colors"
                style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
              />
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                {link.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
