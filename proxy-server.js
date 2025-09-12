const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

app.use(cors());

app.use('/api', createProxyMiddleware({
  target: 'https://www.inco-plat.com:9990',
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    '^/api': '/api'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying request to:', proxyReq.protocol + '//' + proxyReq.host + proxyReq.path);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Received response with status:', proxyRes.statusCode);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
  }
}));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});