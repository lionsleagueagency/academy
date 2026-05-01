import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Play, Clock, BookOpen, BarChart3, ChevronLeft, CheckCircle2,
  Circle, Star, Users, Award, Loader2
} from 'lucide-react';
import { courseService } from '../services/course.service';
import { enrollmentService } from '../services/enrollment.service';
import { progressService } from '../services/progress.service';
import type { CourseDetail } from '../services/course.service';

function getVideoEmbedUrl(url: string): { type: 'youtube' | 'tiktok' | 'direct'; embedUrl: string } | null {
  if (!url) return null;

  // YouTube: watch?v=ID, youtu.be/ID, embed/ID
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1` };
  }

  // YouTube Shorts
  const ytShortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (ytShortsMatch) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytShortsMatch[1]}?rel=0&modestbranding=1` };
  }

  // TikTok
  const tiktokMatch = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
  if (tiktokMatch) {
    return { type: 'tiktok', embedUrl: `https://www.tiktok.com/player/v1/${tiktokMatch[1]}?autoplay=0&mute=0` };
  }

  // Direct video file
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return { type: 'direct', embedUrl: url };
  }

  // Fallback: treat as direct URL
  return { type: 'direct', embedUrl: url };
}

function VideoPlayer({
  url,
  poster,
  onEnded,
}: {
  url: string;
  poster?: string | null;
  onEnded?: () => void;
}) {
  const info = getVideoEmbedUrl(url);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (info?.type !== 'youtube' || !onEnded) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'onStateChange' && data.info === 0) {
          onEnded();
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [info?.type, onEnded]);

  if (!info) return null;

  if (info.type === 'youtube') {
    return (
      <iframe
        ref={iframeRef}
        src={info.embedUrl + '&enablejsapi=1'}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video"
      />
    );
  }

  if (info.type === 'tiktok') {
    return (
      <iframe
        src={info.embedUrl}
        className="w-full h-full"
        allow="fullscreen"
        allowFullScreen
        title="Video"
      />
    );
  }

  return (
    <video
      src={info.embedUrl}
      className="w-full h-full"
      controls
      controlsList="nodownload"
      poster={poster || undefined}
      onContextMenu={(e) => e.preventDefault()}
      onEnded={onEnded}
    />
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [activeModule, setActiveModule] = useState(0);
  const [activeLesson, setActiveLesson] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const res = await courseService.getCourseById(id);
        setCourse(res.data);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar curso');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!id) return;
    try {
      setEnrolling(true);
      await enrollmentService.enrollInCourse(id);
      const res = await courseService.getCourseById(id);
      setCourse(res.data);
    } catch (err: any) {
      alert(err.message || 'Erro ao matricular-se');
    } finally {
      setEnrolling(false);
    }
  };

  const handleLessonComplete = async () => {
    if (!course || !currentLesson || !course.enrollment) return;

    const lessonProgress = course.enrollment.lessonProgress?.find(
      (p) => p.lesson_id === currentLesson.id
    );

    if (lessonProgress?.is_completed) {
      // Already completed, just go to next
      goToNextLesson();
      return;
    }

    try {
      await progressService.updateProgress({
        lessonId: currentLesson.id,
        watchTimeSeconds: currentLesson.video_duration_seconds || 0,
        progressPercent: 100,
        lastPositionSeconds: currentLesson.video_duration_seconds || 0,
        isCompleted: true,
      });

      // Refresh course data to update progress
      const res = await courseService.getCourseById(course.id);
      setCourse(res.data);

      // Go to next lesson
      goToNextLesson();
    } catch (err: any) {
      console.error('Erro ao marcar aula como concluída:', err);
      // Still go to next even if progress save fails
      goToNextLesson();
    }
  };

  const goToNextLesson = () => {
    if (!course) return;

    const currentModuleLessons = course.modules[activeModule]?.lessons || [];
    if (activeLesson + 1 < currentModuleLessons.length) {
      // Next lesson in same module
      setActiveLesson(activeLesson + 1);
    } else if (activeModule + 1 < course.modules.length) {
      // First lesson of next module
      setActiveModule(activeModule + 1);
      setActiveLesson(0);
    }
    // If last lesson, do nothing (stay at current)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BookOpen className="w-16 h-16 mb-4" style={{ color: 'var(--text-muted)' }} />
        <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>{error || 'Curso não encontrado'}</h2>
        <Link to="/dashboard" className="text-primary hover:underline">Voltar para o dashboard</Link>
      </div>
    );
  }

  const currentModule = course.modules[activeModule];
  const currentLesson = currentModule?.lessons[activeLesson];
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.filter((l: any) => {
      const lp = course.enrollment?.lessonProgress?.find((p: any) => p.lesson_id === l.id);
      return lp?.is_completed;
    }).length,
    0
  );

  const isEnrolled = !!course.enrollment;
  const progress = course.enrollment ? parseFloat(course.enrollment.progress_percent) : 0;

  return (
    <div className="space-y-6"
    >
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar para o Dashboard
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="relative aspect-video bg-black">
              {currentLesson ? (
                <>
                  {isEnrolled && currentLesson.video_url ? (
                    <VideoPlayer
                      url={currentLesson.video_url}
                      poster={course.thumbnail_url}
                      onEnded={handleLessonComplete}
                    />
                  ) : (
                    <>
                      <img
                        src={course.thumbnail_url || ''}
                        alt=""
                        className="w-full h-full object-cover opacity-50"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {!isEnrolled ? (
                          <button
                            onClick={handleEnroll}
                            disabled={enrolling}
                            className="px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold hover:scale-105 transition-all disabled:opacity-60"
                          >
                            {enrolling ? 'Matriculando...' : 'Matricule-se para assistir'}
                          </button>
                        ) : (
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3">
                              <Play className="w-8 h-8 text-white ml-1" fill="white" />
                            </div>
                            <p className="text-white/60 text-sm">Vídeo não disponível</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                    <p className="text-white/60 text-sm mb-1">{currentModule.title}</p>
                    <h2 className="text-white font-semibold text-lg">{currentLesson.title}</h2>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-12 h-12 mx-auto mb-3 text-white/40" />
                    <p className="text-white/60">Selecione uma aula para começar</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>{course.title}</h1>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{course.description}</p>
              </div>
              {!isEnrolled && (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:scale-105 transition-all disabled:opacity-60"
                >
                  {enrolling ? '...' : 'Matricular-se'}
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor_name || 'I')}&background=6C5CE7&color=fff`}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{course.instructor_name}</span>
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>•</span>
              <span className="text-sm flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                <Star className="w-4 h-4 text-amber-500" fill="currentColor" /> {course.rating_avg}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>•</span>
              <span className="text-sm flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                <Users className="w-4 h-4" /> {course.students_count?.toLocaleString()} alunos
              </span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>•</span>
              <span className="text-sm flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                <Clock className="w-4 h-4" /> {Math.floor(course.duration_minutes / 60)}h{course.duration_minutes % 60}min
              </span>
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h2 className="font-display text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Conteúdo do Curso</h2>

            <div className="space-y-3">
              {course.modules.map((module, mIdx) => (
                <div
                  key={module.id}
                  className="rounded-xl border overflow-hidden"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                >
                  <button
                    onClick={() => setActiveModule(mIdx === activeModule ? -1 : mIdx)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{ background: 'var(--surface-hover)', color: 'var(--primary)' }}
                      >
                        {mIdx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{module.title}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{module.lessons.length} aulas • {module.duration_minutes}min</p>
                      </div>
                    </div>
                  </button>

                  {mIdx === activeModule && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                        {module.lessons.map((lesson, lIdx) => {
                          const lp = course.enrollment?.lessonProgress?.find((p: any) => p.lesson_id === lesson.id);
                          const isCompleted = !!lp?.is_completed;
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => {
                                if (!isEnrolled) return;
                                setActiveModule(mIdx);
                                setActiveLesson(lIdx);
                              }}
                              className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                                mIdx === activeModule && lIdx === activeLesson
                                  ? 'bg-primary/5'
                                  : 'hover:bg-primary/5'
                              } ${!isEnrolled ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: isCompleted ? 'rgba(108, 92, 231, 0.1)' : 'var(--surface-hover)' }}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-primary" />
                                ) : (
                                  <Circle className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isCompleted ? 'line-through' : ''}`}
                                  style={{ color: isCompleted ? 'var(--text-muted)' : 'var(--text)' }}
                                >
                                  {lesson.title}
                                </p>
                              </div>
                              <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                                {Math.floor((lesson.video_duration_seconds || 0) / 60)}:{String((lesson.video_duration_seconds || 0) % 60).padStart(2, '0')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-hover)' }}>
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>Seu Progresso</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{completedLessons} de {totalLessons} aulas</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{Math.round(progress)}%</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{isEnrolled ? 'Concluído' : 'Não matriculado'}</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-hover)' }}>
                <div className="h-full rounded-full bg-gradient-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="pt-4 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
              {[
                { icon: BookOpen, label: 'Total de Aulas', value: String(totalLessons) },
                { icon: Clock, label: 'Duração Total', value: `${Math.floor(course.duration_minutes / 60)}h${course.duration_minutes % 60}min` },
                { icon: Award, label: 'Certificado', value: progress === 100 ? 'Disponível' : 'Bloqueado' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between"
                >
                  <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <item.icon className="w-4 h-4" /> {item.label}
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {!isEnrolled && (
            <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>Comece agora</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Matricule-se neste curso e tenha acesso a todo o conteúdo.</p>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-primary shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60"
              >
                {enrolling ? 'Matriculando...' : 'Matricular-se Gratuitamente'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
