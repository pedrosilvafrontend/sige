const backendUrl =
  process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:3000';

const PROXY_CONFIG = {
  '/api': {
    target: backendUrl,
    changeOrigin: true,
    secure: false,
    logLevel: 'debug'
  }
};

module.exports = PROXY_CONFIG;
