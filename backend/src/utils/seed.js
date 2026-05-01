import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    console.log('Starting database seed...');

    const hashedPassword = await bcrypt.hash('123456', 12);

    // --- Users ---
    const [usersCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    if (usersCount[0].count === 0) {
      await pool.execute(`
        INSERT INTO users (id, name, email, password_hash, role, plan, status, avatar_url, created_at)
        VALUES
          (UUID(), 'Diego Marques', 'diego@lionsleague.com', ?, 'agent', 'Elite', 'active', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', NOW()),
          (UUID(), 'Ana Silva', 'ana@lionsleague.com', ?, 'agent', 'Pro', 'active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', NOW()),
          (UUID(), 'Pedro Santos', 'pedro@lionsleague.com', ?, 'agent', 'Starter', 'active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', NOW()),
          (UUID(), 'Julia Costa', 'julia@lionsleague.com', ?, 'admin', 'Elite', 'active', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', NOW()),
          (UUID(), 'Rafael Mendes', 'rafael@lionsleague.com', ?, 'agent', 'Pro', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', NOW()),
          (UUID(), 'Camila Rocha', 'camila@lionsleague.com', ?, 'agent', 'Elite', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', NOW()),
          (UUID(), 'Bruno Costa', 'bruno@lionsleague.com', ?, 'agent', 'Pro', 'active', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80', NOW()),
          (UUID(), 'Fernanda Lima', 'fernanda@lionsleague.com', ?, 'agent', 'Starter', 'active', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80', NOW())
      `, Array(8).fill(hashedPassword));
      console.log('Users seeded.');
    } else {
      console.log('Users already exist. Skipping.');
    }

    // --- Instructors ---
    const [instructorsCount] = await pool.execute('SELECT COUNT(*) as count FROM instructors');
    if (instructorsCount[0].count === 0) {
      await pool.execute(`
        INSERT INTO instructors (id, name, email, bio, specialty, created_at)
        VALUES
          (UUID(), 'Rafael Mendes', 'rafael.instrutor@lionsleague.com',
           'Especialista em Marketing de Performance com 10+ anos de experiência em tráfego pago e conversão.',
           'Marketing Digital', NOW()),
          (UUID(), 'Camila Rocha', 'camila.instrutor@lionsleague.com',
           'Copywriter premiada e estrategista de conteúdo. Especialista em copy persuasiva para anúncios.',
           'Copywriting', NOW()),
          (UUID(), 'Bruno Costa', 'bruno.instrutor@lionsleague.com',
           'Negociador certificado com background em vendas B2B e fechamento de contratos de alto valor.',
           'Negociação', NOW()),
          (UUID(), 'Fernanda Lima', 'fernanda.instrutor@lionsleague.com',
           'Estrategista de marca e posicionamento. Ajuda profissionais a construirem marcas pessoais fortes.',
           'Branding', NOW())
      `);
      console.log('Instructors seeded.');
    } else {
      console.log('Instructors already exist. Skipping.');
    }

    // --- Categories (from schema.sql) ---
    const [categoriesCount] = await pool.execute('SELECT COUNT(*) as count FROM categories');
    if (categoriesCount[0].count === 0) {
      await pool.execute(`
        INSERT INTO categories (id, name, slug, description, color, sort_order, is_active, created_at)
        VALUES
          (UUID(), 'Marketing Digital', 'marketing-digital', 'Estratégias e táticas de marketing digital', '#6C5CE7', 1, TRUE, NOW()),
          (UUID(), 'Vendas', 'vendas', 'Técnicas e processos de vendas', '#00CEC9', 2, TRUE, NOW()),
          (UUID(), 'Branding', 'branding', 'Construção de marca pessoal e corporativa', '#FF6B6B', 3, TRUE, NOW()),
          (UUID(), 'Negociação', 'negociacao', 'Técnicas avançadas de negociação', '#F59E0B', 4, TRUE, NOW()),
          (UUID(), 'Liderança', 'lideranca', 'Gestão de equipes e liderança', '#10B981', 5, TRUE, NOW()),
          (UUID(), 'Produtividade', 'produtividade', 'Ferramentas e métodos de produtividade', '#3B82F6', 6, TRUE, NOW())
      `);
      console.log('Categories seeded.');
    } else {
      console.log('Categories already exist. Skipping.');
    }

    // --- Courses ---
    const [coursesCount] = await pool.execute('SELECT COUNT(*) as count FROM courses');
    if (coursesCount[0].count === 0) {
      const [[catMarketing]] = await pool.execute("SELECT id FROM categories WHERE slug = 'marketing-digital'");
      const [[catVendas]] = await pool.execute("SELECT id FROM categories WHERE slug = 'vendas'");
      const [[catBranding]] = await pool.execute("SELECT id FROM categories WHERE slug = 'branding'");
      const [[catNegociacao]] = await pool.execute("SELECT id FROM categories WHERE slug = 'negociacao'");

      const [[instRafael]] = await pool.execute("SELECT id FROM instructors WHERE email = 'rafael.instrutor@lionsleague.com'");
      const [[instCamila]] = await pool.execute("SELECT id FROM instructors WHERE email = 'camila.instrutor@lionsleague.com'");
      const [[instBruno]] = await pool.execute("SELECT id FROM instructors WHERE email = 'bruno.instrutor@lionsleague.com'");
      const [[instFernanda]] = await pool.execute("SELECT id FROM instructors WHERE email = 'fernanda.instrutor@lionsleague.com'");

      await pool.execute(`
        INSERT INTO courses (id, title, slug, description, short_description, instructor_id, category_id,
          level, duration_minutes, thumbnail_url, status, featured, total_modules, total_lessons,
          students_count, rating_avg, created_at, published_at)
        VALUES
          (UUID(), 'Fundamentos do Marketing de Performance', 'fundamentos-marketing-performance',
           'Aprenda as estratégias essenciais para criar campanhas de alta conversão e escalar resultados no digital.',
           'Domine o marketing de performance do zero',
           ?, ?, 'Iniciante', 750,
           'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
           'published', TRUE, 3, 24, 1240, 4.8, NOW(), NOW()),
          (UUID(), 'Copywriting Persuasivo para Agenciados', 'copywriting-persuasivo',
           'Domine a arte de escrever textos que vendem. Técnicas comprovadas para anúncios, e-mails e páginas de vendas.',
           'Escreva copy que converte em qualquer canal',
           ?, ?, 'Intermediario', 495,
           'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
           'published', TRUE, 2, 18, 890, 4.9, NOW(), NOW()),
          (UUID(), 'Negociação de Alto Nível', 'negociacao-alto-nivel',
           'Técnicas de negociação usadas pelos maiores players do mercado para fechar contratos de alto valor.',
           'Feche contratos como um profissional de elite',
           ?, ?, 'Avancado', 645,
           'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
           'published', FALSE, 2, 22, 650, 4.7, NOW(), NOW()),
          (UUID(), 'Branding Pessoal para Agenciados', 'branding-pessoal',
           'Construa uma marca pessoal forte que atrai clientes premium e posiciona você como autoridade no mercado.',
           'Posicione-se como autoridade no seu nicho',
           ?, ?, 'Iniciante', 380,
           'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
           'published', TRUE, 2, 15, 1100, 4.6, NOW(), NOW()),
          (UUID(), 'Vendas Consultivas B2B', 'vendas-consultivas-b2b',
           'Processo completo de vendas complexas para agenciados que querem atuar com empresas de grande porte.',
           'Venda para empresas de grande porte',
           ?, ?, 'Avancado', 840,
           'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
           'published', FALSE, 3, 28, 430, 4.9, NOW(), NOW()),
          (UUID(), 'Liderança e Gestão de Equipes', 'lideranca-gestao-equipes',
           'Como liderar equipes de alto desempenho e escalar sua operação sem perder a qualidade.',
           'Lidere equipes de alta performance',
           ?, ?, 'Intermediario', 570,
           'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
           'published', FALSE, 2, 20, 320, 4.5, NOW(), NOW())
      `, [
        instRafael.id, catMarketing.id,
        instCamila.id, catMarketing.id,
        instBruno.id, catNegociacao.id,
        instFernanda.id, catBranding.id,
        instRafael.id, catVendas.id,
        instBruno.id, catNegociacao.id,
      ]);
      console.log('Courses seeded.');
    } else {
      console.log('Courses already exist. Skipping.');
    }

    console.log('Database seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
