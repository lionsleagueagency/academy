# Deploy no DirectAdmin (sem SSH)

## Método 1: Upload via File Manager (Mais Fácil)

### Passo 1 — Preparar os arquivos localmente

No seu computador, dentro da pasta do projeto:

```bash
# 1. Buildar o frontend
cd C:\Users\djmar\Projects\lionsleagueagency
npm run build

# 2. Criar uma pasta de deploy
mkdir deploy

# 3. Copiar o build do frontend
xcopy /E /I dist deploy\public_html

# 4. Copiar o backend
xcopy /E /I backend deploy\backend

# 5. Copiar o banco de dados
xcopy /E /I database deploy\database

# 6. Copiar arquivos de configuração
copy package.json deploy\
copy docker-compose.yml deploy\
copy DEPLOY.md deploy\
copy nginx.conf deploy\
copy .gitignore deploy\
```

### Passo 2 — Compactar

```bash
# Compactar a pasta deploy em um ZIP
cd deploy
powershell Compress-Archive -Path * -DestinationPath ..\lions-league-academy.zip
cd ..
```

### Passo 3 — Upload pelo DirectAdmin

1. Acesse seu **DirectAdmin** pelo navegador
2. Vá em **File Manager**
3. Navegue até `public_html` (ou crie uma subpasta como `lionsleague`)
4. Clique em **Upload Files** e envie o `lions-league-academy.zip`
5. Clique no arquivo ZIP e selecione **Extract**

### Passo 4 — Configurar o Backend como Node.js App

No DirectAdmin:

1. Procure por **"Setup Node.js App"** ou **"Node.js Selector"**
2. Clique em **Create Application**
3. Preencha:
   - **Application Root**: `public_html/backend`
   - **Application URL**: `seu-dominio.com/api` (ou subdomínio)
   - **Application Startup File**: `src/server.js`
   - **Node.js Version**: 18.x ou 20.x
4. Clique em **Create**
5. Depois de criado, clique em **Run NPM Install**
6. Clique em **Start App**

### Passo 5 — Configurar variáveis de ambiente

No File Manager do DirectAdmin:

1. Navegue até `public_html/backend`
2. Crie/edite o arquivo `.env`:

```env
PORT=5000
NODE_ENV=production

# Database (use os dados do DirectAdmin)
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=lions_league_academy

# JWT
JWT_SECRET=sua-chave-super-segura-aqui-minimo-32-caracteres
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://seu-dominio.com
```

### Passo 6 — Criar banco de dados MySQL

No DirectAdmin:

1. Vá em **MySQL Management**
2. Clique em **Create New Database**
3. Preencha:
   - **Database Name**: `lions_league_academy`
   - **Database Username**: `seu_usuario`
   - **Password**: senha forte
4. Anote esses dados para colocar no `.env`

### Passo 7 — Importar o schema

1. No DirectAdmin, vá em **phpMyAdmin**
2. Selecione o banco `lions_league_academy`
3. Clique em **Import**
4. Selecione o arquivo `database/schema.sql`
5. Clique em **Go**

### Passo 8 — Configurar o Frontend

O build do frontend está em `public_html`. Você precisa configurar o .htaccess para redirecionar tudo para o `index.html` (SPA):

1. No File Manager, navegue até `public_html`
2. Crie/edite o arquivo `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirecionar API para o backend Node.js
  RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]
  RewriteRule ^uploads/(.*)$ http://localhost:5000/uploads/$1 [P,L]
  
  # SPA - redirecionar tudo para index.html
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Passo 9 — Criar pasta de uploads

No File Manager:

1. Navegue até `public_html/backend`
2. Crie a pasta `uploads`
3. Dê permissão 755 (clique na pasta → **Permissions** → 755)

---

## Método 2: Deploy via FTP (FileZilla)

### Passo 1 — Preparar os arquivos

Siga o Passo 1 do Método 1 acima.

### Passo 2 — Conectar via FTP

1. Abra o **FileZilla**
2. Preencha:
   - **Host**: `ftp.seu-dominio.com` (ou IP do servidor)
   - **Username**: seu usuário FTP do DirectAdmin
   - **Password**: sua senha FTP
   - **Port**: 21
3. Clique em **Quickconnect**

### Passo 3 — Enviar arquivos

1. No lado direito (servidor), navegue até `public_html`
2. No lado esquerdo (seu PC), navegue até a pasta `deploy`
3. Selecione todos os arquivos e arraste para o servidor
4. Aguarde o upload completo

### Passo 4 — Configurar (mesmo do Método 1)

Siga os Passos 4-9 do Método 1.

---

## Método 3: Usar Git no DirectAdmin (se disponível)

Alguns DirectAdmin têm Git integrado:

1. No DirectAdmin, procure por **"Git"** ou **"Version Control"**
2. Clique em **Clone Repository**
3. Preencha:
   - **Repository URL**: `https://github.com/lionsleagueagency/lions-league-academy.git`
   - **Target Directory**: `public_html`
4. Clique em **Clone**
5. Depois, siga os Passos 4-9 do Método 1

---

## Checklist Final

- [ ] Frontend buildado e enviado para `public_html`
- [ ] Backend enviado para `public_html/backend`
- [ ] Node.js app configurado no DirectAdmin
- [ ] Banco de dados MySQL criado
- [ ] Schema importado via phpMyAdmin
- [ ] Arquivo `.env` configurado no backend
- [ ] `.htaccess` criado na raiz
- [ ] Pasta `uploads` criada com permissão 755
- [ ] Backend rodando (verifique em Setup Node.js App)
- [ ] Frontend acessível pelo navegador

---

## Solução de Problemas

### "Cannot GET /" ou página em branco
- Verifique se o `.htaccess` está configurado corretamente
- Confirme que o build do frontend foi enviado (pasta `dist`)

### API não responde
- Verifique se o Node.js app está rodando no DirectAdmin
- Confirme a porta no `.env` (deve ser 5000)
- Verifique se o `.htaccess` tem o redirect para `localhost:5000`

### Erro de CORS
- No `.env`, `CORS_ORIGIN` deve ser exatamente seu domínio (ex: `https://seu-dominio.com`)

### Erro de banco de dados
- Verifique se o schema foi importado corretamente
- Confirme usuário/senha do MySQL no `.env`
- Verifique se o host é `localhost` (padrão do DirectAdmin)

---

## Dica Importante

Se seu DirectAdmin **não tem Node.js Selector**, você pode usar o **PHP** como proxy:

1. Crie um arquivo `api.php` na raiz:

```php
<?php
// Redireciona todas as requisições /api/* para o backend Node.js
$url = 'http://localhost:5000' . $_SERVER['REQUEST_URI'];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

// Passa headers
$headers = getallheaders();
foreach ($headers as $key => $value) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["$key: $value"]);
}

// Passa body
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode);
echo $response;
?>
```

2. No `.htaccess`, mude a regra da API:

```apache
RewriteRule ^api/(.*)$ api.php [L]
```

3. Rode o backend manualmente via cron job ou script PHP que executa `node src/server.js`
