import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, User, Shield, Bell, Palette, Globe,
  Key, Mail, Save, Check, Info
} from 'lucide-react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({
    platformName: 'Lions League Academy',
    description: 'Plataforma de treinamento para agenciados',
    contactEmail: 'contato@lionsleague.com',
    supportEmail: 'suporte@lionsleague.com',
    phone: '(11) 99999-9999',
  });

  const [notifications, setNotifications] = useState({
    newEnrollment: true,
    courseCompletion: true,
    newUser: true,
    weeklyReport: true,
    monthlyReport: false,
    systemAlerts: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '60',
    maxLoginAttempts: '5',
    requireStrongPassword: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'appearance', label: 'Aparência', icon: Palette },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>Configurações</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie as configurações da plataforma</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          {saved ? <><Check className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar Alterações</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border p-3 space-y-1" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                  activeTab === tab.id ? 'bg-primary/10 text-primary' : ''
                }`}
                style={activeTab === tab.id ? {} : { color: 'var(--text-secondary)' }}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border p-6 space-y-6"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div>
                <h2 className="font-display text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>Informações Gerais</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Dados básicos da plataforma</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Nome da Plataforma</label>
                  <input
                    type="text"
                    value={general.platformName}
                    onChange={e => setGeneral({ ...general, platformName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email de Contato</label>
                  <input
                    type="email"
                    value={general.contactEmail}
                    onChange={e => setGeneral({ ...general, contactEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email de Suporte</label>
                  <input
                    type="email"
                    value={general.supportEmail}
                    onChange={e => setGeneral({ ...general, supportEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Telefone</label>
                  <input
                    type="text"
                    value={general.phone}
                    onChange={e => setGeneral({ ...general, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Descrição</label>
                <textarea
                  value={general.description}
                  onChange={e => setGeneral({ ...general, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border p-6 space-y-6"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div>
                <h2 className="font-display text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>Notificações</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Configure quais notificações deseja receber</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'newEnrollment', label: 'Nova matrícula', desc: 'Notificar quando um agenciado se matricular em um curso' },
                  { key: 'courseCompletion', label: 'Conclusão de curso', desc: 'Notificar quando um agenciado concluir um curso' },
                  { key: 'newUser', label: 'Novo agenciado', desc: 'Notificar quando um novo agenciado se cadastrar' },
                  { key: 'weeklyReport', label: 'Relatório semanal', desc: 'Receber resumo semanal por email' },
                  { key: 'monthlyReport', label: 'Relatório mensal', desc: 'Receber relatório mensal detalhado' },
                  { key: 'systemAlerts', label: 'Alertas do sistema', desc: 'Erros, atualizações e manutenções' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg)' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(notifications as any)[item.key]}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-600 peer-checked:bg-primary transition-all"></div>
                      <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-sm"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border p-6 space-y-6"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div>
                <h2 className="font-display text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>Segurança</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Políticas de segurança da plataforma</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Autenticação de Dois Fatores</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Exigir 2FA para todos os admins</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={security.twoFactor} onChange={(e) => setSecurity({ ...security, twoFactor: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-600 peer-checked:bg-primary transition-all"></div>
                    <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-sm"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Exigir Senha Forte</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Mínimo 8 caracteres, maiúscula, número e símbolo</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={security.requireStrongPassword} onChange={(e) => setSecurity({ ...security, requireStrongPassword: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-600 peer-checked:bg-primary transition-all"></div>
                    <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-sm"></div>
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Timeout da Sessão (min)</label>
                    <input
                      type="number"
                      value={security.sessionTimeout}
                      onChange={e => setSecurity({ ...security, sessionTimeout: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Máx. Tentativas de Login</label>
                    <input
                      type="number"
                      value={security.maxLoginAttempts}
                      onChange={e => setSecurity({ ...security, maxLoginAttempts: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border p-6 space-y-6"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div>
                <h2 className="font-display text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>Aparência</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Personalize a identidade visual da plataforma</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Cores do Tema</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Primary', color: '#6C5CE7' },
                      { label: 'Accent', color: '#00CEC9' },
                      { label: 'Success', color: '#10B981' },
                      { label: 'Warning', color: '#F59E0B' },
                    ].map(c => (
                      <div key={c.label} className="p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
                        <div className="w-full h-10 rounded-lg mb-2" style={{ background: c.color }} />
                        <p className="text-xs font-medium text-center" style={{ color: 'var(--text)' }}>{c.label}</p>
                        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>{c.color}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'var(--bg)' }}>
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Logotipo e Favicon</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Para alterar o logotipo e favicon da plataforma, faça upload dos arquivos na pasta /public do projeto.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
