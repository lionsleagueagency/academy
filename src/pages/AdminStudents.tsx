import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Plus, Search, Pencil, Trash2, Loader2, X, Check
} from 'lucide-react';
import { adminService } from '../services/admin.service';
import { api } from '../services/api';

export default function AdminStudents() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'agent', status: 'active' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({ search, page: 1, limit: 50 });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((u: any) => u.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir');
      setDeleteConfirm(null);
    }
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    try {
      setSaving(true);
      await api.patch(`/users/${editingUser.id}`, {
        name: userForm.name,
        role: userForm.role,
        status: userForm.status,
      });
      setShowModal(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>Agenciados</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Gerencie os agenciados da Lions League</p>
        </div>
        <button
          onClick={() => navigate('/admin/alunos/novo')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Agenciado
        </button>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar agenciados..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border"
          style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <Users className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Nenhum agenciado encontrado</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
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
                      <img
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6C5CE7&color=fff`}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{user.name}</p>
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
                      {user.status === 'active' ? 'Ativo' : 'Suspenso'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(user)} className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
                        <Pencil className="w-4 h-4 text-primary" />
                      </button>
                      {deleteConfirm === user.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(user.id)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold">Confirmar</button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-1 rounded-lg hover:bg-gray-200"><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(user.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
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

      {/* Modal Editar */}
      {showModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border p-6 space-y-5"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>Editar Agenciado</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:opacity-70">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nome</label>
                <input type="text" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30"
                  style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>E-mail</label>
                <input type="email" value={userForm.email} disabled
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border opacity-60"
                  style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tipo</label>
                  <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30"
                    style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    <option value="agent">Agenciado</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
                  <select value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
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
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-60"
              >
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
