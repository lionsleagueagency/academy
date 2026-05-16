#!/bin/bash

# Lions League Academy - Deploy Rápido para Produção
# Uso: sudo bash deploy.sh

set -e

echo "========================================"
echo " Lions League Academy - Deploy"
echo "========================================"

# Configurações
DOMAIN="academy.overlive.com.br"
APP_DIR="/home/academy/htdocs/academy.overlive.com.br"
DB_NAME="academy"
DB_USER="academy"
DB_PASS="Dj627246@"
NODE_PORT="3001"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Execute como root (sudo)${NC}"
    exit 1
fi

# 1. Clonar/atualizar projeto
echo -e "${BLUE}[1/6] Atualizando projeto...${NC}"
if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR"
    git pull origin main
else
    rm -rf "$APP_DIR"
    git clone https://github.com/lionsleagueagency/academy.git "$APP_DIR"
fi

# 2. Configurar backend
echo -e "${BLUE}[2/6] Configurando backend...${NC}"
cd "$APP_DIR/backend"

# Gerar JWT_SECRET se não existir
if [ ! -f .env ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    cat > .env <<EOF
NODE_ENV=production
PORT=${NODE_PORT}
DB_HOST=localhost
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
DB_NAME=${DB_NAME}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=https://${DOMAIN}
EOF
fi

npm install --production
mkdir -p uploads
chmod 755 uploads

# 3. Importar schema se banco vazio
echo -e "${BLUE}[3/6] Verificando banco de dados...${NC}"
TABLE_COUNT=$(mysql -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" -e "SHOW TABLES;" 2>/dev/null | wc -l)
if [ "$TABLE_COUNT" -lt 5 ]; then
    echo -e "${YELLOW}Importando schema...${NC}"
    mysql -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" < "$APP_DIR/database/schema.sql"
    node "$APP_DIR/backend/src/utils/seed.js" 2>/dev/null || echo -e "${YELLOW}Seed falhou, criando admin manualmente...${NC}"
fi

# 4. Buildar frontend
echo -e "${BLUE}[4/6] Buildando frontend...${NC}"
cd "$APP_DIR"
npm install
npm run build

# 5. Reiniciar backend
echo -e "${BLUE}[5/6] Reiniciando backend...${NC}"
pm2 restart academy-api 2>/dev/null || pm2 start "$APP_DIR/backend/src/server.js" --name "academy-api"
pm2 save

# 6. Configurar Nginx
echo -e "${BLUE}[6/6] Configurando Nginx...${NC}"
cat > /etc/nginx/sites-available/academy << EOF
server {
    listen 80;
    server_name academy.overlive.com.br;

    root ${APP_DIR}/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:${NODE_PORT}/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Content-Type \$content_type;
        
        add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept" always;
        
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept";
            add_header Access-Control-Max-Age 86400;
            return 204;
        }
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:${NODE_PORT}/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }

    location /health {
        proxy_pass http://127.0.0.1:${NODE_PORT}/health;
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/academy /etc/nginx/sites-enabled/

nginx -t
systemctl restart nginx

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Deploy Concluído!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Acesse:${NC} https://${DOMAIN}"
echo -e "${BLUE}Admin:${NC} julia@lionsleague.com / 123456"
echo ""
echo -e "${YELLOW}Comandos úteis:${NC}"
echo "  pm2 status"
echo "  pm2 logs academy-api"
echo "  systemctl restart nginx"
