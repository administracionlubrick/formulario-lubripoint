const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];

  // Rutas "limpias" sin extensión (ej. /acceso-citas-taller) sirven el
  // formulario; el enrutado lo maneja el JavaScript del lado del cliente.
  if (reqUrl === '/' || !path.extname(reqUrl)) {
    reqUrl = '/index.html';
  }

  let filePath = path.join(__dirname, reqUrl);
  let ext = path.extname(filePath);

  let contentType = 'text/html';
  if (ext === '.css') contentType = 'text/css';
  if (ext === '.js') contentType = 'text/javascript';
  if (ext === '.json') contentType = 'application/json';
  if (ext === '.svg') contentType = 'image/svg+xml';
  if (ext === '.png') contentType = 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Lubripoint Web Server running at http://localhost:${PORT}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
