import { query } from '../config/database.js';

export const syncAdminInstructor = async (admin) => {
  await query(
    `INSERT INTO instructors (id, name, email, avatar_url, specialty, is_active, created_at)
     VALUES (?, ?, ?, ?, 'Administrador', ?, NOW())
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       email = VALUES(email),
       avatar_url = VALUES(avatar_url),
       specialty = 'Administrador',
       is_active = VALUES(is_active),
       updated_at = NOW()`,
    [
      admin.id,
      admin.name,
      admin.email,
      admin.avatar_url || null,
      admin.status === 'active' && !admin.deleted_at ? 1 : 0,
    ]
  );
};

export const syncAllAdminInstructors = async () => {
  const admins = await query(
    `SELECT id, name, email, avatar_url, status, deleted_at
     FROM users
     WHERE role = 'admin'`
  );

  for (const admin of admins) {
    await syncAdminInstructor(admin);
  }
};