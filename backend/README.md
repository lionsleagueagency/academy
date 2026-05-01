# Lions League Academy - API Backend

API REST construída com Node.js, Express e MySQL.

## Tecnologias

- **Node.js** + **Express**
- **MySQL2** (com connection pool)
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **express-validator** para validações
- **Helmet** + **CORS** + **Rate Limit** para segurança

## Estrutura

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Pool de conexão MySQL
│   ├── controllers/
│   │   ├── auth.controller.js   # Autenticação
│   │   ├── user.controller.js   # Usuários
│   │   ├── course.controller.js # Cursos
│   │   ├── enrollment.controller.js  # Matrículas
│   │   ├── progress.controller.js    # Progresso
│   │   ├── dashboard.controller.js   # Dashboard do agenciado
│   │   └── admin.controller.js       # Painel admin
│   ├── middlewares/
│   │   ├── auth.js              # JWT auth + authorize
│   │   └── errorHandler.js      # Tratamento de erros
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── course.routes.js
│   │   ├── enrollment.routes.js
│   │   ├── progress.routes.js
│   │   ├── dashboard.routes.js
│   │   └── admin.routes.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   └── course.validator.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── response.js
│   │   └── seed.js
│   ├── app.js
│   └── server.js
├── .env
└── package.json
```

## Instalação

```bash
cd backend
npm install
```

## Configuração

Crie o arquivo `.env` na pasta `backend/`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=lions_league_academy

JWT_SECRET=sua-chave-secreta-jwt
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

CORS_ORIGIN=http://localhost:5173
```

## Banco de Dados

1. Execute o schema:
```bash
mysql -u root -p lions_league_academy < ../database/schema.sql
```

2. Popule com dados iniciais:
```bash
npm run seed
```

## Executar

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

A API estará disponível em `http://localhost:5000`.

## Endpoints Principais

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/auth/register` | Registrar novo usuário |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/me` | Perfil do usuário logado |
| PATCH | `/api/v1/auth/me` | Atualizar perfil |

### Cursos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/courses` | Listar cursos (público) |
| GET | `/api/v1/courses/:id` | Detalhes do curso |
| POST | `/api/v1/courses` | Criar curso (admin) |

### Matrículas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/enrollments` | Minhas matrículas |
| POST | `/api/v1/enrollments/course/:id` | Matricular-se |

### Progresso
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/progress/lesson/:id` | Atualizar progresso |
| GET | `/api/v1/progress/course/:id` | Progresso do curso |

### Dashboard
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/dashboard` | Dashboard do agenciado |
| GET | `/api/v1/dashboard/certificates` | Certificados |

### Admin
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/admin/stats` | Estatísticas gerais |
| GET | `/api/v1/admin/users` | Listar usuários |
| GET | `/api/v1/admin/courses` | Listar todos os cursos |

## Autenticação

Todas as rotas protegidas requerem o header:
```
Authorization: Bearer <token>
```

## Response Format

```json
{
  "success": true,
  "message": "Sucesso",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
