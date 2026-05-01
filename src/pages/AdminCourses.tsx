import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Plus, Search, Pencil, Trash2, Loader2, X
} from 'lucide-react';
import { courseService } from '../services/course.service';

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await courseService.getCourses({ page: 1, limit: 50 });
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const filtered = courses.filter((c: any) =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await courseService.deleteCourse(id);
      setCourses(courses.filter((c: any) => c.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir');
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>Cursos</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Gerencie os treinamentos da plataforma</p>
        </div>
        <button
          onClick={() => navigate('/admin/cursos/novo')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Curso
        </button>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cursos..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border"
          style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Nenhum curso encontrado</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course: any, i: number) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-xl border overflow-hidden"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={course.thumbnail_url || ''} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-white/20 backdrop-blur-md text-white">{course.level}</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    course.status === 'published' ? 'bg-green-500/80 text-white' :
                    course.status === 'draft' ? 'bg-amber-500/80 text-white' :
                    'bg-slate-500/80 text-white'
                  }`}>
                    {course.status === 'published' ? 'Publicado' : course.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>{course.title}</h3>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{course.instructor_name || 'Sem instrutor'}</p>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{course.students_count || 0} alunos</span>
                  <span>{Math.floor((course.duration_minutes || 0) / 60)}h{(course.duration_minutes || 0) % 60}min</span>
                </div>
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button onClick={() => navigate(`/admin/cursos/${course.id}/editar`)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors" title="Editar">
                    <Pencil className="w-4 h-4 text-primary" />
                  </button>
                  {deleteConfirm === course.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(course.id)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold">Confirmar</button>
                      <button onClick={() => setDeleteConfirm(null)} className="p-1 rounded-lg hover:bg-gray-200"><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(course.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Excluir">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
