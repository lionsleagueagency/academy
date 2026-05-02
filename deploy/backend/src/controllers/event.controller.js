import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

export const getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || 'scheduled';
    const eventType = req.query.event_type;
    const upcoming = req.query.upcoming === 'true';

    let whereClause = 'WHERE e.status = ?';
    const params = [status];

    if (eventType) {
      whereClause += ' AND e.event_type = ?';
      params.push(eventType);
    }
    if (upcoming) {
      whereClause += ' AND e.event_date >= CURDATE()';
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM events e ${whereClause}`, params);
    const total = countResult[0].total;

    const events = await query(
      `SELECT e.*, i.name as instructor_name, i.avatar_url as instructor_avatar
       FROM events e
       LEFT JOIN instructors i ON e.instructor_id = i.id
       ${whereClause}
       ORDER BY e.event_date ASC, e.event_time ASC
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      params
    );

    return paginatedResponse(res, events, { page, limit, total, totalPages: Math.ceil(total / limit) }, 'Eventos listados');
  } catch (error) {
    next(error);
  }
};

export const getUpcomingEvents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const events = await query(
      `SELECT e.*, i.name as instructor_name, i.avatar_url as instructor_avatar
       FROM events e
       LEFT JOIN instructors i ON e.instructor_id = i.id
       WHERE e.status = 'scheduled' AND e.event_date >= CURDATE()
       ORDER BY e.event_date ASC, e.event_time ASC
       LIMIT ${parseInt(limit)}`,
      []
    );

    return successResponse(res, events, 'Próximos eventos carregados');
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [event] = await query(
      `SELECT e.*, i.name as instructor_name, i.avatar_url as instructor_avatar
       FROM events e
       LEFT JOIN instructors i ON e.instructor_id = i.id
       WHERE e.id = ?`,
      [id]
    );

    if (!event) {
      return errorResponse(res, 'Evento não encontrado', 404);
    }

    return successResponse(res, event, 'Evento encontrado');
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const {
      title, description, eventDate, eventTime, endDate, endTime,
      location, eventType, isOnline, meetingUrl, instructorId, maxAttendees, isFeatured
    } = req.body;
    const createdBy = req.user.id;

    const id = uuidv4();
    await query(
      `INSERT INTO events (id, title, description, event_date, event_time, end_date, end_time,
        location, event_type, is_online, meeting_url, instructor_id, max_attendees, is_featured, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, title, description, eventDate, eventTime || null, endDate || null, endTime || null,
       location || null, eventType || 'encontro', isOnline || false, meetingUrl || null,
       instructorId || null, maxAttendees || null, isFeatured || false, createdBy]
    );

    const [event] = await query('SELECT * FROM events WHERE id = ?', [id]);
    return successResponse(res, event, 'Evento criado com sucesso', 201);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = ['title', 'description', 'event_date', 'event_time', 'end_date',
      'end_time', 'location', 'event_type', 'is_online', 'meeting_url', 'instructor_id',
      'max_attendees', 'is_featured', 'status'];

    const fields = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (fields.length === 0) {
      return errorResponse(res, 'Nenhum campo para atualizar', 400);
    }

    values.push(id);
    await query(`UPDATE events SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values);

    const [event] = await query('SELECT * FROM events WHERE id = ?', [id]);
    return successResponse(res, event, 'Evento atualizado');
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query("UPDATE events SET status = 'cancelled' WHERE id = ?", [id]);
    return successResponse(res, null, 'Evento cancelado');
  } catch (error) {
    next(error);
  }
};
