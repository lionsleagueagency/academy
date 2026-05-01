import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Save, User, Mail, Lock, AtSign, Image, Loader2, Eye, EyeOff
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminNewAgent() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    tiktokUsername: '',
    avatarUrl: '',
  });

  const inputStyle = {
    background: 'var(--surface-hover)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Nome, email e senha são obrigatórios');
      return;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await api.post('/admin/agents', {
        name: form.name,
        email: form.email,
        password: form.password,
        tiktokUsername: form.tiktokUsername || null,
        avatarUrl: form.avatarUrl || null,
      });
      navigate('/admin/alunos');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar agenciado');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const res = await api.upload(file);
      setForm({ ...form, avatarUrl: res.data.url });
    } catch (err: any) {
      setError(err.message || 'Erro no upload da foto');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-8"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h1 className="font-display text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>
          Novo Agenciado
        </h1>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-2xl object-cover border-2"
                  style={{ borderColor: 'var(--border)' }}
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center border-2 border-dashed"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-hover)' }}
                >
                  <User className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
                </div>
              )}
            </div>
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                <Image className="w-4 h-4" />
                {form.avatarUrl ? 'Trocar foto' : 'Adicionar foto'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarUpload(file);
                }}
              />
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Nome completo *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome do agenciado"
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30"
                style={inputStyle}
                required
              />
            </div>
          </div>

          {/* TikTok Username */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Username do TikTok
            </label>
            <div className="relative">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={form.tiktokUsername}
                onChange={(e) => setForm({ ...form, tiktokUsername: e.target.value.replace(/^@/, '') })}
                placeholder="username (sem @)"
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              E-mail *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30"
                style={inputStyle}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-11 pr-12 py-3 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30"
                style={inputStyle}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                ) : (
                  <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-3 rounded-xl text-sm font-medium border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Criar Agenciado
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
