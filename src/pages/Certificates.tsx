import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Download, ExternalLink, Calendar, CheckCircle2,
  BookOpen, Loader2, FileText, Shield, X, Crown, User, Clock
} from 'lucide-react';
import { dashboardService } from '../services/dashboard.service';
import { api } from '../services/api';

interface Certificate {
  id: string;
  certificate_number: string;
  course_title: string;
  course_thumbnail: string | null;
  issue_date: string;
  verified: number;
  student_name?: string;
  instructor_name?: string;
  duration_minutes?: number;
}

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [verifying, setVerifying] = useState(false);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getCertificates() as any;
      setCertificates(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCertificates(); }, []);

  const handleDownload = (cert: Certificate) => {
    // For now, show the certificate view
    setSelectedCert(cert);
  };

  const handleVerify = async (certNumber: string) => {
    try {
      setVerifying(true);
      const res = await api.get(`/certificates/verify/${certNumber}`) as any;
      if (res.success) {
        alert('Certificado verificado com sucesso!');
      }
    } catch (err: any) {
      alert(err.message || 'Erro na verificação');
    } finally {
      setVerifying(false);
    }
  };

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
        <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>Certificados</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Seus certificados de conclusão dos treinamentos</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border text-center"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>{certificates.length}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Certificados Emitidos</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl border text-center"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <Shield className="w-8 h-8 mx-auto mb-2 text-accent" />
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>{certificates.filter(c => c.verified).length}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Verificados</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl border text-center"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>{certificates.length}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Downloads Disponíveis</p>
        </motion.div>
      </div>

      {certificates.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert: Certificate, i: number) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border overflow-hidden group cursor-pointer"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              onClick={() => handleDownload(cert)}
            >
              <div className="relative aspect-[4/3] bg-gradient-primary p-6 flex flex-col items-center justify-center text-white text-center">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M20 20h20v20H20zM0 0h20v20H0z'/%3E%3C/g%3E%3C/svg%3E")` }}
                />
                <Award className="w-12 h-12 mb-3 relative z-10" />
                <p className="font-display text-lg font-bold relative z-10">Lions League Academy</p>
                <p className="text-sm text-white/80 relative z-10 mt-1">Certificado de Conclusão</p>
                <p className="text-xs text-white/60 mt-2 relative z-10 font-mono">{cert.certificate_number}</p>
              </div>
              <div className="p-5">
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>{cert.course_title}</h3>
                <div className="flex items-center gap-3 text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(cert.issue_date).toLocaleDateString('pt-BR')}
                  </span>
                  {cert.verified ? (
                    <span className="flex items-center gap-1 text-green-500">
                      <CheckCircle2 className="w-3 h-3" /> Verificado
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary hover:scale-[1.02] transition-all"
                    onClick={(e) => { e.stopPropagation(); handleDownload(cert); }}
                  >
                    <ExternalLink className="w-4 h-4" /> Visualizar
                  </button>
                  <button
                    className="p-2.5 rounded-xl border hover:bg-primary/5 transition-colors"
                    style={{ borderColor: 'var(--border)' }}
                    onClick={(e) => { e.stopPropagation(); handleVerify(cert.certificate_number); }}
                    disabled={verifying}
                  >
                    <Shield className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border p-12 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <Award className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Nenhum certificado ainda</h2>
          <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Complete um treinamento para receber seu certificado de conclusão. Seus certificados ficarão disponíveis aqui.
          </p>
          <a href="/dashboard/cursos" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-primary hover:scale-105 transition-all">
            <BookOpen className="w-5 h-5" /> Explorar Cursos
          </a>
        </div>
      )}

      {/* Certificate Modal */}
      <AnimatePresence>
        {selectedCert && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedCert(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl"
                style={{ background: 'var(--surface)', border: '8px solid var(--primary)' }}
              >
                {/* Certificate Header */}
                <div className="bg-gradient-primary p-8 text-white text-center relative">
                  <button
                    onClick={() => setSelectedCert(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Crown className="w-8 h-8" />
                    <div className="text-left">
                      <p className="font-display text-xl font-bold">Lions League</p>
                      <p className="text-sm font-medium -mt-1">Academy</p>
                    </div>
                  </div>

                  <Award className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="font-display text-3xl font-bold mb-2">Certificado de Conclusão</h2>
                  <p className="text-white/80">Este certificado é concedido a</p>
                </div>

                {/* Certificate Body */}
                <div className="p-8 text-center space-y-6">
                  <div>
                    <p className="text-lg" style={{ color: 'var(--text-muted)' }}><User className="w-4 h-4 inline mr-1" /> Aluno</p>
                    <p className="font-display text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{selectedCert.student_name || 'Aluno'}</p>
                  </div>

                  <div className="w-16 h-px mx-auto" style={{ background: 'var(--border)' }} />

                  <div>
                    <p className="text-lg" style={{ color: 'var(--text-muted)' }}><BookOpen className="w-4 h-4 inline mr-1" /> Curso Concluído</p>
                    <p className="font-display text-2xl font-bold mt-1" style={{ color: 'var(--primary)' }}>{selectedCert.course_title}</p>
                  </div>

                  <div className="w-16 h-px mx-auto" style={{ background: 'var(--border)' }} />

                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <Calendar className="w-4 h-4" />
                      <span>Emitido em {new Date(selectedCert.issue_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {selectedCert.duration_minutes && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        <Clock className="w-4 h-4" />
                        <span>{Math.round(selectedCert.duration_minutes / 60)}h de conteúdo</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      Nº {selectedCert.certificate_number}
                    </p>
                    {selectedCert.verified && (
                      <div className="flex items-center justify-center gap-2 mt-2 text-green-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Certificado Verificado</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-3 pt-4">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-primary hover:scale-105 transition-all"
                    >
                      <Download className="w-4 h-4" /> Imprimir / Salvar PDF
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
