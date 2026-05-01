import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag, Plus, Pencil, Trash2, X, Save, Loader2, GripVertical
} from 'lucide-react';
import { api } from '../services/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

interface FormData {
  name: string;
  description: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

const defaultForm: FormData = {
  name: '',
  description: '',
  color: '#6C5CE7',
  sortOrder: 0,
  isActive: true,
};

const colorOptions = [
  '#6C5CE7', '#00CEC9', '#FF6B6B', '#F59E0B', '#10B981',
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#14B8A6',
];

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories') as any;
      setCategories(res.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...defaultForm, sortOrder: categories.length + 1 });
    setError('');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description || '',
      color: cat.color,
      sortOrder: cat.sort_order,
      isActive: !!cat.is_active,
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    try {
      setSaving(true);
      setError('');
      if (editingId) {
        await api.patch(`/categories/${editingId}`, form);
      } else {
        await api.post('/categories', form);
      }
      setShowModal(false);
      await fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/categories/${id}`);
      setDeleteConfirm(null);
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir');
      setDeleteConfirm(null);
    }
  };

  const inputStyle = {
    background: 'var(--surface-hover)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Categorias
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Gerencie as categorias dos cursos
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <Tag className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Nenhuma categoria</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Crie a primeira categoria para organizar seus cursos.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all hover:shadow-sm"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3 shrink-0">
                <GripVertical className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: cat.color + '20' }}
                >
                  <Tag className="w-5 h-5" style={{ color: cat.color }} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{cat.name}</h3>
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: cat.color }}
                  />
                  {!cat.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">Inativa</span>
                  )}
                </div>
                {cat.description && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{cat.description}</p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs px-2 py-1 rounded-lg mr-2" style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>
                  Ordem: {cat.sort_order}
                </span>
                <button
                  onClick={() => openEdit(cat)}
                  className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4 text-primary" />
                </button>
                {deleteConfirm === cat.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="p-1 rounded-lg hover:bg-gray-200"
                    >
                      <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(cat.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border p-6 space-y-5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>
                  {editingId ? 'Editar Categoria' : 'Nova Categoria'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:opacity-70">
                  <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              {error && (
                <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nome *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Marketing Digital"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Descrição</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Breve descrição da categoria..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border resize-none focus:ring-2 focus:ring-primary/30"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Cor</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm({ ...form, color: c })}
                        className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                        style={{
                          background: c,
                          outline: form.color === c ? '3px solid var(--primary)' : 'none',
                          outlineOffset: '2px',
                        }}
                      />
                    ))}
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0"
                      title="Cor personalizada"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Ordem</label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-primary/30"
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Status</label>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="w-4 h-4 rounded accent-primary"
                      />
                      <span className="text-sm" style={{ color: 'var(--text)' }}>Ativa</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
