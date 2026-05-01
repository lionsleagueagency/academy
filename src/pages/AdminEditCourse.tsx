import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Save, BookOpen, Image, Video, Plus,
  Trash2, Clock, Loader2, Send, FileText, X, Pencil, Check
} from 'lucide-react';
import { courseService } from '../services/course.service';
import { api } from '../services/api';

interface ModuleForm {
  id?: string;
  title: string;
  description: string;
  lessons: LessonForm[];
}

interface LessonForm {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  durationMinutes: string;
}

const emptyLesson: LessonForm = { title: '', description: '', videoUrl: '', durationMinutes: '' };

export default function AdminEditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [instructors, setInstructors] = useState<Array<{ id: string; name: string; email: string; avatar_url: string | null }>>([]);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    instructorId: '',
    level: 'Iniciante',
    thumbnailUrl: '',
    trailerUrl: '',
    isFree: false,
    featured: false,
    status: 'draft',
  });

  const [modules, setModules] = useState<ModuleForm[]>([]);
  const [newModules, setNewModules] = useState<ModuleForm[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, instRes, courseRes] = await Promise.all([
          courseService.getCategories(),
          courseService.getInstructors(),
          courseService.getCourseById(id!),
        ]);
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        setInstructors(Array.isArray(instRes.data) ? instRes.data : []);

        const course = courseRes.data;
        setForm({
          title: course.title || '',
          slug: course.slug || '',
          description: course.description || '',
          shortDescription: course.short_description || '',
          categoryId: course.category_id || '',
          instructorId: course.instructor_id || '',
          level: course.level || 'Iniciante',
          thumbnailUrl: course.thumbnail_url || '',
          trailerUrl: (course as any).trailer_url || '',
          isFree: false,
          featured: !!(course as any).featured,
          status: course.status || 'draft',
        });

        const existingModules: ModuleForm[] = (course.modules || []).map((m: any) => ({
          id: m.id,
          title: m.title || '',
          description: m.description || '',
          lessons: (m.lessons || []).map((l: any) => ({
            id: l.id,
            title: l.title || '',
            description: l.description || '',
            videoUrl: l.video_url || '',
            durationMinutes: l.video_duration_seconds ? String(Math.round(l.video_duration_seconds / 60)) : '',
          })),
        }));
        setModules(existingModules);
      } catch (err: any) {
        alert(err.message || 'Erro ao carregar curso');
        navigate('/admin/cursos');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const generateSlug = (title: string) => {
    return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  };

  const handleTitleChange = (title: string) => {
    setForm({ ...form, title, slug: generateSlug(title) });
  };

  // New modules management
  const addNewModule = () => {
    setNewModules([...newModules, { title: '', description: '', lessons: [{ ...emptyLesson }] }]);
  };

  const removeNewModule = (idx: number) => {
    setNewModules(newModules.filter((_, i) => i !== idx));
  };

  const updateNewModule = (idx: number, field: string, value: string) => {
    const updated = [...newModules];
    (updated[idx] as any)[field] = value;
    setNewModules(updated);
  };

  const addNewLesson = (moduleIdx: number) => {
    const updated = [...newModules];
    updated[moduleIdx].lessons.push({ ...emptyLesson });
    setNewModules(updated);
  };

  const removeNewLesson = (moduleIdx: number, lessonIdx: number) => {
    const updated = [...newModules];
    if (updated[moduleIdx].lessons.length === 1) return;
    updated[moduleIdx].lessons = updated[moduleIdx].lessons.filter((_, i) => i !== lessonIdx);
    setNewModules(updated);
  };

  const updateNewLesson = (moduleIdx: number, lessonIdx: number, field: string, value: string) => {
    const updated = [...newModules];
    (updated[moduleIdx].lessons[lessonIdx] as any)[field] = value;
    setNewModules(updated);
  };

  // Add lesson to existing module
  const addLessonToExisting = (moduleIdx: number) => {
    const updated = [...modules];
    updated[moduleIdx].lessons.push({ ...emptyLesson });
    setModules(updated);
  };

  const updateExistingLesson = (moduleIdx: number, lessonIdx: number, field: string, value: string) => {
    const updated = [...modules];
    (updated[moduleIdx].lessons[lessonIdx] as any)[field] = value;
    setModules(updated);
  };

  const [editingLessonKey, setEditingLessonKey] = useState<string | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);

  const toggleEditLesson = (lessonId: string) => {
    setEditingLessonKey(editingLessonKey === lessonId ? null : lessonId);
  };

  const handleSaveLesson = async (lesson: any) => {
    if (!lesson.id) return;
    try {
      await courseService.updateLesson(lesson.id, {
        title: lesson.title,
        description: lesson.description || null,
        videoUrl: lesson.videoUrl || null,
        videoDurationSeconds: (parseInt(lesson.durationMinutes) || 0) * 60,
      });
      setEditingLessonKey(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar aula');
    }
  };

  const handleDeleteLesson = async (moduleIdx: number, lessonIdx: number, lessonId: string) => {
    try {
      await courseService.deleteLesson(lessonId);
      const updated = [...modules];
      updated[moduleIdx].lessons = updated[moduleIdx].lessons.filter((_, i) => i !== lessonIdx);
      setModules(updated);
      setDeletingLessonId(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir aula');
      setDeletingLessonId(null);
    }
  };

  const handleDeleteModule = async (moduleIdx: number, moduleId: string) => {
    try {
      await courseService.deleteModule(moduleId);
      setModules(modules.filter((_, i) => i !== moduleIdx));
      setDeletingModuleId(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir módulo');
      setDeletingModuleId(null);
    }
  };

  const removeExistingNewLesson = (moduleIdx: number, lessonIdx: number) => {
    const updated = [...modules];
    const lesson = updated[moduleIdx].lessons[lessonIdx];
    if (lesson.id) return; // Don't remove saved lessons from UI
    updated[moduleIdx].lessons = updated[moduleIdx].lessons.filter((_, i) => i !== lessonIdx);
    setModules(updated);
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0) +
    newModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalModules = modules.length + newModules.filter(m => m.title).length;

  const handleSave = async (status?: string) => {
    try {
      setSaving(true);

      // Update course info
      await courseService.updateCourse(id!, {
        title: form.title,
        slug: form.slug,
        description: form.description,
        short_description: form.shortDescription,
        category_id: form.categoryId,
        instructor_id: form.instructorId,
        level: form.level,
        thumbnail_url: form.thumbnailUrl || null,
        trailer_url: form.trailerUrl || null,
        featured: form.featured,
        status: status || form.status,
        total_modules: totalModules,
        total_lessons: totalLessons,
      });

      // Add new lessons to existing modules
      for (const mod of modules) {
        if (!mod.id) continue;
        const newLessons = mod.lessons.filter(l => !l.id && l.title);
        for (let li = 0; li < newLessons.length; li++) {
          const lesson = newLessons[li];
          await courseService.createLesson({
            courseId: id,
            moduleId: mod.id,
            title: lesson.title,
            description: lesson.description || null,
            videoUrl: lesson.videoUrl || null,
            videoDurationSeconds: (parseInt(lesson.durationMinutes) || 0) * 60,
            sortOrder: mod.lessons.length + li + 1,
          });
        }
      }

      // Create new modules with lessons
      for (let mi = 0; mi < newModules.length; mi++) {
        const mod = newModules[mi];
        if (!mod.title) continue;

        const modRes = await courseService.createModule({
          courseId: id,
          title: mod.title,
          description: mod.description || null,
          sortOrder: modules.length + mi + 1,
        });

        const moduleId = modRes.data?.id;
        if (moduleId) {
          for (let li = 0; li < mod.lessons.length; li++) {
            const lesson = mod.lessons[li];
            if (!lesson.title) continue;
            await courseService.createLesson({
              courseId: id,
              moduleId,
              title: lesson.title,
              description: lesson.description || null,
              videoUrl: lesson.videoUrl || null,
              videoDurationSeconds: (parseInt(lesson.durationMinutes) || 0) * 60,
              sortOrder: li + 1,
            });
          }
        }
      }

      navigate('/admin/cursos');
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar curso');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: 'var(--surface-hover)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/cursos')} className="p-2 rounded-xl hover:bg-primary/10 transition-colors">
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>Editar Curso</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{form.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            form.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
            form.status === 'draft' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>{form.status === 'published' ? 'Publicado' : form.status === 'draft' ? 'Rascunho' : 'Arquivado'}</span>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border hover:shadow-md transition-all disabled:opacity-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <Save className="w-4 h-4" /> Salvar
          </button>
          {form.status === 'draft' && (
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publicar
            </button>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: 'Informações' },
          { n: 2, label: 'Conteúdo' },
        ].map((s) => (
          <button
            key={s.n}
            onClick={() => setStep(s.n)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              step === s.n ? 'bg-gradient-primary text-white shadow-lg' : ''
            }`}
            style={step === s.n ? {} : { background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
          >
            {s.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {totalLessons} aulas</span>
          <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {totalModules} módulos</span>
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border p-6 space-y-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>Informações Básicas</h2>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Título *</label>
                <input type="text" value={form.title} onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Descrição *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none" style={inputStyle} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Descrição Curta</label>
                <input type="text" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} maxLength={200}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />
              </div>
            </div>

            <div className="rounded-2xl border p-6 space-y-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>Mídia</h2>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Thumbnail do Curso</label>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const res = await api.upload(file);
                      setForm({ ...form, thumbnailUrl: res.data.url });
                    } catch (err: any) {
                      alert(err.message || 'Erro no upload');
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
                {form.thumbnailUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                    <img src={form.thumbnailUrl} alt="Preview" className="w-full aspect-video object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>URL do Trailer</label>
                <input type="url" value={form.trailerUrl} onChange={(e) => setForm({ ...form, trailerUrl: e.target.value })}
                  placeholder="https://..." className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border p-6 space-y-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>Detalhes</h2>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Categoria</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle}>
                  <option value="">Selecione...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Instrutor</label>
                <select value={form.instructorId} onChange={(e) => setForm({ ...form, instructorId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle}>
                  <option value="">Selecione...</option>
                  {instructors.map(i => <option key={i.id} value={i.id}>{i.name} ({i.email})</option>)}
                </select>
                {instructors.length === 0 && (
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Cadastre um administrador ativo em Admin &gt; Administradores para selecioná-lo como instrutor.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Nível</label>
                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle}>
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediario">Intermediário</option>
                  <option value="Avancado">Avançado</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded accent-primary" />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Destacado na Home</span>
                </label>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>Módulos e Aulas</h2>
            <button onClick={addNewModule}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4" /> Novo Módulo
            </button>
          </div>

          {/* Existing modules */}
          {modules.map((mod, mi) => (
            <div key={mod.id || mi} className="rounded-2xl border p-6 space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {mi + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{mod.title}</h3>
                  {mod.description && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{mod.description}</p>}
                </div>
                <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>
                  {mod.lessons.length} aulas
                </span>
                {mod.id && (
                  deletingModuleId === mod.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDeleteModule(mi, mod.id!)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold">Confirmar</button>
                      <button onClick={() => setDeletingModuleId(null)} className="p-1 rounded-lg hover:bg-gray-200"><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
                    </div>
                  ) : (
                    <button onClick={() => setDeletingModuleId(mod.id!)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Excluir módulo">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )
                )}
              </div>

              <div className="space-y-2">
                {mod.lessons.map((lesson, li) => (
                  <div key={lesson.id || `new-${li}`} className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ background: lesson.id ? 'var(--bg)' : 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'var(--surface-hover)', color: 'var(--primary)' }}>{li + 1}</div>
                    {lesson.id ? (
                      editingLessonKey === lesson.id ? (
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <input type="text" value={lesson.title} onChange={(e) => updateExistingLesson(mi, li, 'title', e.target.value)}
                            placeholder="Título" className="col-span-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />
                          <input type="url" value={lesson.videoUrl} onChange={(e) => updateExistingLesson(mi, li, 'videoUrl', e.target.value)}
                            placeholder="URL do vídeo" className="col-span-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />
                          <div className="relative">
                            <input type="number" value={lesson.durationMinutes} onChange={(e) => updateExistingLesson(mi, li, 'durationMinutes', e.target.value)}
                              placeholder="Min" className="w-full px-3 py-2 pr-10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>min</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{lesson.title}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{lesson.durationMinutes ? `${lesson.durationMinutes} min` : 'Sem duração'}</p>
                        </div>
                      )
                    ) : (
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input type="text" value={lesson.title} onChange={(e) => updateExistingLesson(mi, li, 'title', e.target.value)}
                          placeholder="Título da aula" className="col-span-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />
                        <input type="url" value={lesson.videoUrl} onChange={(e) => updateExistingLesson(mi, li, 'videoUrl', e.target.value)}
                          placeholder="URL do vídeo" className="col-span-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />
                        <div className="relative">
                          <input type="number" value={lesson.durationMinutes} onChange={(e) => updateExistingLesson(mi, li, 'durationMinutes', e.target.value)}
                            placeholder="Min" className="w-full px-3 py-2 pr-10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>min</span>
                        </div>
                      </div>
                    )}
                    {lesson.id ? (
                      <div className="flex items-center gap-1 shrink-0">
                        {editingLessonKey === lesson.id ? (
                          <button onClick={() => handleSaveLesson(lesson)} className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors" title="Salvar">
                            <Check className="w-4 h-4 text-green-500" />
                          </button>
                        ) : (
                          <button onClick={() => toggleEditLesson(lesson.id!)} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors" title="Editar">
                            <Pencil className="w-3.5 h-3.5 text-primary" />
                          </button>
                        )}
                        {deletingLessonId === lesson.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeleteLesson(mi, li, lesson.id!)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold">Sim</button>
                            <button onClick={() => setDeletingLessonId(null)} className="p-1 rounded-lg hover:bg-gray-200"><X className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletingLessonId(lesson.id!)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="Excluir">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button onClick={() => removeExistingNewLesson(mi, li)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={() => addLessonToExisting(mi)}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <Plus className="w-3.5 h-3.5" /> Adicionar Aula a este módulo
              </button>
            </div>
          ))}

          {/* New modules */}
          {newModules.map((mod, mi) => (
            <div key={`new-${mi}`} className="rounded-2xl border-2 border-dashed p-6 space-y-4" style={{ borderColor: 'var(--primary)', background: 'var(--surface)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    +
                  </div>
                  <input type="text" value={mod.title} onChange={(e) => updateNewModule(mi, 'title', e.target.value)}
                    placeholder="Título do novo módulo" className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />
                </div>
                <button onClick={() => removeNewModule(mi)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>

              <input type="text" value={mod.description} onChange={(e) => updateNewModule(mi, 'description', e.target.value)}
                placeholder="Descrição (opcional)" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />

              <div className="space-y-2">
                {mod.lessons.map((lesson, li) => (
                  <div key={li} className="flex items-start gap-3 p-3 rounded-xl border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-1"
                      style={{ background: 'var(--surface-hover)', color: 'var(--primary)' }}>{li + 1}</div>
                    <div className="flex-1 space-y-2">
                      <input type="text" value={lesson.title} onChange={(e) => updateNewLesson(mi, li, 'title', e.target.value)}
                        placeholder="Título da aula" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="url" value={lesson.videoUrl} onChange={(e) => updateNewLesson(mi, li, 'videoUrl', e.target.value)}
                          placeholder="URL do vídeo" className="px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />
                        <div className="relative">
                          <input type="number" value={lesson.durationMinutes} onChange={(e) => updateNewLesson(mi, li, 'durationMinutes', e.target.value)}
                            placeholder="Duração" className="w-full px-4 py-2.5 pr-12 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>min</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeNewLesson(mi, li)} disabled={mod.lessons.length === 1}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-30 mt-1">
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={() => addNewLesson(mi)} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <Plus className="w-3.5 h-3.5" /> Adicionar Aula
              </button>
            </div>
          ))}

          {modules.length === 0 && newModules.length === 0 && (
            <div className="text-center py-12 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Nenhum módulo cadastrado</p>
              <button onClick={addNewModule} className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-primary">
                Adicionar Primeiro Módulo
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
