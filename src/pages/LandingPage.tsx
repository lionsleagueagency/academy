import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Play, ArrowRight, Star, Users, TrendingUp, Award,
  Shield, Zap, Target, BarChart3, BookOpen, CheckCircle2, Loader2
} from 'lucide-react';
import { courseService } from '../services/course.service';
import type { Course } from '../services/course.service';

const stats = [
  { icon: Users, value: '2.500+', label: 'Agenciados Ativos' },
  { icon: BookOpen, value: '80+', label: 'Treinamentos' },
  { icon: Award, value: '15.000+', label: 'Certificados Emitidos' },
  { icon: TrendingUp, value: '97%', label: 'Taxa de Aprovação' },
];

const features = [
  {
    icon: Target,
    title: 'Conteúdo Direcionado',
    desc: 'Treinamentos desenvolvidos especificamente para o mercado de agenciamento e performance digital.'
  },
  {
    icon: Zap,
    title: 'Aprendizado Acelerado',
    desc: 'Método prático com aulas curtas e objetivas para você aplicar imediatamente nos seus projetos.'
  },
  {
    icon: Shield,
    title: 'Comunidade Exclusiva',
    desc: 'Acesso a uma rede de agenciados de alto nível para networking e troca de experiências.'
  },
  {
    icon: BarChart3,
    title: 'Acompanhamento de Resultados',
    desc: 'Dashboard completo com métricas do seu progresso e evolução nas habilidades.'
  },
];

const testimonials = [
  {
    name: 'Carlos Eduardo',
    role: 'Agenciado Elite',
    text: 'A Lions League Academy transformou minha carreira. Em 3 meses, dobrei meu faturamento aplicando o que aprendi nos treinamentos.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
  },
  {
    name: 'Mariana Souza',
    role: 'Agenciado Pro',
    text: 'A qualidade do conteúdo é impressionante. Cada aula é um divisor de águas. Recomendo para todo agenciado sério.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
  },
  {
    name: 'Lucas Pereira',
    role: 'Agenciado Starter',
    text: 'Comecei do zero e em poucas semanas já estava gerenciando minhas primeiras campanhas com confiança.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
  }
];

export default function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseService.getCourses({ featured: true, limit: 3 })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setCourses(data);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary/20 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-accent/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Mais de 2.500 agenciados treinados</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] mb-6"
            >
              Eleve seu{' '}
              <span className="text-gradient">Potencial</span>
              <br />
              ao Próximo Nível
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              A plataforma de treinamento exclusiva da Lions League Agency.
              Domine as habilidades que os top agenciados usam para escalar resultados.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/login"
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-lg bg-gradient-primary shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold border hover:scale-105 transition-all"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <Play className="w-5 h-5" />
                Ver Demonstração
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 lg:mt-24 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80"
                alt="Plataforma"
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Play className="w-6 h-6 text-white ml-1" fill="white" />
                </div>
                <div className="text-white">
                  <p className="font-semibold">Conheça a Plataforma</p>
                  <p className="text-sm text-white/80">2:34 minutos</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 border-y" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-6 h-6 mx-auto mb-3 text-primary" />
                <p className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>{stat.value}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
            >
              Por que a <span className="text-gradient">Lions Academy?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{ color: 'var(--text-secondary)' }}
            >
              Uma plataforma pensada para quem quer resultados reais no mercado digital
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border hover:shadow-lg transition-all group"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text)' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24" style={{ background: 'var(--surface)' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-display text-3xl sm:text-4xl font-bold mb-2"
              >
                Treinamentos em <span className="text-gradient">Destaque</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                style={{ color: 'var(--text-secondary)' }}
              >
                Comece pelo que faz mais sentido para o seu momento
              </motion.p>
            </div>
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border hover:scale-105 transition-all shrink-0"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              Ver Todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group rounded-2xl overflow-hidden border hover:shadow-xl transition-all"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={course.thumbnail_url || ''}
                      alt={course.title}
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white">
                        {course.level}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text)' }}>{course.title}</h3>
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <span>{course.total_lessons} aulas</span>
                      <span>•</span>
                      <span>Certificado</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[150px]" />
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
            >
              O que dizem nossos <span className="text-gradient">Agenciados</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-500" fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24" style={{ background: 'var(--surface)' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-primary" />
            <div className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            />

            <div className="relative px-8 py-16 lg:px-16 lg:py-20 text-center">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Pronto para se tornar um Top Agenciado?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Junte-se aos agenciados de elite da Lions League e transforme sua carreira no marketing digital.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-2xl font-bold text-lg bg-white text-primary hover:scale-105 transition-all shadow-xl"
                >
                  Acessar Plataforma
                </Link>
              </div>

              <div className="flex items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">Acesso Imediato</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">Certificado Incluso</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">Comunidade VIP</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/academy.png"
                alt="Lions League Academy"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <p className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>Lions League</p>
                <p className="text-xs -mt-1 text-gradient">Academy</p>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              2024 Lions League Agency. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
