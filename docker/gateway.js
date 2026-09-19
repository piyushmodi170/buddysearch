/**
 * Coolify publishes one PORT. Next and Express run internally; this process
 * is the only listener on PORT so /api never loops through the public URL.
 */
const http = require('http');

const publicPort = Number(process.env.PORT || 3000);
const apiPort = Number(process.env.API_PORT || 4000);
const webPort = Number(process.env.WEB_PORT || 3001);

const toApi = (url = '') =>
  url.startsWith('/api') ||
  url.startsWith('/socket.io') ||
  url.startsWith('/health') ||
  url.startsWith('/uploads');

function proxyHttp(req, res, port) {
  const headers = { ...req.headers, host: `127.0.0.1:${port}` };
  const upstream = http.request(
    { hostname: '127.0.0.1', port, path: req.url, method: req.method, headers },
    (incoming) => {
      res.writeHead(incoming.statusCode || 502, incoming.headers);
      incoming.pipe(res);
    }
  );
  upstream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502, { 'content-type': 'application/json' });
    }
    res.end(JSON.stringify({ success: false, message: 'Service unavailable. Please try again.' }));
  });
  req.pipe(upstream);
}

const server = http.createServer((req, res) => {
  proxyHttp(req, res, toApi(req.url) ? apiPort : webPort);
});

server.on('upgrade', (req, socket, head) => {
  const port = toApi(req.url) ? apiPort : webPort;
  const headers = { ...req.headers, host: `127.0.0.1:${port}` };
  const upstream = http.request({
    hostname: '127.0.0.1',
    port,
    path: req.url,
    method: req.method,
    headers,
  });
  upstream.on('upgrade', (incoming, upstreamSocket, upstreamHead) => {
    const lines = [`HTTP/1.1 ${incoming.statusCode} Switching Protocols`];
    for (const [key, value] of Object.entries(incoming.headers)) {
      lines.push(`${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
    }
    socket.write(`${lines.join('\r\n')}\r\n\r\n`);
    if (head && head.length) upstreamSocket.write(head);
    if (upstreamHead && upstreamHead.length) socket.write(upstreamHead);
    upstreamSocket.pipe(socket);
    socket.pipe(upstreamSocket);
  });
  upstream.on('error', () => socket.destroy());
  upstream.end();
});

server.listen(publicPort, '0.0.0.0', () => {
  console.log(`Gateway listening on ${publicPort} (web ${webPort}, api ${apiPort})`);
});
