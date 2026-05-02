-- ============================================================
-- Lions League Academy - Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS lions_league_academy
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lions_league_academy;

-- ============================================================
-- 1. USERS (Agenciados e Admins)
-- ============================================================
CREATE TABLE users (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  avatar_url      VARCHAR(500),
  role            ENUM('agent', 'admin') NOT NULL DEFAULT 'agent',
  plan            ENUM('Starter', 'Pro', 'Elite') NOT NULL DEFAULT 'Starter',
  status          ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  phone           VARCHAR(50),
  bio             TEXT,
  city            VARCHAR(100),
  state           VARCHAR(100),
  country         VARCHAR(100) DEFAULT 'Brasil',
  timezone        VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  language        VARCHAR(10) DEFAULT 'pt-BR',
  theme_preference ENUM('light', 'dark', 'system') DEFAULT 'system',
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified_at TIMESTAMP NULL,
  last_login_at   TIMESTAMP NULL,
  last_ip_address VARCHAR(45),
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP NULL,

  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status),
  INDEX idx_plan (plan),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- 2. CATEGORIES (Categorias de Cursos)
-- ============================================================
CREATE TABLE categories (
  id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  description   TEXT,
  icon          VARCHAR(50),
  color         VARCHAR(7) DEFAULT '#6C5CE7',
  sort_order    INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_slug (slug),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB;

-- ============================================================
-- 3. INSTRUCTORS (Instrutores)
-- ============================================================
CREATE TABLE instructors (
  id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  avatar_url    VARCHAR(500),
  bio           TEXT,
  specialty     VARCHAR(255),
  linkedin_url  VARCHAR(500),
  instagram_url VARCHAR(500),
  website_url   VARCHAR(500),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_name (name)
) ENGINE=InnoDB;

-- ============================================================
-- 4. COURSES (Cursos / Treinamentos)
-- ============================================================
CREATE TABLE courses (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title           VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  short_description VARCHAR(500),
  thumbnail_url   VARCHAR(500),
  trailer_url     VARCHAR(500),
  instructor_id   CHAR(36) NOT NULL,
  category_id     CHAR(36) NOT NULL,
  level           ENUM('Iniciante', 'Intermediario', 'Avancado') NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 0,
  language        VARCHAR(10) DEFAULT 'pt-BR',
  price           DECIMAL(10, 2) DEFAULT 0.00,
  currency        VARCHAR(3) DEFAULT 'BRL',
  status          ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  is_free         BOOLEAN NOT NULL DEFAULT FALSE,
  requires_subscription BOOLEAN NOT NULL DEFAULT FALSE,
  min_plan        ENUM('Starter', 'Pro', 'Elite') DEFAULT 'Starter',
  total_modules   INT NOT NULL DEFAULT 0,
  total_lessons   INT NOT NULL DEFAULT 0,
  rating_avg      DECIMAL(2, 1) DEFAULT 5.0,
  rating_count    INT NOT NULL DEFAULT 0,
  students_count  INT NOT NULL DEFAULT 0,
  completions_count INT NOT NULL DEFAULT 0,
  certificate_template_id CHAR(36),
  meta_title      VARCHAR(255),
  meta_description VARCHAR(500),
  tags            JSON,
  prerequisites   JSON,
  learning_objectives JSON,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at    TIMESTAMP NULL,
  archived_at     TIMESTAMP NULL,

  FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,

  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_level (level),
  INDEX idx_category (category_id),
  INDEX idx_instructor (instructor_id),
  INDEX idx_featured (featured),
  INDEX idx_published_at (published_at),
  FULLTEXT INDEX idx_search (title, description, short_description)
) ENGINE=InnoDB;

-- ============================================================
-- 5. MODULES (Módulos dos Cursos)
-- ============================================================
CREATE TABLE modules (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  course_id       CHAR(36) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  duration_minutes INT NOT NULL DEFAULT 0,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,

  INDEX idx_course (course_id),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB;

-- ============================================================
-- 6. LESSONS (Aulas / Lições)
-- ============================================================
CREATE TABLE lessons (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  module_id       CHAR(36) NOT NULL,
  course_id       CHAR(36) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  video_url       VARCHAR(500),
  video_provider  ENUM('vimeo', 'youtube', 'wistia', 'aws', 'bunny', 'local') DEFAULT 'vimeo',
  video_duration_seconds INT DEFAULT 0,
  thumbnail_url   VARCHAR(500),
  sort_order      INT NOT NULL DEFAULT 0,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  is_free_preview BOOLEAN NOT NULL DEFAULT FALSE,
  attachments     JSON,
  transcript      LONGTEXT,
  resources       JSON,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,

  INDEX idx_module (module_id),
  INDEX idx_course (course_id),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB;

-- ============================================================
-- 7. ENROLLMENTS (Matrículas)
-- ============================================================
CREATE TABLE enrollments (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36) NOT NULL,
  course_id       CHAR(36) NOT NULL,
  status          ENUM('active', 'completed', 'dropped', 'expired') NOT NULL DEFAULT 'active',
  progress_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  completed_lessons INT NOT NULL DEFAULT 0,
  total_lessons   INT NOT NULL DEFAULT 0,
  started_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at    TIMESTAMP NULL,
  last_accessed_at TIMESTAMP NULL,
  expires_at      TIMESTAMP NULL,
  source          ENUM('admin', 'self', 'import', 'api') DEFAULT 'self',
  notes           TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,

  UNIQUE KEY uk_user_course (user_id, course_id),
  INDEX idx_user (user_id),
  INDEX idx_course (course_id),
  INDEX idx_status (status),
  INDEX idx_progress (progress_percent)
) ENGINE=InnoDB;

-- ============================================================
-- 8. LESSON_PROGRESS (Progresso por Aula)
-- ============================================================
CREATE TABLE lesson_progress (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36) NOT NULL,
  lesson_id       CHAR(36) NOT NULL,
  course_id       CHAR(36) NOT NULL,
  module_id       CHAR(36) NOT NULL,
  enrollment_id   CHAR(36) NOT NULL,
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at    TIMESTAMP NULL,
  watch_time_seconds INT NOT NULL DEFAULT 0,
  video_duration_seconds INT DEFAULT 0,
  progress_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  last_position_seconds INT DEFAULT 0,
  first_started_at TIMESTAMP NULL,
  last_watched_at TIMESTAMP NULL,
  watch_count     INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,

  UNIQUE KEY uk_user_lesson (user_id, lesson_id),
  INDEX idx_user (user_id),
  INDEX idx_course (course_id),
  INDEX idx_completed (is_completed)
) ENGINE=InnoDB;

-- ============================================================
-- 9. CERTIFICATES (Certificados)
-- ============================================================
CREATE TABLE certificates (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36) NOT NULL,
  course_id       CHAR(36) NOT NULL,
  enrollment_id   CHAR(36) NOT NULL,
  certificate_number VARCHAR(50) NOT NULL UNIQUE,
  template_id     CHAR(36),
  issue_date      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expiry_date     TIMESTAMP NULL,
  pdf_url         VARCHAR(500),
  verified        BOOLEAN NOT NULL DEFAULT TRUE,
  revoked_at      TIMESTAMP NULL,
  revoked_reason  TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,

  INDEX idx_user (user_id),
  INDEX idx_course (course_id),
  INDEX idx_number (certificate_number)
) ENGINE=InnoDB;

-- ============================================================
-- 10. COURSE_REVIEWS (Avaliações dos Cursos)
-- ============================================================
CREATE TABLE course_reviews (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36) NOT NULL,
  course_id       CHAR(36) NOT NULL,
  enrollment_id   CHAR(36) NOT NULL,
  rating          TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title           VARCHAR(255),
  comment         TEXT,
  is_approved     BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  helpful_count   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,

  UNIQUE KEY uk_user_course_review (user_id, course_id),
  INDEX idx_course (course_id),
  INDEX idx_rating (rating),
  INDEX idx_approved (is_approved)
) ENGINE=InnoDB;

-- ============================================================
-- 11. USER_SESSIONS (Sessões de Login)
-- ============================================================
CREATE TABLE user_sessions (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36) NOT NULL,
  token           VARCHAR(500) NOT NULL,
  refresh_token   VARCHAR(500),
  ip_address      VARCHAR(45),
  user_agent      TEXT,
  device_info     VARCHAR(255),
  location        VARCHAR(255),
  is_valid        BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at      TIMESTAMP NOT NULL,
  last_active_at  TIMESTAMP NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_user (user_id),
  INDEX idx_token (token(255)),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB;

-- ============================================================
-- 12. NOTIFICATIONS (Notificações)
-- ============================================================
CREATE TABLE notifications (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36) NOT NULL,
  type            ENUM('course_update', 'new_lesson', 'certificate_ready', 'reminder', 'announcement', 'mention', 'system') NOT NULL,
  title           VARCHAR(255) NOT NULL,
  message         TEXT,
  data            JSON,
  action_url      VARCHAR(500),
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMP NULL,
  sent_via        ENUM('app', 'email', 'push', 'sms') DEFAULT 'app',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_user (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- 13. USER_ACHIEVEMENTS (Conquistas/Badges)
-- ============================================================
CREATE TABLE achievements (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name            VARCHAR(100) NOT NULL,
  slug            VARCHAR(100) NOT NULL UNIQUE,
  description     TEXT,
  icon_url        VARCHAR(500),
  color           VARCHAR(7) DEFAULT '#6C5CE7',
  criteria_type   ENUM('courses_completed', 'hours_watched', 'streak_days', 'reviews_given', 'certificates_earned', 'custom') NOT NULL,
  criteria_value  INT NOT NULL DEFAULT 1,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE user_achievements (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36) NOT NULL,
  achievement_id  CHAR(36) NOT NULL,
  earned_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  progress        INT NOT NULL DEFAULT 100,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,

  UNIQUE KEY uk_user_achievement (user_id, achievement_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- 14. LEARNING_STREAKS (Sequências de Estudo)
-- ============================================================
CREATE TABLE learning_streaks (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36) NOT NULL,
  current_streak  INT NOT NULL DEFAULT 0,
  longest_streak  INT NOT NULL DEFAULT 0,
  last_study_date DATE NOT NULL,
  total_study_days INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  UNIQUE KEY uk_user_streak (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- 15. DAILY_STUDY_LOGS (Logs Diários de Estudo)
-- ============================================================
CREATE TABLE daily_study_logs (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36) NOT NULL,
  study_date      DATE NOT NULL,
  total_seconds   INT NOT NULL DEFAULT 0,
  lessons_watched INT NOT NULL DEFAULT 0,
  courses_touched INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  UNIQUE KEY uk_user_date (user_id, study_date),
  INDEX idx_study_date (study_date)
) ENGINE=InnoDB;

-- ============================================================
-- 16. ANNOUNCEMENTS (Comunicados da Plataforma)
-- ============================================================
CREATE TABLE announcements (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title           VARCHAR(255) NOT NULL,
  content         TEXT NOT NULL,
  type            ENUM('info', 'warning', 'success', 'feature') NOT NULL DEFAULT 'info',
  target_audience ENUM('all', 'agents', 'admins', 'plans') NOT NULL DEFAULT 'all',
  target_plans    JSON,
  is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  published_at    TIMESTAMP NULL,
  expires_at      TIMESTAMP NULL,
  created_by      CHAR(36) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,

  INDEX idx_active (is_active),
  INDEX idx_published (published_at)
) ENGINE=InnoDB;

-- ============================================================
-- 17. AUDIT_LOGS (Logs de Auditoria)
-- ============================================================
CREATE TABLE audit_logs (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36),
  action          VARCHAR(100) NOT NULL,
  entity_type     VARCHAR(50) NOT NULL,
  entity_id       CHAR(36),
  old_values      JSON,
  new_values      JSON,
  ip_address      VARCHAR(45),
  user_agent      TEXT,
  description     TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- 18. SUBSCRIPTION_PLANS (Planos de Assinatura)
-- ============================================================
CREATE TABLE subscription_plans (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name            VARCHAR(100) NOT NULL,
  slug            VARCHAR(100) NOT NULL UNIQUE,
  description     TEXT,
  monthly_price   DECIMAL(10, 2) NOT NULL,
  yearly_price    DECIMAL(10, 2) NOT NULL,
  currency        VARCHAR(3) DEFAULT 'BRL',
  features        JSON,
  max_courses     INT DEFAULT NULL,
  max_certificates INT DEFAULT NULL,
  support_level   ENUM('community', 'email', 'priority', 'dedicated') DEFAULT 'community',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_slug (slug),
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- ============================================================
-- 19. USER_SUBSCRIPTIONS (Assinaturas dos Usuários)
-- ============================================================
CREATE TABLE user_subscriptions (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36) NOT NULL,
  plan_id         CHAR(36) NOT NULL,
  status          ENUM('active', 'cancelled', 'expired', 'paused', 'trial') NOT NULL DEFAULT 'trial',
  payment_provider ENUM('stripe', 'paypal', 'mercadopago', 'pix', 'manual') DEFAULT 'manual',
  payment_id      VARCHAR(255),
  started_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at      TIMESTAMP NOT NULL,
  cancelled_at    TIMESTAMP NULL,
  cancel_reason   TEXT,
  auto_renew      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT,

  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB;

-- ============================================================
-- 20. COURSE_MATERIALS (Materiais Complementares)
-- ============================================================
CREATE TABLE course_materials (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  course_id       CHAR(36) NOT NULL,
  lesson_id       CHAR(36),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  file_url        VARCHAR(500) NOT NULL,
  file_type       VARCHAR(50),
  file_size       INT,
  download_count  INT NOT NULL DEFAULT 0,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,

  INDEX idx_course (course_id),
  INDEX idx_lesson (lesson_id)
) ENGINE=InnoDB;

-- ============================================================
-- 21. QUIZZES (Questionários)
-- ============================================================
CREATE TABLE quizzes (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  course_id       CHAR(36) NOT NULL,
  lesson_id       CHAR(36),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  passing_score   INT NOT NULL DEFAULT 70,
  max_attempts    INT DEFAULT NULL,
  time_limit_minutes INT DEFAULT NULL,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,

  INDEX idx_course (course_id)
) ENGINE=InnoDB;

CREATE TABLE quiz_questions (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  quiz_id         CHAR(36) NOT NULL,
  question        TEXT NOT NULL,
  question_type   ENUM('multiple_choice', 'true_false', 'multiple_answer') NOT NULL DEFAULT 'multiple_choice',
  options         JSON NOT NULL,
  correct_answers JSON NOT NULL,
  explanation     TEXT,
  points          INT NOT NULL DEFAULT 1,
  sort_order      INT NOT NULL DEFAULT 0,

  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,

  INDEX idx_quiz (quiz_id)
) ENGINE=InnoDB;

CREATE TABLE quiz_attempts (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id         CHAR(36) NOT NULL,
  quiz_id         CHAR(36) NOT NULL,
  enrollment_id   CHAR(36) NOT NULL,
  score           INT NOT NULL DEFAULT 0,
  max_score       INT NOT NULL DEFAULT 0,
  percentage      DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  is_passed       BOOLEAN NOT NULL DEFAULT FALSE,
  answers         JSON,
  started_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at    TIMESTAMP NULL,
  time_spent_seconds INT DEFAULT 0,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,

  INDEX idx_user (user_id),
  INDEX idx_quiz (quiz_id)
) ENGINE=InnoDB;

-- ============================================================
-- 22. EVENTS (Eventos da Agenda)
-- ============================================================
CREATE TABLE events (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  event_date      DATE NOT NULL,
  event_time      TIME NULL,
  end_date        DATE NULL,
  end_time        TIME NULL,
  location        VARCHAR(255),
  event_type      ENUM('mentoria', 'workshop', 'live', 'aula', 'webinar', 'encontro') DEFAULT 'encontro',
  is_online       BOOLEAN NOT NULL DEFAULT FALSE,
  meeting_url     VARCHAR(500),
  instructor_id   CHAR(36),
  max_attendees   INT DEFAULT NULL,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  status          ENUM('scheduled', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  created_by      CHAR(36) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,

  INDEX idx_event_date (event_date),
  INDEX idx_status (status),
  INDEX idx_type (event_type),
  INDEX idx_featured (is_featured)
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Categorias padrão
INSERT INTO categories (id, name, slug, description, color, sort_order) VALUES
  (UUID(), 'Marketing Digital', 'marketing-digital', 'Estratégias e táticas de marketing digital', '#6C5CE7', 1),
  (UUID(), 'Vendas', 'vendas', 'Técnicas e processos de vendas', '#00CEC9', 2),
  (UUID(), 'Branding', 'branding', 'Construção de marca pessoal e corporativa', '#FF6B6B', 3),
  (UUID(), 'Negociação', 'negociacao', 'Técnicas avançadas de negociação', '#F59E0B', 4),
  (UUID(), 'Liderança', 'lideranca', 'Gestão de equipes e liderança', '#10B981', 5),
  (UUID(), 'Produtividade', 'produtividade', 'Ferramentas e métodos de produtividade', '#3B82F6', 6);

-- Planos de assinatura
INSERT INTO subscription_plans (id, name, slug, description, monthly_price, yearly_price, features, support_level, is_active, sort_order) VALUES
  (UUID(), 'Starter', 'starter', 'Acesso aos cursos básicos da plataforma', 97.00, 970.00, '["Acesso a cursos iniciantes", "Certificado digital", "Suporte por email"]', 'email', TRUE, 1),
  (UUID(), 'Pro', 'pro', 'Acesso completo à biblioteca de cursos', 197.00, 1970.00, '["Acesso a todos os cursos", "Certificado digital", "Suporte prioritário", "Comunidade VIP", "Materiais complementares"]', 'priority', TRUE, 2),
  (UUID(), 'Elite', 'elite', 'Experiência completa com mentorias exclusivas', 497.00, 4970.00, '["Acesso a todos os cursos", "Certificado digital", "Suporte dedicado", "Comunidade VIP", "Materiais complementares", "Mentorias ao vivo", "Acesso antecipado"]', 'dedicated', TRUE, 3);

-- Instrutores de exemplo
INSERT INTO instructors (id, name, email, bio, specialty) VALUES
  (UUID(), 'Rafael Mendes', 'rafael@lionsleague.com', 'Especialista em Marketing de Performance com 10+ anos de experiência', 'Marketing Digital'),
  (UUID(), 'Camila Rocha', 'camila@lionsleague.com', 'Copywriter premiada e estrategista de conteúdo', 'Copywriting'),
  (UUID(), 'Bruno Costa', 'bruno@lionsleague.com', 'Negociador certificado com background em vendas B2B', 'Negociação'),
  (UUID(), 'Fernanda Lima', 'fernanda@lionsleague.com', 'Estrategista de marca e posicionamento', 'Branding');

-- Conquistas de exemplo
INSERT INTO achievements (id, name, slug, description, criteria_type, criteria_value, color) VALUES
  (UUID(), 'Primeiros Passos', 'primeiros-passos', 'Complete sua primeira aula', 'courses_completed', 1, '#6C5CE7'),
  (UUID(), 'Maratonista', 'maratonista', 'Assista 10 horas de conteúdo', 'hours_watched', 10, '#00CEC9'),
  (UUID(), 'Foco Total', 'foco-total', 'Mantenha uma sequência de 7 dias estudando', 'streak_days', 7, '#FF6B6B'),
  (UUID(), 'Formado', 'formado', 'Complete seu primeiro curso', 'courses_completed', 1, '#F59E0B'),
  (UUID(), 'Mestre', 'mestre', 'Complete 5 cursos', 'courses_completed', 5, '#10B981');
