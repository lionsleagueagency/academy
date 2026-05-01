import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, Calendar, Filter, BarChart3,
  Users, BookOpen, TrendingUp, Clock, ArrowRight
} from 'lucide-react';

const reports = [
  {
    id: '1',
    title: 'Relatório de Matrículas - Abril 2026',
    type: 'Matrículas',
    date: '2026-04-30',
    icon: Users,
    color: 'text-primary',
    status: 'ready',
  },
  {
    id: '2',
    title: 'Relatório de Engajamento - Abril 2026',
    type: 'Engajamento',
    date: '2026-04-30',
    icon: TrendingUp,
    color: 'text-accent',
    status: 'ready',
  },
  {
    id: '3',
    title: 'Relatório de Conclusões - Abril 2026',
    type: 'Conclusões',
    date: '2026-04-30',
    icon: BookOpen,
    color: 'text-green-500',
    status: 'ready',
  },
  {
    id: '4',
    title: 'Performance por Curso - Q1 2026',
    type: 'Performance',
    date: '2026-03-31',
    icon: BarChart3,
    color: 'text-orange-500',
    status: 'ready',
  },
  {
    id: '5',
    title: 'Horas de Estudo por Agenciado - Março 2026',
    type: 'Horas',
    date: '2026-03-31',
    icon: Clock,
    color: 'text-purple-500',
    status: 'ready',
  },
];

const reportTemplates = [
  { title: 'Matrículas por Período', desc: 'Relatório detalhado de novas matrículas', icon: Users },
  { title: 'Engajamento dos Agenciados', desc: 'Horas assistidas, login frequency', icon: TrendingUp },
  { title: 'Performance dos Cursos', desc: 'Conclusões, notas, avaliações', icon: BarChart3 },
  { title: 'Financeiro', desc: 'Receita por período', icon: FileText },
];

export default function AdminReports() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>Relatórios</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gere e baixe relatórios detalhados da plataforma</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl transition-all">
          <FileText className="w-4 h-4" />
          Gerar Novo Relatório
        </button>
      </div>

      <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h2 className="font-display text-lg font-bold mb-5" style={{ color: 'var(--text)' }}>Modelos de Relatório</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTemplates.map((template, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl border cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <template.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{template.title}</h3>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{template.desc}</p>
              <span className="flex items-center gap-1 text-xs font-medium text-primary">
                Gerar <ArrowRight className="w-3 h-3" />
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>Relatórios Gerados</h2>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'Matrículas', label: 'Matrículas' },
              { id: 'Engajamento', label: 'Engajamento' },
              { id: 'Performance', label: 'Performance' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f.id ? 'bg-gradient-primary text-white' : ''
                }`}
                style={filter === f.id ? {} : { background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {reports.filter(r => filter === 'all' || r.type === filter).map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-xl border hover:shadow-md transition-all"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-hover)' }}>
                <report.icon className={`w-5 h-5 ${report.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{report.title}</h3>
                <div className="flex items-center gap-3 text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(report.date).toLocaleDateString('pt-BR')}</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{report.type}</span>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border hover:bg-primary/5 hover:border-primary/30 transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <Download className="w-4 h-4" /> Baixar
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
