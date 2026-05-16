-- Script SQL para criar usuário admin padrão
-- Execute: mysql -u c1useracademy -p'wcYq9KBo!mVwM' c1academydb < admin.sql

-- Inserir admin (senha: 123456)
INSERT INTO users (id, name, email, password_hash, role, status, created_at) 
VALUES 
(UUID(), 'Julia Costa', 'julia@lionsleague.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6', 'admin', 'active', NOW()),
(UUID(), 'Diego Marques', 'diego@lionsleague.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6', 'agent', 'active', NOW()),
(UUID(), 'Ana Silva', 'ana@lionsleague.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6', 'agent', 'active', NOW())
ON DUPLICATE KEY UPDATE email=email;
