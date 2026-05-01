import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle, Search, ChevronDown, ChevronUp, BookOpen,
  MessageSquare, Mail, Phone, FileText, ExternalLink, Zap, Shield
} from 'lucide-react';

const faqItems = [
  {
    q: 'Como acessar os treinamentos?',
    a: 'Após fazer login na plataforma, vá até o menu "Meus Cursos". Lá você encontrará todos os treinamentos disponíveis. Clique em qualquer curso para começar a assistir.'
  },
  {
    q: 'Como funciona o certificado de conclusão?',
    a: 'Ao completar 100% das aulas de um treinamento, o certificado é gerado automaticamente. Você pode acessá-lo na seção "Certificados" do seu dashboard e fazer o download em PDF.'
  },
  {
    q: 'Posso assistir as aulas offline?',
    a: 'Atualmente as aulas estão disponíveis apenas para streaming online. Estamos trabalhando para disponibilizar o download para visualização offline em breve.'
  },
  {
    q: 'Como alterar meus dados?',
    a: 'Acesse a seção de configurações da sua conta pelo menu. Lá você pode atualizar seus dados pessoais e preferências.'
  },
  {
    q: 'Esqueci minha senha, como recuperar?',
    a: 'Na tela de login, clique em "Esqueceu a senha?" e siga as instruções. Um link de redefinição será enviado para seu email cadastrado.'
  },
  {
    q: 'Como participar da comunidade?',
    a: 'A comunidade está disponível para todos os agenciados. Acesse pelo menu "Comunidade" no painel lateral. Lá você pode interagir com outros agenciados, compartilhar experiências e fazer networking.'
  },
  {
    q: 'Os treinamentos têm prazo de validade?',
    a: 'Não! Enquanto estiver ativo como agenciado, você tem acesso ilimitado a todos os treinamentos. Pode reassistir quantas vezes quiser.'
  },
  {
    q: 'Como entrar em contato com o suporte?',
    a: 'Você pode nos contatar pelo email suporte@lionsleague.com, pelo WhatsApp (11) 99999-9999 ou diretamente por esta página na seção de contato abaixo.'
  },
];

const guides = [
  { title: 'Primeiros Passos na Plataforma', icon: Zap, desc: 'Guia completo para novos agenciados' },
  { title: 'Como Maximizar seu Aprendizado', icon: BookOpen, desc: 'Dicas para melhor aproveitamento' },
  { title: 'Regras da Comunidade', icon: Shield, desc: 'Diretrizes e boas práticas' },
  { title: 'Guia de Certificações', icon: FileText, desc: 'Tudo sobre seus certificados' },
];

export default function Help() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredFaq = faqItems.filter(item =>
    item.q.toLowerCase().includes(search.toLowerCase()) ||
    item.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>Central de Ajuda</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Encontre respostas para suas dúvidas ou entre em contato conosco</p>
      </div>

      <div className="rounded-2xl border p-8 text-center bg-gradient-mesh" style={{ borderColor: 'var(--border)' }}>
        <HelpCircle className="w-10 h-10 mx-auto mb-4 text-primary" />
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>Como podemos ajudar?</h2>
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar ajuda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
            style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h2 className="font-display text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Perguntas Frequentes</h2>
            <div className="space-y-2">
              {filteredFaq.map((item, i) => (
                <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left"
                    style={{ background: openFaq === i ? 'var(--surface-hover)' : 'transparent' }}
                  >
                    <span className="font-medium text-sm pr-4" style={{ color: 'var(--text)' }}>{item.q}</span>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 shrink-0 text-primary" /> : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />}
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-4 pb-4"
                    >
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h2 className="font-display text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Guias Rápidos</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {guides.map((guide, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl border hover:shadow-md cursor-pointer transition-all group"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <guide.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{guide.title}</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{guide.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold mb-5" style={{ color: 'var(--text)' }}>Contato</h2>
            <div className="space-y-4">
              <a href="mailto:suporte@lionsleague.com" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors" style={{ background: 'var(--bg)' }}>
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Email</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>suporte@lionsleague.com</p>
                </div>
              </a>
              <a href="https://wa.me/5511999999999" target="_blank" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors" style={{ background: 'var(--bg)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#25D366' }}>
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>WhatsApp</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>(11) 99999-9999</p>
                </div>
              </a>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--surface-hover)' }}>
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Chat ao Vivo</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Seg-Sex, 9h às 18h</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Enviar Mensagem</h2>
            <form className="space-y-3">
              <input
                type="text"
                placeholder="Assunto"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
                style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
              />
              <textarea
                placeholder="Descreva sua dúvida..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                style={{ background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
              />
              <button type="button" className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-primary shadow-lg hover:shadow-xl transition-all">
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
