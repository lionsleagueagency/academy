export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  duration: string;
  lessons: number;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  category: string;
  progress?: number;
  modules: Module[];
  students?: number;
  rating?: number;
}

export interface Module {
  id: string;
  title: string;
  duration: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
}

export const categories = [
  'Todos',
  'Marketing Digital',
  'Vendas',
  'Branding',
  'Negociação',
  'Liderança',
  'Produtividade',
];

export const courses: Course[] = [
  {
    id: '1',
    title: 'Fundamentos do Marketing de Performance',
    description: 'Aprenda as estratégias essenciais para criar campanhas de alta conversão e escalar resultados no digital.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    instructor: 'Rafael Mendes',
    duration: '12h 30min',
    lessons: 24,
    level: 'Iniciante',
    category: 'Marketing Digital',
    progress: 65,
    students: 1240,
    rating: 4.8,
    modules: [
      {
        id: 'm1',
        title: 'Introdução ao Marketing Digital',
        duration: '2h 15min',
        lessons: [
          { id: 'l1', title: 'O que é Marketing de Performance', duration: '15:00', completed: true },
          { id: 'l2', title: 'Métricas que Importam', duration: '22:00', completed: true },
          { id: 'l3', title: 'Configurando seu Pixel', duration: '18:00', completed: true },
        ]
      },
      {
        id: 'm2',
        title: 'Estrutura de Campanhas',
        duration: '3h 45min',
        lessons: [
          { id: 'l4', title: 'Funil de Vendas Completo', duration: '25:00', completed: true },
          { id: 'l5', title: 'Segmentação Avançada', duration: '30:00', completed: false },
          { id: 'l6', title: 'Copywriting para Ads', duration: '28:00', completed: false },
        ]
      },
      {
        id: 'm3',
        title: 'Otimização e Escala',
        duration: '4h 20min',
        lessons: [
          { id: 'l7', title: 'Análise de Métricas', duration: '35:00', completed: false },
          { id: 'l8', title: 'Testes A/B', duration: '40:00', completed: false },
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Copywriting Persuasivo para Agenciados',
    description: 'Domine a arte de escrever textos que vendem. Técnicas comprovadas para anúncios, e-mails e páginas de vendas.',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
    instructor: 'Camila Rocha',
    duration: '8h 15min',
    lessons: 18,
    level: 'Intermediário',
    category: 'Marketing Digital',
    progress: 30,
    students: 890,
    rating: 4.9,
    modules: [
      {
        id: 'm1',
        title: 'Fundamentos da Copy',
        duration: '2h',
        lessons: [
          { id: 'l1', title: 'Psicologia da Persuasão', duration: '20:00', completed: true },
          { id: 'l2', title: 'Estrutura AIDA', duration: '18:00', completed: false },
        ]
      },
      {
        id: 'm2',
        title: 'Copy para Diferentes Canais',
        duration: '3h 30min',
        lessons: [
          { id: 'l3', title: 'Anúncios que Convertem', duration: '25:00', completed: false },
          { id: 'l4', title: 'E-mails Sequenciais', duration: '22:00', completed: false },
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'Negociação de Alto Nível',
    description: 'Técnicas de negociação usadas pelos maiores players do mercado para fechar contratos de alto valor.',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    instructor: 'Bruno Costa',
    duration: '10h 45min',
    lessons: 22,
    level: 'Avançado',
    category: 'Negociação',
    progress: 0,
    students: 650,
    rating: 4.7,
    modules: [
      {
        id: 'm1',
        title: 'Mindset do Negociador',
        duration: '2h 30min',
        lessons: [
          { id: 'l1', title: 'Poder e Posicionamento', duration: '28:00', completed: false },
          { id: 'l2', title: 'Leitura de Cenários', duration: '22:00', completed: false },
        ]
      }
    ]
  },
  {
    id: '4',
    title: 'Branding Pessoal para Agenciados',
    description: 'Construa uma marca pessoal forte que atrai clientes premium e posiciona você como autoridade no mercado.',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    instructor: 'Fernanda Lima',
    duration: '6h 20min',
    lessons: 15,
    level: 'Iniciante',
    category: 'Branding',
    progress: 100,
    students: 1100,
    rating: 4.6,
    modules: []
  },
  {
    id: '5',
    title: 'Vendas Consultivas B2B',
    description: 'Processo completo de vendas complexas para agenciados que querem atuar com empresas de grande porte.',
    thumbnail: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
    instructor: 'Rafael Mendes',
    duration: '14h 00min',
    lessons: 28,
    level: 'Avançado',
    category: 'Vendas',
    progress: 15,
    students: 430,
    rating: 4.9,
    modules: []
  },
  {
    id: '6',
    title: 'Liderança e Gestão de Equipes',
    description: 'Como liderar equipes de alto desempenho e escalar sua operação sem perder a qualidade.',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
    instructor: 'Bruno Costa',
    duration: '9h 30min',
    lessons: 20,
    level: 'Intermediário',
    category: 'Liderança',
    progress: 0,
    students: 320,
    rating: 4.5,
    modules: []
  },
];

export const getCourseById = (id: string) => courses.find(c => c.id === id);
