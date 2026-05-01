# Lions League Academy - Deploy em Produção (Linux)

## Requisitos do Servidor

- **Node.js** 18+ (recomendado 20 LTS)
- **MySQL** 8.0+ ou **MariaDB** 10.6+
- **Nginx** (recomendado) ou Apache
- **PM2** para gerenciamento de processos Node.js
- **Certbot** (para SSL/Let's Encrypt)

---

## 1. Configurar o Banco de Dados

```bash
# Acesse o MySQL
mysql -u root -p

# Crie o banco de dados
CREATE DATABASE lions_league_academy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Crie o usuário (ou use root se preferir)
CREATE USER 'lla_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON lions_league_academy.* TO 'lla_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Importe o schema
mysql -u lla_user -p lions_league_academy < database/schema.sql
```

---

## 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e edite:

```bash
cd backend
cp .env.example .env
nano .env
```

Edite conforme seu servidor:

```env
PORT=5000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=lla_user
DB_PASSWORD=sua_senha_segura
DB_NAME=lions_league_academy

# JWT (use uma chave forte e aleatória)
JWT_SECRET=sua-chave-jwt-super-segura-aqui-minimo-32-caracteres
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS (domínio do frontend)
CORS_ORIGIN=https://seu-dominio.com
```

---

## 3. Instalar Dependências

```bash
# Backend
cd backend
npm install --production

# Frontend (na raiz)
cd ..
npm install
npm run build
```

---

## 4. Configurar PM2 para o Backend

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar o backend com PM2
cd backend
pm2 start src/server.js --name "lla-api"

# Salvar configuração para reiniciar automaticamente
pm2 save
pm2 startup
```

---

## 5. Configurar Nginx

Crie o arquivo de configuração:

```bash
sudo nano /etc/nginx/sites-available/lions-league-academy
```

Conteúdo:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Frontend (build estático)
    location / {
        root /var/www/lions-league-academy/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Ative o site:

```bash
sudo ln -s /etc/nginx/sites-available/lions-league-academy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. SSL com Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

---

## 7. Deploy dos Arquivos

Copie o projeto para o servidor:

```bash
# No seu computador local, envie via SCP ou git clone
git clone https://github.com/lionsleagueagency/lions-league-academy.git /var/www/lions-league-academy

# Ou via SCP
scp -r dist/ usuario@servidor:/var/www/lions-league-academy/
```

---

## 8. Estrutura de Diretórios no Servidor

```
/var/www/lions-league-academy/
├── backend/
│   ├── src/
│   ├── uploads/          # Criar e dar permissões
│   ├── .env
│   └── package.json
├── dist/                 # Build do frontend
├── database/
│   └── schema.sql
└── ...
```

---

## 9. Permissões

```bash
# Criar pasta de uploads
mkdir -p /var/www/lions-league-academy/backend/uploads

# Permissões
sudo chown -R www-data:www-data /var/www/lions-league-academy
sudo chmod -R 755 /var/www/lions-league-academy
sudo chmod -R 775 /var/www/lions-league-academy/backend/uploads
```

---

## 10. Comandos Úteis

```bash
# Ver logs do backend
pm2 logs lla-api

# Reiniciar backend
pm2 restart lla-api

# Ver status
pm2 status

# Restart Nginx
sudo systemctl restart nginx

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Checklist Pré-Deploy

- [ ] Banco de dados criado e schema importado
- [ ] Variáveis `.env` configuradas com valores de produção
- [ ] `JWT_SECRET` é uma chave forte e única
- [ ] `CORS_ORIGIN` aponta para o domínio correto
- [ ] `NODE_ENV=production` no backend
- [ ] Build do frontend gerado (`npm run build`)
- [ ] Pasta `uploads/` criada com permissões corretas
- [ ] PM2 configurado para reiniciar automaticamente
- [ ] Nginx configurado e testado
- [ ] SSL/HTTPS ativo
- [ ] Porta 5000 não exposta externamente (apenas via Nginx)
