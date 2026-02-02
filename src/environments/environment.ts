export const environment = {
  production: true,
  baseUrl: '/api',
  jwt: {
    secret: 'sige-jwt-secret-prod',
    expiresIn: 3600, // 1 hour
    refreshExpiresIn: 86400, // 24 hours
    issuer: 'sige-app',
    audience: 'sige-users'
  }
};
