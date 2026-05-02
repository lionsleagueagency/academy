#!/bin/bash

# Lions League Academy - Script de Instalação Automática para Ubuntu Server
# Uso: sudo bash install.sh
# Testado em: Ubuntu Server 22.04 LTS / 24.04 LTS

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações padrão
DOMAIN=""
EMAIL=""
DB_ROOT_PASS=""
DB_USER="lla_user"
DB_PASS=""
DB_NAME="overlive_academy"
JWT_SECRET=""
APP_DIR="/var/www/academy"
NODE_VERSION="20"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Overlive Academy - Instalador   ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Erro: Execute como root (sudo)${NC}"
    exit 1
fi

# Verificar Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    echo -e "${YELLOW}Aviso: Este script foi testado no Ubuntu Server${NC}"
    read -p "Continuar mesmo assim? (s/N): " confirm
    if [[ ! "$confirm" =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Coletar informações do usuário
echo -e "${YELLOW}--- Configurações do Servidor ---${NC}"
read -p "Domínio (ex: academy.seusite.com): " DOMAIN
read -p "Seu e-mail (para SSL Let's Encrypt): " EMAIL
read -sp "Senha root do MySQL: " DB_ROOT_PASS
echo ""
read -sp "Senha do banco de dados da aplicação: " DB_PASS
echo ""
read -sp "Senha JWT (deixe em branco para gerar automaticamente): " JWT_INPUT
echo ""

if [ -z "$JWT_INPUT" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo -e "${GREEN}JWT_SECRET gerado automaticamente${NC}"
else
    JWT_SECRET="$JWT_INPUT"
fi

echo ""
echo -e "${YELLOW}--- Resumo da Instalação ---${NC}"
echo "Domínio: $DOMAIN"
echo "E-mail: $EMAIL"
echo "Diretório: $APP_DIR"
echo "Banco de dados: $DB_NAME"
echo ""
read -p "Confirmar instalação? (s/N): " confirm
if [[ ! "$confirm" =~ ^[Ss]$ ]]; then
    echo "Instalação cancelada."
    exit 1
fi

# ============================================
# 1. ATUALIZAR SISTEMA
# ============================================
echo ""
echo -e "${BLUE}[1/10] Atualizando sistema...${NC}"
apt update && apt upgrade -y

# ============================================
# 2. INSTALAR DEPENDÊNCIAS
# ============================================
echo -e "${BLUE}[2/10] Instalando dependências...${NC}"
apt install -y \
    curl \
    wget \
    git \
    nginx \
    mysql-server \
    certbot \
    python3-certbot-nginx \
    ufw \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    build-essential

# ============================================
# 3. INSTALAR NODE.JS
# ============================================
echo -e "${BLUE}[3/10] Instalando Node.js ${NODE_VERSION}...${NC}"
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs

# Verificar instalação
node_version=$(node --version)
npm_version=$(npm --version)
echo -e "${GREEN}Node.js ${node_version} instalado${NC}"
echo -e "${GREEN}npm ${npm_version} instalado${NC}"

# Instalar PM2 globalmente
npm install -g pm2

# ============================================
# 4. CONFIGURAR FIREWALL
# ============================================
echo -e "${BLUE}[4/10] Configurando firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 5000/tcp
ufw --force enable

# ============================================
# 5. CONFIGURAR MySQL
# ============================================
echo -e "${BLUE}[5/10] Configurando MySQL...${NC}"

# Verificar se MySQL está rodando
if ! systemctl is-active --quiet mysql; then
    systemctl start mysql
    systemctl enable mysql
fi

# Configurar senha root (compatível com MySQL 8.0)
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_ROOT_PASS}';" 2>/dev/null || \
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '${DB_ROOT_PASS}';" 2>/dev/null || \
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_ROOT_PASS}';"

mysql -u root -p"${DB_ROOT_PASS}" -e "FLUSH PRIVILEGES;"

# Criar banco de dados e usuário
mysql -u root -p"${DB_ROOT_PASS}" -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p"${DB_ROOT_PASS}" -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASS}';"
mysql -u root -p"${DB_ROOT_PASS}" -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -u root -p"${DB_ROOT_PASS}" -e "FLUSH PRIVILEGES;"

echo -e "${GREEN}Banco de dados overlive_academy criado${NC}"

# ============================================
# 6. CLONAR PROJETO
# ============================================
echo -e "${BLUE}[6/10] Clonando projeto do GitHub...${NC}"

if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}Diretório existente encontrado. Removendo...${NC}"
    rm -rf "$APP_DIR"
fi

git clone https://github.com/lionsleagueagency/lions-league-academy.git "$APP_DIR"
cd "$APP_DIR"

# ============================================
# 7. CONFIGURAR BACKEND
# ============================================
echo -e "${BLUE}[7/10] Configurando backend...${NC}"

cd "$APP_DIR/backend"

# Criar .env
cat > .env <<EOF
NODE_ENV=production
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
DB_NAME=${DB_NAME}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://${DOMAIN}
EOF

# Instalar dependências
npm install --production

# Criar pasta uploads
mkdir -p uploads
chmod 755 uploads

# Importar schema do banco
if [ -f "$APP_DIR/database/schema.sql" ]; then
    echo -e "${BLUE}Importando schema do banco de dados...${NC}"
    mysql -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" < "$APP_DIR/database/schema.sql"
    echo -e "${GREEN}Schema importado com sucesso${NC}"
fi

# Iniciar com PM2
pm2 start src/server.js --name "lla-api"
pm2 save
pm2 startup systemd -u root --hp /root

# ============================================
# 8. BUILDAR FRONTEND
# ============================================
echo -e "${BLUE}[8/10] Buildando frontend...${NC}"

cd "$APP_DIR"
npm install
npm run build

# ============================================
# 9. CONFIGURAR NGINX
# ============================================
echo -e "${BLUE}[9/10] Configurando Nginx...${NC}"

# Remover configuração default
rm -f /etc/nginx/sites-enabled/default

# Criar configuração do site
cat > /etc/nginx/sites-available/lions-league-academy <<'EOF'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;

    # Frontend (build estático)
    location / {
        root /var/www/academy/dist;
        try_files $uri $uri/ /index.html;
        index index.html;

        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|webp)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
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
        proxy_read_timeout 86400;
    }

    # Uploads
    location /uploads/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Substituir placeholder pelo domínio real
sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" /etc/nginx/sites-available/lions-league-academy

# Ativar site
ln -sf /etc/nginx/sites-available/lions-league-academy /etc/nginx/sites-enabled/

# Testar e reiniciar Nginx
nginx -t
systemctl restart nginx

# ============================================
# 10. CONFIGURAR SSL (Let's Encrypt)
# ============================================
echo -e "${BLUE}[10/10] Configurando SSL...${NC}"

certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos --email "${EMAIL}"

# Configurar renovação automática
echo "0 3 * * * root certbot renew --quiet" | crontab -

# ============================================
# FINALIZAÇÃO
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Instalação Concluída com Sucesso!   ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Acesse sua aplicação:${NC}"
echo -e "  Frontend: ${GREEN}https://${DOMAIN}${NC}"
echo -e "  API:      ${GREEN}https://${DOMAIN}/api${NC}"
echo ""
echo -e "${BLUE}Configurações:${NC}"
echo -e "  Diretório: ${APP_DIR}"
echo -e "  Banco:     overlive_academy"
echo -e "  Usuário DB: ${DB_USER}"
echo ""
echo -e "${YELLOW}Comandos úteis:${NC}"
echo -e "  Ver logs do backend: ${BLUE}pm2 logs lla-api${NC}"
echo -e "  Reiniciar backend:   ${BLUE}pm2 restart lla-api${NC}"
echo -e "  Status do backend:   ${BLUE}pm2 status${NC}"
echo -e "  Restart Nginx:       ${BLUE}systemctl restart nginx${NC}"
echo ""
echo -e "${YELLOW}JWT_SECRET (salve em local seguro):${NC}"
echo -e "  ${DB_PASS}"
echo ""
echo -e "${GREEN}Instalação finalizada!${NC}"
