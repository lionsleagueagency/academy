#!/bin/bash

# Lions League Academy - Script de Deploy
# Uso: ./deploy.sh

set -e

echo "========================================"
echo " Lions League Academy - Deploy"
echo "========================================"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo -e "${RED}Erro: Execute este script na raiz do projeto${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/6] Instalando dependências do frontend...${NC}"
npm install

echo -e "${YELLOW}[2/6] Buildando frontend...${NC}"
npm run build

echo -e "${YELLOW}[3/6] Instalando dependências do backend...${NC}"
cd backend
npm install --production
cd ..

echo -e "${YELLOW}[4/6] Verificando variáveis de ambiente...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}Aviso: backend/.env não encontrado!${NC}"
    echo "Copie backend/.env.production para backend/.env e configure"
    exit 1
fi

echo -e "${YELLOW}[5/6] Criando pasta de uploads...${NC}"
mkdir -p backend/uploads

echo -e "${YELLOW}[6/6] Deploy concluído!${NC}"
echo ""
echo -e "${GREEN}Próximos passos:${NC}"
echo "  1. Configure o Nginx (veja DEPLOY.md)"
echo "  2. Inicie o backend: cd backend && pm2 start src/server.js --name lla-api"
echo "  3. Sirva a pasta dist/ com o Nginx"
echo ""
echo -e "${GREEN}Ou use Docker:${NC}"
echo "  docker-compose up -d"
