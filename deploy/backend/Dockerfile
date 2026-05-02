# Backend API
FROM node:20-alpine

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install --production

# Copiar código fonte
COPY . .

# Criar pasta de uploads
RUN mkdir -p uploads

# Expor porta
EXPOSE 5000

# Comando de inicialização
CMD ["node", "src/server.js"]
