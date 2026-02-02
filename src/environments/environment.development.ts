export const environment = {
  production: false,
  baseUrl: '/api',
  jwt: {
    secret: 'sige-jwt-secret-dev',
    expiresIn: 3600, // 1 hour
    refreshExpiresIn: 86400, // 24 hours
    issuer: 'sige-app',
    audience: 'sige-users'
  }
};
