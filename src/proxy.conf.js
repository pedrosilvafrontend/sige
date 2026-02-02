// module.exports = [
//   {
//     context: ['/api/**'],
//     target: process.env.API_URL, // || `http://localhost:8080`,
//     // changeOrigin: true,
//     secure: false,
//   }
// ];
// Load environment variables from .env file
// require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3000'; // Fallback to a default URL

const PROXY_CONFIG = {
  // "/api": {
  //   "target": API_URL,
  //   changeOrigin: true,
  //   "secure": false,
  //   "logLevel": "debug"
  // }
  '/api': {
    target: API_URL,
    changeOrigin: true,
    secure: false,
    logLevel: 'debug'
  }
};

module.exports = PROXY_CONFIG;
