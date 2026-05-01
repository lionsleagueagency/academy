import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play, Clock, BookOpen, TrendingUp, Award, Flame,
  ChevronRight, Star, BarChart3, Target, Zap, Loader2,
  CalendarDays, MapPin, Video
} from 'lucide-react';
import { courseService } from '../services/course.service';
import { dashboardService } from '../services/dashboard.service';
import { eventService } from '../services/event.service';
import type { Course } from '../services/course.service';
import type { Event } from '../services/event.service';

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; color: string }>>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, courseRes, dashRes, eventsRes] = await Promise.all([
          courseService.getCategories(),
          courseService.getCourses(),
          dashboardService.getAgentDashboard(),
          eventService.getUpcomingEvents(5),
        ]);
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
        setDashboardData(dashRes.data && typeof dashRes.data === 'object' ? dashRes.data : null);
        setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = selectedCategory === 'Todos'
    ? courses
    : courses.filter(c => c.category_name === selectedCategory);

  const inProgress = dashboardData?.inProgress || [];
  const stats = dashboardData?.stats || { active_courses: 0, completed_courses: 0, certificates: 0, hours_watched: 0 };
  const weeklyData = dashboardData?.weeklyData || [];
  const streak = dashboardData?.streak || { current_streak: 0 };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl bg-primary text-white">Recarregar</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            Olá, {dashboardData ? 'Agenciado' : 'Bem-vindo'}!
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Continue de onde parou e mantenha sua sequência de aprendizado.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'var(--surface-hover)' }}>
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold" style={{ color: 'var(--text)' }}>{streak.current_streak} dias</span>
            <span className="text-sm hidden sm:inline" style={{ color: 'var(--text-muted)' }}>de sequência</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Cursos em Andamento', value: String(stats.active_courses), color: 'text-primary' },
          { icon: Award, label: 'Certificados', value: String(stats.certificates), color: 'text-accent' },
          { icon: Clock, label: 'Horas Assistidas', value: `${Math.round((stats.hours_watched || 0) * 10) / 10}h`, color: 'text-orange-500' },
          { icon: TrendingUp, label: 'Concluídos', value: String(stats.completed_courses), color: 'text-green-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-hover)' }}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
            </div>
            <p className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text)' }}>Continue Assistindo</h2>
              <Link
                to="/dashboard/cursos"
                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
              >
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {inProgress.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Você ainda não começou nenhum curso. Explore os treinamentos abaixo!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inProgress.slice(0, 3).map((course: any) => (
                  <Link
                    key={course.id}
                    to={`/dashboard/curso/${course.course_id}`}
                    className="flex gap-4 p-4 rounded-xl border hover:shadow-md transition-all group"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                  >
                    <div className="relative shrink-0 w-24 h-16 sm:w-32 sm:h-20 rounded-lg overflow-hidden">
                      <img src={course.thumbnail_url || '/vite.svg'} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-white" fill="white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base mb-1 truncate" style={{ color: 'var(--text)' }}>{course.title}</h3>
                      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{course.instructor_name}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-hover)' }}>
                          <div
                            className="h-full rounded-full bg-gradient-primary transition-all"
                            style={{ width: `${parseFloat(course.progress_percent)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium shrink-0" style={{ color: 'var(--text-muted)' }}>{Math.round(parseFloat(course.progress_percent))}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text)' }}>Explorar Treinamentos</h2>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
              <button
                onClick={() => setSelectedCategory('Todos')}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'Todos'
                    ? 'bg-gradient-primary text-white shadow-lg shadow-primary/25'
                    : ''
                }`}
                style={selectedCategory === 'Todos' ? {} : { background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.name
                      ? 'bg-gradient-primary text-white shadow-lg shadow-primary/25'
                      : ''
                  }`}
                  style={selectedCategory === cat.name ? {} : { background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {filteredCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/dashboard/curso/${course.id}`}
                  className="group rounded-xl border overflow-hidden hover:shadow-lg transition-all"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img src={course.thumbnail_url || ''} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-white/20 backdrop-blur-md text-white">
                        {course.level}
                      </span>
                      <span className="text-xs text-white/80 flex items-center gap-1">
                        <Star className="w-3 h-3" fill="currentColor" /> {course.rating_avg}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1" style={{ color: 'var(--text)' }}>{course.title}</h3>
                    <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{course.short_description || course.description}</p>
                    <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.total_lessons} aulas</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.floor(course.duration_minutes / 60)}h{course.duration_minutes % 60}min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Agenda (antes Desempenho) */}
          <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-hover)' }}>
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Agenda</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Próximos eventos</p>
              </div>
            </div>

            <div className="space-y-3">
              {events.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>Nenhum evento agendado</p>
              )}
              {events.map((ev: Event) => {
                const eventDate = new Date(ev.event_date);
                const month = eventDate.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
                const day = String(eventDate.getDate()).padStart(2, '0');
                const timeStr = ev.event_time ? ev.event_time.slice(0, 5) : '';
                return (
                  <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex flex-col items-center justify-center text-white shrink-0">
                      <span className="text-[10px] font-bold leading-none uppercase">{month}</span>
                      <span className="text-lg font-bold leading-none">{day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{ev.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {timeStr && (
                          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            <Clock className="w-3 h-3" /> {timeStr}
                          </span>
                        )}
                        {ev.is_online ? (
                          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            <Video className="w-3 h-3" /> Online
                          </span>
                        ) : ev.location ? (
                          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            <MapPin className="w-3 h-3" /> {ev.location}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-hover)' }}>
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Atividade Recente</h2>
            </div>

            <div className="space-y-4">
              {(dashboardData?.recentActivity || []).slice(0, 3).map((activity: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--surface-hover)' }}>
                    <Play className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{activity.lesson_title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{activity.course_title}</p>
                  </div>
                </div>
              ))}
              {(!dashboardData?.recentActivity || dashboardData.recentActivity.length === 0) && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>Nenhuma atividade recente</p>
              )}
            </div>
          </div>

          {/* Desempenho (antes Agenda) */}
          <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-hover)' }}>
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>Desempenho</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Últimos 7 dias</p>
              </div>
            </div>

            <div className="flex items-end gap-2 h-32 mb-4">
              {weeklyData.map((d: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-lg bg-gradient-primary opacity-80 hover:opacity-100 transition-all"
                    style={{ height: `${Math.min((d.hours / 5) * 100, 100)}%` }}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.study_date ? new Date(d.study_date).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '') : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}</span>
                </div>
              ))}
              {weeklyData.length === 0 && [...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-lg opacity-20" style={{ height: '10%', background: 'var(--primary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Target className="w-4 h-4 text-primary" /> Meta Semanal
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{Math.round((stats.hours_watched || 0) * 10) / 10}/20h</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-hover)' }}>
                <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${Math.min(((stats.hours_watched || 0) / 20) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Conquistas</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Flame, label: 'Sequência', value: String(streak.current_streak), color: 'text-orange-500' },
                { icon: Award, label: 'Certs', value: String(stats.certificates), color: 'text-amber-500' },
                { icon: Target, label: 'Cursos', value: String(stats.completed_courses), color: 'text-primary' },
              ].map((item, i) => (
                <div key={i} className="text-center p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
                  <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
                  <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>{item.value}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
