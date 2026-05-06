#!/bin/bash
# Cloud-Init User Data - Lions League Academy
# Ubuntu Server 24.04 LTS
# Salve como user-data.yml ou cole no campo User Data do provedor cloud

# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependencias
apt install -y curl wget git nginx certbot python3-certbot-nginx ufw software-properties-common apt-transport-https ca-certificates gnupg build-essential

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# Instalar MariaDB
apt install -y mariadb-server mariadb-client
systemctl start mariadb
systemctl enable mariadb

# Configurar firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 5000/tcp
ufw --force enable

# Criar banco de dados e usuario
DB_NAME="academy"
DB_USER="academy"
DB_PASS="NCdAD4ZscrLdbs22"

mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Clonar projeto
APP_DIR="/var/www/academy"
git clone https://github.com/lionsleagueagency/academy.git "$APP_DIR"
cd "$APP_DIR"

# Configurar backend
cd "$APP_DIR/backend"

JWT_SECRET=$(openssl rand -base64 32)

cat > .env <<EOF
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
DB_NAME=${DB_NAME}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=https://SEU_DOMINIO_AQUI
EOF

npm install --production
mkdir -p uploads
chmod 755 uploads

# Importar schema se existir
if [ -f "$APP_DIR/database/schema.sql" ]; then
    mysql -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" < "$APP_DIR/database/schema.sql"
fi

# Iniciar backend com PM2
pm2 start src/server.js --name "lla-api"
pm2 save
pm2 startup systemd -u root --hp /root

# Buildar frontend
cd "$APP_DIR"
npm install
npm run build

# Configurar Nginx
cat > /etc/nginx/sites-available/academy <<'EOF'
server {
    listen 80;
    server_name SEU_DOMINIO_AQUI;

    location / {
        root /var/www/academy/dist;
        try_files $uri $uri/ /index.html;
        index index.html;

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|webp)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

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
        proxy_read_timeout 86400;
    }

    location /uploads/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/academy /etc/nginx/sites-enabled/

nginx -t
systemctl restart nginx

# SSL (execute manualmente apos configurar DNS)
# certbot --nginx -d SEU_DOMINIO_AQUI --non-interactive --agree-tos -m SEU_EMAIL_AQUI

echo "========================================"
echo "  Instalacao Concluida!"
echo "========================================"
echo "Diretorio: ${APP_DIR}"
echo "Banco: ${DB_NAME}"
echo "Usuario DB: ${DB_USER}"
echo "JWT_SECRET: ${JWT_SECRET}"
echo ""
echo "Lembre-se de:"
echo "1. Configurar o DNS apontando para este servidor"
echo "2. Substituir SEU_DOMINIO_AQUI no .env e no Nginx"
echo "3. Executar: certbot --nginx -d seu-dominio.com"
echo ""
echo "Comandos uteis:"
echo "  pm2 logs lla-api"
echo "  pm2 restart lla-api"
echo "  systemctl restart nginx"
echo "========================================"
