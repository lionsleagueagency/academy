import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Users, BookOpen, Clock,
  ArrowUpRight, ArrowDownRight, Loader2, Activity, Eye
} from 'lucide-react';
import { adminService } from '../services/admin.service';

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    adminService.getStats()
      .then(res => setStats(res.data && typeof res.data === 'object' ? res.data : null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = [
    { icon: Users, label: 'Total de Agenciados', value: String(stats?.users?.total || 0), change: '+12%', up: true, color: 'text-primary' },
    { icon: BookOpen, label: 'Cursos Publicados', value: String(stats?.courses?.published || 0), change: '+3', up: true, color: 'text-accent' },
    { icon: Eye, label: 'Visualizações Hoje', value: '4.8K', change: '+18%', up: true, color: 'text-green-500' },
    { icon: TrendingUp, label: 'Taxa de Retenção', value: '87%', change: '+5%', up: true, color: 'text-orange-500' },
  ];

  const engagementData = [
    { month: 'Jan', enrollments: 120, completions: 45 },
    { month: 'Fev', enrollments: 150, completions: 60 },
    { month: 'Mar', enrollments: 180, completions: 75 },
    { month: 'Abr', enrollments: 220, completions: 90 },
    { month: 'Mai', enrollments: 280, completions: 120 },
    { month: 'Jun', enrollments: 340, completions: 155 },
  ];

  const topCategories = [
    { name: 'Marketing Digital', percentage: 38, color: '#6C5CE7' },
    { name: 'Vendas', percentage: 25, color: '#00CEC9' },
    { name: 'Negociação', percentage: 18, color: '#F59E0B' },
    { name: 'Branding', percentage: 12, color: '#10B981' },
    { name: 'Liderança', percentage: 7, color: '#EF4444' },
  ];

  const deviceData = [
    { device: 'Desktop', percentage: 52 },
    { device: 'Mobile', percentage: 38 },
    { device: 'Tablet', percentage: 10 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Métricas detalhadas da plataforma</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                period === p ? 'bg-gradient-primary text-white shadow-lg' : ''
              }`}
              style={period === p ? {} : { background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-hover)' }}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                kpi.up ? 'text-green-600 bg-green-50 dark:bg-green-950/30' : 'text-red-600 bg-red-50 dark:bg-red-950/30'
              }`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <p className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>{kpi.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Matrículas vs Conclusões</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary" /> Matrículas</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent" /> Conclusões</span>
            </div>
          </div>
          <div className="flex items-end gap-4 h-56">
            {engagementData.map((d, i) => (
              <div key={i} className="flex-1 flex items-end gap-1">
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg bg-primary opacity-80" style={{ height: `${(d.enrollments / 350) * 100}%` }} />
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg opacity-80" style={{ height: `${(d.completions / 350) * 100}%`, background: 'var(--accent)' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2">
            {engagementData.map((d, i) => (
              <div key={i} className="flex-1 text-center">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold mb-6" style={{ color: 'var(--text)' }}>Categorias Populares</h2>
          <div className="space-y-4">
            {topCategories.map((cat, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{cat.percentage}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-hover)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${cat.percentage}%`, background: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold mb-6" style={{ color: 'var(--text)' }}>Dispositivos</h2>
          <div className="space-y-4">
            {deviceData.map((d, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{d.device}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{d.percentage}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-hover)' }}>
                  <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${d.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Status dos Agenciados</h2>
          <div className="space-y-3">
            {[
              { label: 'Ativos', count: 2100, color: 'bg-green-500' },
              { label: 'Inativos', count: 340, color: 'bg-slate-400' },
              { label: 'Novos (30d)', count: 107, color: 'bg-primary' },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${p.color}`} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{p.label}</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{p.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Horários de Pico</h2>
          <div className="space-y-2">
            {[
              { time: '08:00 - 10:00', users: 420 },
              { time: '12:00 - 14:00', users: 680 },
              { time: '18:00 - 20:00', users: 890 },
              { time: '20:00 - 22:00', users: 1100 },
              { time: '22:00 - 00:00', users: 560 },
            ].map((h, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs w-24 shrink-0" style={{ color: 'var(--text-muted)' }}>{h.time}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-hover)' }}>
                  <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${(h.users / 1200) * 100}%` }} />
                </div>
                <span className="text-xs font-medium w-10 text-right" style={{ color: 'var(--text)' }}>{h.users}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
