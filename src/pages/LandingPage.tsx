import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  ArrowRight, Star, Users, TrendingUp, Award,
  MessageCircle, Video, Trophy, Gift, Swords, Calendar,
  BookOpen, CheckCircle2, Loader2, HeartHandshake, Rocket
} from 'lucide-react';
import { courseService } from '../services/course.service';
import type { Course } from '../services/course.service';

const stats = [
  { icon: Users, value: '2.500+', label: 'Agenciados Ativos' },
  { icon: BookOpen, value: '80+', label: 'Treinamentos' },
  { icon: Award, value: '15.000+', label: 'Certificados Emitidos' },
  { icon: TrendingUp, value: '97%', label: 'Taxa de Aprovação' },
];

const benefits = [
  {
    icon: MessageCircle,
    title: 'Suporte diário individual',
    desc: 'Conselhos para ajudar os criadores a aprimorar seu conteúdo de LIVE com acompanhamento próximo da equipe.',
  },
  {
    icon: Video,
    title: 'Treinamento de habilidades de LIVE',
    desc: 'Plataforma de cursos para treinar e ajudar os criadores a aprimorar suas habilidades de desempenho nas transmissões.',
  },
  {
    icon: Trophy,
    title: 'Oportunidades de crescimento',
    desc: 'Chances de participar de atividades de LIVE para aprender mais, se destacar e se divertir.',
  },
  {
    icon: Gift,
    title: 'Outros Benefícios',
    desc: 'Campanhas mensais, programação de batalhas de live com outros criadores, sorteios de prêmios e bonificações por metas.',
  },
];

const extraBenefits = [
  'Campanhas mensais dirigidas pela agência',
  'Programação de batalhas de live com outros criadores',
  'Sorteios de prêmios e bonificações por metas',
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
      {/* HERO - Convite para fazer parte */}
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
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Faça parte da Lions League Agency</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mb-6"
            >
              Transforme suas{' '}
              <span className="text-gradient">LIVES</span>
              <br />
              em resultados reais
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Junte-se à Lions League Agency e tenha acesso a suporte individual, treinamentos exclusivos e oportunidades de crescimento no mundo das transmissões ao vivo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a
                href="https://www.tiktok.com/t/ZSuWaUkHo/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-lg bg-gradient-primary shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all"
              >
                Seja um agenciado
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-24" style={{ background: 'var(--surface)' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
            >
              Por que ser um <span className="text-gradient">Agenciado?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{ color: 'var(--text-secondary)' }}
            >
              Benefícios exclusivos para quem faz parte da Lions League Agency
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border hover:shadow-lg transition-all group"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text)' }}>{benefit.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{benefit.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Outros benefícios */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-8 rounded-2xl border"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <HeartHandshake className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-xl" style={{ color: 'var(--text)' }}>Outros Benefícios</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {extraBenefits.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <a
                href="https://www.tiktok.com/t/ZSuWaUkHo/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-lg bg-gradient-primary shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                Seja um agenciado
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 border-y" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
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

      {/* PLATAFORMA DE CURSOS */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Exclusivo para agenciados</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
            >
              Plataforma de <span className="text-gradient">Cursos</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{ color: 'var(--text-secondary)' }}
            >
              Treinamentos exclusivos desenvolvidos para agenciados Lions League aprimorarem suas habilidades de LIVE e alcançarem resultados extraordinários.
            </motion.p>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
            <div>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-display text-2xl font-bold mb-2"
              >
                Cursos em <span className="text-gradient">Destaque</span>
              </motion.h3>
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
              Acessar todos os cursos
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
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-lg bg-gradient-primary shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Acessar plataforma de cursos
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'var(--surface)' }}>
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
                style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
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

      {/* CTA FINAL */}
      <section className="py-24">
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
                Pronto para fazer parte?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Junte-se à Lions League Agency e transforme suas lives em uma carreira de sucesso.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://www.tiktok.com/t/ZSuWaUkHo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-2xl font-bold text-lg bg-white text-primary hover:scale-105 transition-all shadow-xl"
                >
                  Seja um agenciado
                </a>
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-2xl font-bold text-lg border-2 border-white text-white hover:bg-white hover:text-primary transition-all"
                >
                  Acessar plataforma
                </Link>
              </div>

              <div className="flex items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">Suporte Individual</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">Treinamentos Exclusivos</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">Oportunidades de Crescimento</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
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
              © 2024 Lions League Agency. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
