export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'agent' | 'admin';
  joinedAt: string;
  stats: {
    coursesCompleted: number;
    hoursWatched: number;
    certificates: number;
  };
}

export const currentUser: User = {
  id: '1',
  name: 'Diego Marques',
  email: 'diego@lionsleague.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
  role: 'agent',
  joinedAt: '2024-03-15',
  stats: {
    coursesCompleted: 3,
    hoursWatched: 47,
    certificates: 3,
  }
};

export const users: User[] = [
  currentUser,
  {
    id: '2',
    name: 'Ana Silva',
    email: 'ana@lionsleague.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    role: 'agent',
    joinedAt: '2024-04-20',
    stats: { coursesCompleted: 5, hoursWatched: 82, certificates: 5 }
  },
  {
    id: '3',
    name: 'Pedro Santos',
    email: 'pedro@lionsleague.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    role: 'agent',
    joinedAt: '2024-06-01',
    stats: { coursesCompleted: 1, hoursWatched: 12, certificates: 1 }
  },
  {
    id: '4',
    name: 'Julia Costa',
    email: 'julia@lionsleague.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    role: 'admin',
    joinedAt: '2023-01-10',
    stats: { coursesCompleted: 12, hoursWatched: 156, certificates: 12 }
  },
];
