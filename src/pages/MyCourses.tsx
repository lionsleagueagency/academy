import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Play, Clock, Star, Search, Filter,
  Loader2, CheckCircle2, ChevronRight
} from 'lucide-react';
import { courseService } from '../services/course.service';
import { enrollmentService } from '../services/enrollment.service';
import type { Course } from '../services/course.service';
import type { Enrollment } from '../services/enrollment.service';

export default function MyCourses() {
  const [tab, setTab] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [enrollRes, courseRes, catRes] = await Promise.all([
          enrollmentService.getMyEnrollments(),
          courseService.getCourses({ limit: 50 }),
          courseService.getCategories(),
        ]);
        setEnrollments(Array.isArray(enrollRes.data) ? enrollRes.data : []);
        setAllCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const inProgress = enrollments.filter(e => e.status === 'active' && parseFloat(e.progress_percent) > 0 && parseFloat(e.progress_percent) < 100);
  const completed = enrollments.filter(e => e.status === 'completed');
  const notStarted = enrollments.filter(e => e.status === 'active' && parseFloat(e.progress_percent) === 0);

  const filteredCourses = allCourses.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory !== 'Todos' && c.category_name !== selectedCategory) return false;
    return true;
  });

  const enrolledIds = new Set(enrollments.map(e => e.course_id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>Meus Cursos</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Acompanhe seu progresso e explore novos treinamentos</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Em Andamento', value: inProgress.length, color: 'text-primary' },
          { label: 'Concluídos', value: completed.length, color: 'text-green-500' },
          { label: 'Não Iniciados', value: notStarted.length, color: 'text-orange-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl border text-center"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className={`font-display text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Enrolled courses */}
      {enrollments.length > 0 && (
        <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-display text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Meus Treinamentos</h2>

          <div className="flex gap-2 mb-6">
            {[
              { id: 'all' as const, label: `Todos (${enrollments.length})` },
              { id: 'in_progress' as const, label: `Em Andamento (${inProgress.length})` },
              { id: 'completed' as const, label: `Concluídos (${completed.length})` },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tab === t.id ? 'bg-gradient-primary text-white shadow-lg shadow-primary/25' : ''
                }`}
                style={tab === t.id ? {} : { background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(tab === 'all' ? enrollments : tab === 'in_progress' ? inProgress : completed).map((enrollment) => {
              const progress = parseFloat(enrollment.progress_percent);
              return (
                <Link
                  key={enrollment.id}
                  to={`/dashboard/curso/${enrollment.course_id}`}
                  className="group rounded-xl border overflow-hidden hover:shadow-lg transition-all"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img src={enrollment.course_thumbnail || ''} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {progress === 100 && (
                      <div className="absolute top-3 right-3">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-green-500 text-white">
                          <CheckCircle2 className="w-3 h-3" /> Concluído
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-white/20 backdrop-blur-md text-white">{enrollment.level}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1" style={{ color: 'var(--text)' }}>{enrollment.course_title}</h3>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{enrollment.instructor_name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-hover)' }}>
                        <div className="h-full rounded-full bg-gradient-primary transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{Math.round(progress)}%</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {enrollments.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Você ainda não está matriculado em nenhum curso</p>
            </div>
          )}
        </div>
      )}

      {/* Explore courses */}
      <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h2 className="font-display text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Explorar Treinamentos</h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
              style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setSelectedCategory('Todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'Todos' ? 'bg-gradient-primary text-white' : ''
              }`}
              style={selectedCategory === 'Todos' ? {} : { background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.name ? 'bg-gradient-primary text-white' : ''
                }`}
                style={selectedCategory === cat.name ? {} : { background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map(course => (
            <Link
              key={course.id}
              to={`/dashboard/curso/${course.id}`}
              className="group rounded-xl border overflow-hidden hover:shadow-lg transition-all"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={course.thumbnail_url || ''} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {enrolledIds.has(course.id) && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-primary/80 text-white">Matriculado</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-white/20 backdrop-blur-md text-white">{course.level}</span>
                  <span className="text-xs text-white/80 flex items-center gap-1"><Star className="w-3 h-3" fill="currentColor" /> {course.rating_avg}</span>
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
  );
}
