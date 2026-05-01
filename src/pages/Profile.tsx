import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, AtSign, Camera, Save, Loader2,
  Lock, Eye, EyeOff, Check, FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    state: '',
    tiktok_username: '',
    avatar_url: '',
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me') as any;
        const u = res.data;
        setForm({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          bio: u.bio || '',
          city: u.city || '',
          state: u.state || '',
          tiktok_username: u.tiktok_username || '',
          avatar_url: u.avatar_url || '',
        });
      } catch (err: any) {
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await api.patch('/auth/me', {
        name: form.name,
        phone: form.phone || null,
        bio: form.bio || null,
        city: form.city || null,
        state: form.state || null,
        tiktok_username: form.tiktok_username || null,
        avatar_url: form.avatar_url || null,
      });
      setSuccess('Perfil atualizado com sucesso!');
      if (refreshUser) refreshUser();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setError('As senhas não conferem');
      return;
    }
    try {
      setChangingPassword(true);
      setError('');
      setSuccess('');
      await api.post('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setSuccess('Senha alterada com sucesso!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const res = await api.upload(file);
      setForm({ ...form, avatar_url: res.data.url });
    } catch (err: any) {
      setError(err.message || 'Erro no upload');
    }
  };

  const inputStyle = {
    background: 'var(--surface-hover)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>Meu Perfil</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Gerencie suas informações pessoais</p>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" /> {success}
        </motion.div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
      )}

      {/* Avatar + Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="relative">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-2" style={{ borderColor: 'var(--border)' }} />
            ) : (
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center border-2 border-dashed"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-hover)' }}>
                <User className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-white" />
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} />
            </label>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text)' }}>{form.name || 'Sem nome'}</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{form.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {user?.role === 'admin' ? 'Administrador' : 'Agenciado'}
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nome completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30" style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input type="email" value={form.email} disabled
                className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none border opacity-60" style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Telefone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30" style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Username TikTok</label>
            <div className="relative">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input type="text" value={form.tiktok_username} onChange={(e) => setForm({ ...form, tiktok_username: e.target.value.replace(/^@/, '') })}
                placeholder="username"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30" style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Cidade</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Sua cidade"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30" style={inputStyle} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Estado</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="UF"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30" style={inputStyle} />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bio</label>
            <div className="relative">
              <FileText className="absolute left-4 top-3 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Fale um pouco sobre você..."
                rows={3}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none border resize-none focus:ring-2 focus:ring-primary/30" style={inputStyle} />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Alterações
          </button>
        </div>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-hover)' }}>
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Alterar Senha</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Atualize sua senha de acesso</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Senha atual</label>
            <div className="relative">
              <input type={showOldPw ? 'text' : 'password'} value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30" style={inputStyle} />
              <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showOldPw ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nova senha</label>
            <div className="relative">
              <input type={showNewPw ? 'text' : 'password'} value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30" style={inputStyle} />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showNewPw ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirmar</label>
            <input type="password" value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30" style={inputStyle} />
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button onClick={handleChangePassword} disabled={changingPassword || !pwForm.currentPassword || !pwForm.newPassword}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-40">
            {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Alterar Senha
          </button>
        </div>
      </motion.div>
    </div>
  );
}
