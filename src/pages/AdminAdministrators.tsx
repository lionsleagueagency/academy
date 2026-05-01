import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Plus, Search, Pencil, Trash2, Loader2, X, Check,
  User, Mail, Lock, Image, Eye, EyeOff
} from 'lucide-react';
import { adminService } from '../services/admin.service';
import { api } from '../services/api';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  avatarUrl: '',
  status: 'active',
};

export default function AdminAdministrators() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const inputStyle = {
    background: 'var(--surface-hover)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAdministrators({ search });
      setAdmins(Array.isArray(res.data) ? res.data : []);
    } catch {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [search]);

  const openCreate = () => {
    setEditingAdmin(null);
    setForm(emptyForm);
    setError('');
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (admin: any) => {
    setEditingAdmin(admin);
    setForm({
      name: admin.name || '',
      email: admin.email || '',
      password: '',
      avatarUrl: admin.avatar_url || '',
      status: admin.status || 'active',
    });
    setError('');
    setShowPassword(false);
    setShowModal(true);
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const res = await api.upload(file);
      setForm({ ...form, avatarUrl: res.data.url });
    } catch (err: any) {
      setError(err.message || 'Erro no upload da foto');
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    if (!editingAdmin && (!form.email.trim() || !form.password.trim())) {
      setError('E-mail e senha são obrigatórios');
      return;
    }
    if (form.password && form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (editingAdmin) {
        await adminService.updateAdministrator(editingAdmin.id, {
          name: form.name,
          status: form.status,
          avatarUrl: form.avatarUrl || null,
          ...(form.password ? { password: form.password } : {}),
        });
      } else {
        await adminService.createAdministrator({
          name: form.name,
          email: form.email,
          password: form.password,
          avatarUrl: form.avatarUrl || null,
        });
      }

      setShowModal(false);
      setEditingAdmin(null);
      await fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar administrador');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteAdministrator(id);
      setDeleteConfirm(null);
      await fetchAdmins();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir administrador');
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>Administradores</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Gerencie os administradores que podem ser selecionados como instrutores dos cursos.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Administrador
        </button>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar administradores..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border"
          style={inputStyle}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : admins.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <Shield className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Nenhum administrador encontrado</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Administrador</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Criado em</th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin: any) => (
                <tr key={admin.id} className="border-b last:border-0 hover:opacity-80 transition-opacity" style={{ borderColor: 'var(--border)' }}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={admin.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}&background=6C5CE7&color=fff`}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{admin.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      admin.status === 'active' ? 'bg-green-100 text-green-600 dark:bg-green-950/30' :
                      'bg-red-100 text-red-600 dark:bg-red-950/30'
                    }`}>
                      {admin.status === 'active' ? 'Ativo' : 'Suspenso'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(admin)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
                        <Pencil className="w-4 h-4 text-primary" />
                      </button>
                      {deleteConfirm === admin.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(admin.id)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold">Confirmar</button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-1 rounded-lg hover:bg-gray-200">
                            <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(admin.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
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
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>
                {editingAdmin ? 'Editar Administrador' : 'Novo Administrador'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:opacity-70">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-2" style={{ borderColor: 'var(--border)' }} />
              ) : (
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center border-2 border-dashed" style={{ borderColor: 'var(--border)', background: 'var(--surface-hover)' }}>
                  <User className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
                </div>
              )}
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border hover:opacity-80 transition-opacity" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nome *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>E-mail *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    value={form.email}
                    disabled={!!editingAdmin}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {editingAdmin ? 'Nova senha' : 'Senha *'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editingAdmin ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
                    className="w-full pl-11 pr-12 py-3 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30"
                    style={inputStyle}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </div>
              </div>

              {editingAdmin && (
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30"
                    style={inputStyle}
                  >
                    <option value="active">Ativo</option>
                    <option value="suspended">Suspenso</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Salvar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}