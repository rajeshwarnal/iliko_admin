const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://13.53.102.122',
      changeOrigin: true,
      secure: false, // If using self-signed certificate
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        // Log the proxied request
        console.log('Proxying:', req.method, req.path, '→', proxyReq.path);
      },
      onProxyRes: (proxyRes, req, res) => {
        // Log the response
        console.log('Received:', proxyRes.statusCode, req.path);
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
      }
    })
  );
};