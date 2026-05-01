import { api } from './api';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  end_date: string | null;
  end_time: string | null;
  location: string | null;
  event_type: string;
  is_online: number;
  meeting_url: string | null;
  instructor_id: string | null;
  instructor_name: string | null;
  instructor_avatar: string | null;
  max_attendees: number | null;
  is_featured: number;
  status: string;
  created_at: string;
}

export const eventService = {
  getEvents: (params?: { status?: string; upcoming?: boolean; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.upcoming) query.set('upcoming', 'true');
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return api.get(`/events?${query.toString()}`) as Promise<{ success: boolean; data: Event[]; pagination?: any }>;
  },

  getUpcomingEvents: (limit = 5) =>
    api.get(`/events/upcoming?limit=${limit}`) as Promise<{ success: boolean; data: Event[] }>,

  getEventById: (id: string) =>
    api.get(`/events/${id}`) as Promise<{ success: boolean; data: Event }>,

  createEvent: (data: any) =>
    api.post('/events', data) as Promise<{ success: boolean; data: Event; message: string }>,

  updateEvent: (id: string, data: any) =>
    api.patch(`/events/${id}`, data) as Promise<{ success: boolean; data: Event; message: string }>,

  deleteEvent: (id: string) =>
    api.delete(`/events/${id}`) as Promise<{ success: boolean; message: string }>,
};
