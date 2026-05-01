import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Save, BookOpen, Image, Video, Plus,
  Trash2, Clock, Loader2, Send,
  FileText, X
} from 'lucide-react';
import { courseService } from '../services/course.service';
import { api } from '../services/api';

interface ModuleForm {
  title: string;
  description: string;
  lessons: LessonForm[];
}

interface LessonForm {
  title: string;
  description: string;
  videoUrl: string;
  durationMinutes: string;
}

const emptyLesson: LessonForm = { title: '', description: '', videoUrl: '', durationMinutes: '' };
const emptyModule: ModuleForm = { title: '', description: '', lessons: [{ ...emptyLesson }] };

export default function AdminNewCourse() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
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
  });

  const [modules, setModules] = useState<ModuleForm[]>([{ ...emptyModule }]);

  useEffect(() => {
    Promise.all([
      courseService.getCategories(),
      courseService.getInstructors(),
    ]).then(([catRes, instRes]) => {
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setInstructors(Array.isArray(instRes.data) ? instRes.data : []);
    });
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setForm({ ...form, title, slug: generateSlug(title) });
  };

  const addModule = () => {
    setModules([...modules, { title: '', description: '', lessons: [{ ...emptyLesson }] }]);
  };

  const removeModule = (idx: number) => {
    if (modules.length === 1) return;
    setModules(modules.filter((_, i) => i !== idx));
  };

  const updateModule = (idx: number, field: string, value: string) => {
    const updated = [...modules];
    (updated[idx] as any)[field] = value;
    setModules(updated);
  };

  const addLesson = (moduleIdx: number) => {
    const updated = [...modules];
    updated[moduleIdx].lessons.push({ ...emptyLesson });
    setModules(updated);
  };

  const removeLesson = (moduleIdx: number, lessonIdx: number) => {
    const updated = [...modules];
    if (updated[moduleIdx].lessons.length === 1) return;
    updated[moduleIdx].lessons = updated[moduleIdx].lessons.filter((_, i) => i !== lessonIdx);
    setModules(updated);
  };

  const updateLesson = (moduleIdx: number, lessonIdx: number, field: string, value: string) => {
    const updated = [...modules];
    (updated[moduleIdx].lessons[lessonIdx] as any)[field] = value;
    setModules(updated);
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalMinutes = modules.reduce((acc, m) =>
    acc + m.lessons.reduce((a, l) => a + (parseInt(l.durationMinutes) || 0), 0), 0);

  const canGoToStep2 = form.title && form.slug && form.description && form.categoryId && form.instructorId;
  const canPublish = canGoToStep2 && modules.every(m => m.title && m.lessons.every(l => l.title));

  const handleSave = async (status: 'draft' | 'published') => {
    if (!canGoToStep2) return;
    try {
      setSaving(true);

      const courseRes = await courseService.createCourse({
        title: form.title,
        slug: form.slug,
        description: form.description,
        shortDescription: form.shortDescription,
        categoryId: form.categoryId,
        instructorId: form.instructorId,
        level: form.level,
        thumbnailUrl: form.thumbnailUrl || null,
        featured: form.featured,
        durationMinutes: totalMinutes,
      });

      const courseId = courseRes.data?.id;

      if (courseId && modules.some(m => m.title)) {
        for (let mi = 0; mi < modules.length; mi++) {
          const mod = modules[mi];
          if (!mod.title) continue;

          const modRes = await courseService.createModule({
            courseId,
            title: mod.title,
            description: mod.description || null,
            sortOrder: mi + 1,
          });

          const moduleId = modRes.data?.id;
          if (moduleId) {
            for (let li = 0; li < mod.lessons.length; li++) {
              const lesson = mod.lessons[li];
              if (!lesson.title) continue;

              await courseService.createLesson({
                courseId,
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

        await courseService.updateCourse(courseId, {
          status,
          total_modules: modules.filter(m => m.title).length,
          total_lessons: totalLessons,
          duration_minutes: totalMinutes,
        });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/cursos')}
            className="p-2 rounded-xl hover:bg-primary/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>Novo Curso</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Preencha as informações do treinamento</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving || !canGoToStep2}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border hover:shadow-md transition-all disabled:opacity-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <Save className="w-4 h-4" /> Salvar Rascunho
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving || !canPublish}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Publicar Curso
          </button>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: 'Informações' },
          { n: 2, label: 'Conteúdo' },
        ].map((s) => (
          <button
            key={s.n}
            onClick={() => s.n === 1 || canGoToStep2 ? setStep(s.n) : null}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              step === s.n ? 'bg-gradient-primary text-white shadow-lg' : ''
            }`}
            style={step === s.n ? {} : { background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s.n ? 'bg-white/20' : ''
            }`}
              style={step !== s.n ? { background: 'var(--border)' } : {}}
            >{s.n}</span>
            {s.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {totalLessons} aulas</span>
          <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {modules.filter(m => m.title).length} módulos</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {Math.floor(totalMinutes / 60)}h{totalMinutes % 60}min</span>
        </div>
      </div>

      {/* Step 1: Course Info */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border p-6 space-y-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>Informações Básicas</h2>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Título do Curso *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ex: Fundamentos do Marketing de Performance"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Slug (URL) *</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm shrink-0" style={{ color: 'var(--text-muted)' }}>/curso/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Descrição Completa *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  placeholder="Descreva o que o aluno vai aprender neste curso..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Descrição Curta</label>
                <input
                  type="text"
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  maxLength={200}
                  placeholder="Resumo curto para cards e listagens (max 200 chars)"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  style={inputStyle}
                />
                <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{form.shortDescription.length}/200</p>
              </div>
            </div>

            <div className="rounded-2xl border p-6 space-y-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>Mídia</h2>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Thumbnail do Curso</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--surface-hover)' }}>
                    <Image className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
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
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
                {form.thumbnailUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                    <img src={form.thumbnailUrl} alt="Preview" className="w-full aspect-video object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>URL do Trailer (opcional)</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--surface-hover)' }}>
                    <Video className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <input
                    type="url"
                    value={form.trailerUrl}
                    onChange={(e) => setForm({ ...form, trailerUrl: e.target.value })}
                    placeholder="https://vimeo.com/..."
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border p-6 space-y-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>Detalhes</h2>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Categoria *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  style={inputStyle}
                >
                  <option value="">Selecione...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Instrutor *</label>
                <select
                  value={form.instructorId}
                  onChange={(e) => setForm({ ...form, instructorId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  style={inputStyle}
                >
                  <option value="">Selecione...</option>
                  {instructors.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.email})</option>
                  ))}
                </select>
                {instructors.length === 0 && (
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Cadastre um administrador ativo em Admin &gt; Administradores para selecioná-lo como instrutor.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Nível</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  style={inputStyle}
                >
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediario">Intermediário</option>
                  <option value="Avancado">Avançado</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Destacado na Home</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => canGoToStep2 && setStep(2)}
              disabled={!canGoToStep2}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              Próximo: Conteúdo do Curso
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Modules & Lessons */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>Módulos e Aulas</h2>
            <button
              onClick={addModule}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-4 h-4" /> Adicionar Módulo
            </button>
          </div>

          {modules.map((mod, mi) => (
            <div
              key={mi}
              className="rounded-2xl border p-6 space-y-5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {mi + 1}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) => updateModule(mi, 'title', e.target.value)}
                      placeholder={`Título do Módulo ${mi + 1}`}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/30"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeModule(mi)}
                  disabled={modules.length === 1}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={mod.description}
                  onChange={(e) => updateModule(mi, 'description', e.target.value)}
                  placeholder="Descrição do módulo (opcional)"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  style={inputStyle}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Aulas ({mod.lessons.length})</p>
                  <button
                    onClick={() => addLesson(mi)}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Aula
                  </button>
                </div>

                {mod.lessons.map((lesson, li) => (
                  <div
                    key={li}
                    className="flex items-start gap-3 p-4 rounded-xl border"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-1"
                      style={{ background: 'var(--surface-hover)', color: 'var(--primary)' }}
                    >
                      {li + 1}
                    </div>
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => updateLesson(mi, li, 'title', e.target.value)}
                        placeholder={`Título da Aula ${li + 1}`}
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        style={inputStyle}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="url"
                          value={lesson.videoUrl}
                          onChange={(e) => updateLesson(mi, li, 'videoUrl', e.target.value)}
                          placeholder="URL do vídeo"
                          className="px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                          style={inputStyle}
                        />
                        <div className="relative">
                          <input
                            type="number"
                            value={lesson.durationMinutes}
                            onChange={(e) => updateLesson(mi, li, 'durationMinutes', e.target.value)}
                            placeholder="Duração"
                            className="w-full px-4 py-2.5 pr-16 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                            style={inputStyle}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>min</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeLesson(mi, li)}
                      disabled={mod.lessons.length === 1}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-30 mt-1"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border hover:shadow-md transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving || !canGoToStep2}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border hover:shadow-md transition-all disabled:opacity-50"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <Save className="w-4 h-4" /> Salvar Rascunho
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving || !canPublish}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Publicar Curso
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
