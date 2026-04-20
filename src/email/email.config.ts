import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
  secure: process.env.EMAIL_SECURE === 'true',
  user:
    process.env.EMAIL_USER?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    '',
  pass:
    process.env.EMAIL_PASS?.trim() ||
    process.env.EMAIL_PASSWORD?.trim() ||
    '',
}));
