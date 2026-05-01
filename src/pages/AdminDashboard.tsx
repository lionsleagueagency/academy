import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, TrendingUp, DollarSign, BarChart3,
  MoreHorizontal, Pencil, Trash2, Plus, Search, Filter,
  ArrowUpRight, ArrowDownRight, Activity, Loader2,
  CalendarDays, MapPin, Video, X, Clock, Check
} from 'lucide-react';
import { adminService } from '../services/admin.service';
import { eventService } from '../services/event.service';
import { courseService } from '../services/course.service';
import { api } from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal de evento
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [eventForm, setEventForm] = useState({
    title: '', description: '', eventDate: '', eventTime: '',
    endDate: '', endTime: '', location: '', eventType: 'encontro',
    isOnline: false, meetingUrl: '', instructorId: '', maxAttendees: '',
    isFeatured: false,
  });
  const [instructors, setInstructors] = useState<any[]>([]);

  // Modal de edição de agenciado
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'agent', status: 'active' });
  const [savingUser, setSavingUser] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<string | null>(null);
  const [deleteConfirmCourse, setDeleteConfirmCourse] = useState<string | null>(null);

  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'courses', label: 'Cursos' },
    { id: 'students', label: 'Agenciados' },
    { id: 'events', label: 'Agenda' },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getStats();
        setStats(res.data && typeof res.data === 'object' ? res.data : null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (tab === 'overview') fetchStats();
  }, [tab]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await adminService.getUsers({ search: searchQuery, page: 1, limit: 50 });
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (tab === 'students') fetchUsers();
  }, [tab, searchQuery]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await adminService.getCourses({ page: 1, limit: 50 });
        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (tab === 'courses') fetchCourses();
  }, [tab]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const [eventsRes, instructorsRes] = await Promise.all([
          eventService.getEvents({ status: 'scheduled', page: 1, limit: 50 }),
          courseService.getCategories(),
        ]);
        setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (tab === 'events') fetchEvents();
  }, [tab]);

  const refetchUsers = async () => {
    try {
      const res = await adminService.getUsers({ search: searchQuery, page: 1, limit: 50 });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const openEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      setSavingUser(true);
      await api.patch(`/users/${editingUser.id}`, {
        name: userForm.name,
        role: userForm.role,
        status: userForm.status,
      });
      setShowUserModal(false);
      setEditingUser(null);
      await refetchUsers();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar');
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      setDeleteConfirmUser(null);
      await refetchUsers();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir');
      setDeleteConfirmUser(null);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      await courseService.deleteCourse(id);
      setCourses(courses.filter((c: any) => c.id !== id));
      setDeleteConfirmCourse(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir curso');
      setDeleteConfirmCourse(null);
    }
  };

  const openEventModal = (event?: any) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        title: event.title || '',
        description: event.description || '',
        eventDate: event.event_date ? event.event_date.slice(0, 10) : '',
        eventTime: event.event_time ? event.event_time.slice(0, 5) : '',
        endDate: event.end_date ? event.end_date.slice(0, 10) : '',
        endTime: event.end_time ? event.end_time.slice(0, 5) : '',
        location: event.location || '',
        eventType: event.event_type || 'encontro',
        isOnline: !!event.is_online,
        meetingUrl: event.meeting_url || '',
        instructorId: event.instructor_id || '',
        maxAttendees: event.max_attendees ? String(event.max_attendees) : '',
        isFeatured: !!event.is_featured,
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        title: '', description: '', eventDate: '', eventTime: '',
        endDate: '', endTime: '', location: '', eventType: 'encontro',
        isOnline: false, meetingUrl: '', instructorId: '', maxAttendees: '',
        isFeatured: false,
      });
    }
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: eventForm.title,
        description: eventForm.description || undefined,
        eventDate: eventForm.eventDate,
        eventTime: eventForm.eventTime || undefined,
        endDate: eventForm.endDate || undefined,
        endTime: eventForm.endTime || undefined,
        location: eventForm.location || undefined,
        eventType: eventForm.eventType,
        isOnline: eventForm.isOnline,
        meetingUrl: eventForm.meetingUrl || undefined,
        instructorId: eventForm.instructorId || undefined,
        maxAttendees: eventForm.maxAttendees ? parseInt(eventForm.maxAttendees) : undefined,
        isFeatured: eventForm.isFeatured,
      };

      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, payload);
      } else {
        await eventService.createEvent(payload);
      }

      const res = await eventService.getEvents({ status: 'scheduled', page: 1, limit: 50 });
      setEvents(Array.isArray(res.data) ? res.data : []);
      closeEventModal();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar evento');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar este evento?')) return;
    try {
      await eventService.deleteEvent(id);
      const res = await eventService.getEvents({ status: 'scheduled', page: 1, limit: 50 });
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      alert(err.message || 'Erro ao cancelar evento');
    }
  };

  if (loading && !stats && tab === 'overview') {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const adminStats = stats ? [
    { icon: Users, label: 'Agenciados', value: String(stats.users?.total || 0), change: `+${stats.users?.new_today || 0} hoje`, up: true, color: 'text-primary' },
    { icon: BookOpen, label: 'Cursos Ativos', value: String(stats.courses?.published || 0), change: `${stats.courses?.total || 0} total`, up: true, color: 'text-accent' },
    { icon: TrendingUp, label: 'Taxa de Conclusão', value: `${stats.enrollments?.total ? Math.round((stats.enrollments.completed / stats.enrollments.total) * 100) : 0}%`, change: `${stats.enrollments?.active || 0} ativos`, up: true, color: 'text-green-500' },
    { icon: DollarSign, label: 'Horas Hoje', value: `${stats.engagement?.total_hours_today || 0}h`, change: 'engajamento', up: true, color: 'text-orange-500' },
  ] : [];

  const topCourses = stats?.topCourses || [];
  const recentEnrollments = stats?.recentEnrollments || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            Painel Administrativo
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Gerencie cursos, agenciados e acompanhe os resultados da plataforma.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border hover:shadow-md transition-all"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          <button onClick={() => navigate('/admin/cursos/novo')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <Plus className="w-4 h-4" />
            Novo Curso
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-hover)' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-gradient-primary text-white shadow-md'
                : ''
            }`}
            style={tab === t.id ? {} : { color: 'var(--text-secondary)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-hover)' }}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                    stat.up ? 'text-green-600 bg-green-50 dark:bg-green-950/30' : 'text-red-600 bg-red-50 dark:bg-red-950/30'
                  }`}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <p className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>{stat.value}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-hover)' }}>
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Cursos em Destaque</h2>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Top 5 por matrículas</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Curso</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Alunos</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Conclusão</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Nota</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCourses.map((course: any, i: number) => (
                      <tr key={i} className="border-b last:border-0 hover:opacity-80 transition-opacity" style={{ borderColor: 'var(--border)' }}>
                        <td className="py-4 px-4">
                          <span className="font-medium" style={{ color: 'var(--text)' }}>{course.title}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{course.students_count?.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-hover)' }}>
                              <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${course.completions_count ? Math.round((course.completions_count / course.students_count) * 100) : 0}%` }} />
                            </div>
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{course.completions_count ? Math.round((course.completions_count / course.students_count) * 100) : 0}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{course.rating_avg}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
                              <Pencil className="w-4 h-4 text-primary" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {topCourses.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum dado disponível</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-hover)' }}>
                  <Activity className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Matrículas Recentes</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Últimas 24 horas</p>
                </div>
              </div>

              <div className="space-y-4">
                {recentEnrollments.map((enrollment: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={enrollment.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.user_name)}&background=6C5CE7&color=fff`} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{enrollment.user_name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{enrollment.course_title}</p>
                    </div>
                  </div>
                ))}
                {recentEnrollments.length === 0 && (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>Nenhuma matrícula recente</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'courses' && (
        <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course: any) => (
              <div
                key={course.id}
                className="group rounded-xl border overflow-hidden"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img src={course.thumbnail_url || ''} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2 py-1 rounded-lg text-xs font-medium bg-white/20 backdrop-blur-md text-white">{course.level}</span>
                    <button onClick={() => navigate(`/admin/cursos/${course.id}/editar`)} className="p-2 rounded-lg bg-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="cursor-pointer" onClick={() => navigate(`/admin/cursos/${course.id}/editar`)}>
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>{course.title}</h3>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{course.instructor_name}</p>
                    <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>{course.enrollment_count || 0} alunos</span>
                      <span>{Math.floor(course.duration_minutes / 60)}h{course.duration_minutes % 60}min</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <button onClick={() => navigate(`/admin/cursos/${course.id}/editar`)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors" title="Editar">
                      <Pencil className="w-4 h-4 text-primary" />
                    </button>
                    {deleteConfirmCourse === course.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDeleteCourse(course.id)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold">Confirmar</button>
                        <button onClick={() => setDeleteConfirmCourse(null)} className="p-1 rounded-lg hover:bg-gray-200"><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirmCourse(course.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Excluir">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'students' && (
        <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar agenciados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
              />
            </div>
            <button onClick={() => navigate('/admin/alunos/novo')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4" />
              Novo Agenciado
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Agenciado</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Tipo</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Desde</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-b last:border-0 hover:opacity-80 transition-opacity" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6C5CE7&color=fff`} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text)' }}>{user.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {user.role === 'admin' ? 'Admin' : 'Agenciado'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'active' ? 'bg-green-100 text-green-600 dark:bg-green-950/30' :
                        'bg-red-100 text-red-600 dark:bg-red-950/30'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditUser(user)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
                          <Pencil className="w-4 h-4 text-primary" />
                        </button>
                        {deleteConfirmUser === user.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeleteUser(user.id)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold">
                              Confirmar
                            </button>
                            <button onClick={() => setDeleteConfirmUser(null)} className="p-1 rounded-lg hover:bg-gray-200">
                              <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirmUser(user.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab === 'events' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
              />
            </div>
            <button
              onClick={() => openEventModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Novo Evento
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.filter((ev: any) =>
              !searchQuery || ev.title.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((ev: any) => {
              const eventDate = new Date(ev.event_date);
              const month = eventDate.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
              const day = String(eventDate.getDate()).padStart(2, '0');
              const timeStr = ev.event_time ? ev.event_time.slice(0, 5) : '';
              return (
                <div key={ev.id} className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex flex-col items-center justify-center text-white shrink-0">
                        <span className="text-[10px] font-bold leading-none uppercase">{month}</span>
                        <span className="text-lg font-bold leading-none">{day}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{ev.title}</h3>
                        <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{ev.event_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEventModal(ev)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
                        <Pencil className="w-4 h-4 text-primary" />
                      </button>
                      <button onClick={() => handleDeleteEvent(ev.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ev.description && (
                      <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{ev.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {timeStr && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeStr}</span>
                      )}
                      {ev.is_online ? (
                        <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Online</span>
                      ) : ev.location ? (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.location}</span>
                      ) : null}
                      {ev.max_attendees && (
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Max {ev.max_attendees}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {events.length === 0 && !loading && (
            <div className="text-center py-12">
              <CalendarDays className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Nenhum evento cadastrado</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Evento */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeEventModal} />
          <div className="relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text)' }}>
                {editingEvent ? 'Editar Evento' : 'Novo Evento'}
              </h2>
              <button onClick={closeEventModal} className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Título *</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  placeholder="Nome do evento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Descrição</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  placeholder="Descrição do evento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Data *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.eventDate}
                    onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Hora</label>
                  <input
                    type="time"
                    value={eventForm.eventTime}
                    onChange={(e) => setEventForm({ ...eventForm, eventTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Tipo</label>
                  <select
                    value={eventForm.eventType}
                    onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  >
                    <option value="mentoria">Mentoria</option>
                    <option value="workshop">Workshop</option>
                    <option value="live">Live</option>
                    <option value="aula">Aula</option>
                    <option value="webinar">Webinar</option>
                    <option value="encontro">Encontro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Máx. Participantes</label>
                  <input
                    type="number"
                    value={eventForm.maxAttendees}
                    onChange={(e) => setEventForm({ ...eventForm, maxAttendees: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                    placeholder="Ilimitado"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eventForm.isOnline}
                    onChange={(e) => setEventForm({ ...eventForm, isOnline: e.target.checked })}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Evento Online</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eventForm.isFeatured}
                    onChange={(e) => setEventForm({ ...eventForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Destacado</span>
                </label>
              </div>

              {eventForm.isOnline && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Link da Reunião</label>
                  <input
                    type="url"
                    value={eventForm.meetingUrl}
                    onChange={(e) => setEventForm({ ...eventForm, meetingUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}

              {!eventForm.isOnline && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Local</label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                    placeholder="Endereço ou sala"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEventModal}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border hover:scale-[1.02] transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  {editingEvent ? 'Salvar Alterações' : 'Criar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Agenciado */}
      {showUserModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowUserModal(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border p-6 space-y-5"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>Editar Agenciado</h2>
              <button onClick={() => setShowUserModal(false)} className="p-1 rounded-lg hover:opacity-70">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nome</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30"
                  style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>E-mail</label>
                <input
                  type="email"
                  value={userForm.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border opacity-60"
                  style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tipo</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30"
                    style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    <option value="agent">Agenciado</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30"
                    style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    <option value="active">Ativo</option>
                    <option value="suspended">Suspenso</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                disabled={savingUser}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-60"
              >
                {savingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Salvar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
