const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const angularDist = path.join(__dirname, 'dist/sige/browser');
const backendUrl = (process.env.BACKEND_URL || 'http://localhost:8081')+'/api';

// 1. Proxy para o seu Backend: Redireciona tudo que começa com /api sem corromper a URL
app.use('/api', createProxyMiddleware({
  target: backendUrl,
  changeOrigin: true,
  secure: false
}));

// 2. Serve os arquivos estáticos do Angular compilado
app.use(express.static(angularDist));

// 3. Fallback de Rotas (SPA): Qualquer rota que não seja arquivo físico ou API vai para o index.html
app.get('*any', (req, res) => {
  res.sendFile(path.join(angularDist, 'index.html'));
});

// Configuração do SSL Local
const sslOptions = {
  key: fs.readFileSync('.cert/localhost.key'),
  cert: fs.readFileSync('.cert/localhost.crt')
};

// Inicia o servidor seguro em HTTPS na porta 4200
https.createServer(sslOptions, app).listen(4200, () => {
  console.log(`Servidor de Produção PWA rodando em https://localhost:4200`);
  console.log(`Proxy configurado para redirecionar /api -> ${backendUrl}`);
});
