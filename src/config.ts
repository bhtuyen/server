import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import z from 'zod';

config({
  path: '.env'
});

const checkEnv = async () => {
  const chalk = (await import('chalk')).default;
  if (!fs.existsSync(path.resolve('.env'))) {
    console.log(chalk.red(`Không tìm thấy file môi trường .env`));
    process.exit(1);
  }
};
checkEnv();

const configSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  GUEST_ACCESS_TOKEN_EXPIRES_IN: z.string(),
  GUEST_REFRESH_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  INITIAL_EMAIL_OWNER: z.string(),
  INITIAL_PASSWORD_OWNER: z.string(),
  DOMAIN: z.string(),
  PROTOCOL: z.string(),
  UPLOAD_FOLDER: z.string(),
  UPLOAD_FOLDER_TEMP: z.string(),
  CLIENT_URL: z.string(),
  GOOGLE_REDIRECT_CLIENT_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_AUTHORIZED_REDIRECT_URI: z.string(),
  PRODUCTION: z.enum(['true', 'false']).transform((val) => val === 'true'),
  PRODUCTION_URL: z.string(),
  SERVER_TIMEZONE: z.string(),
  GOOGLE_BUCKET_NAME: z.string(),
  SEPAY_KEY: z.string()
});

const configServer = configSchema.safeParse(process.env);

if (!configServer.success) {
  console.error(configServer.error.issues);
  throw new Error('Các giá trị khai báo trong file .env không hợp lệ');
}
const envConfig = configServer.data;
export const API_URL = envConfig.PRODUCTION ? envConfig.PRODUCTION_URL : `${envConfig.PROTOCOL}://${envConfig.DOMAIN}:${envConfig.PORT}`;
export default envConfig;
