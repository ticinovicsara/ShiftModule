import './load-env';

export const AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRY || '1d',
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim()),
  },

  email: {
    provider: (process.env.EMAIL_PROVIDER || 'console') as
      | 'console'
      | 'smtp'
      | 'sendgrid',
    from: process.env.EMAIL_FROM || 'noreply@shift.local',
  },

  moodle: {
    enabled: !!process.env.MOODLE_OAUTH_URL,
    oauthUrl: process.env.MOODLE_OAUTH_URL,
    clientId: process.env.MOODLE_CLIENT_ID,
    clientSecret: process.env.MOODLE_CLIENT_SECRET,
  },
} as const;
