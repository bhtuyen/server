// Import the framework and instantiate it
import fastifyAuth from '@fastify/auth';
import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import Fastify from 'fastify';
import fastifySocketIO from 'fastify-socket.io';
import path from 'path';

import envConfig, { API_URL } from '@/config';
import accountController from '@/controllers/account.controller';
import autoRemoveRefreshTokenJob from '@/jobs/autoRemoveRefreshToken.job';
import { errorHandlerPlugin } from '@/plugins/errorHandler.plugins';
import { socketPlugin } from '@/plugins/socket.plugins';
import validatorCompilerPlugin from '@/plugins/validatorCompiler.plugins';
import { accountRoutes, authRoutes, dishRoutes, guestRoutes, indicatorRoutes, mediaRoutes, orderRoutes, staticRoutes, tablesRoutes } from '@/routes';
import { createFolder } from '@/utils/helpers';

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true, // Thêm màu sắc
        translateTime: 'yyyy-mm-dd HH:MM:ss', // Định dạng thời gian
        ignore: 'pid,hostname, reqId' // Loại bỏ các trường không cần thiết
      }
    }
  }
});

// Run the server!
const start = async () => {
  try {
    createFolder(path.resolve(envConfig.UPLOAD_FOLDER));
    createFolder(path.resolve(envConfig.UPLOAD_FOLDER_TEMP));
    autoRemoveRefreshTokenJob();
    const whitelist = ['*'];
    fastify.register(cors, {
      origin: whitelist, // Cho phép tất cả các domain gọi API
      credentials: true // Cho phép trình duyệt gửi cookie đến server
    });

    fastify.register(fastifyAuth, {
      defaultRelation: 'and'
    });
    fastify.register(fastifyHelmet, {
      crossOriginResourcePolicy: {
        policy: 'cross-origin'
      }
    });
    fastify.register(fastifyCookie);
    fastify.register(validatorCompilerPlugin);
    fastify.register(errorHandlerPlugin);
    fastify.register(fastifySocketIO, {
      cors: {
        origin: envConfig.CLIENT_URL,
      }
    });
    fastify.register(socketPlugin);
    fastify.register(authRoutes, {
      prefix: '/apis/auth'
    });
    fastify.register(accountRoutes, {
      prefix: '/apis/accounts'
    });
    fastify.register(mediaRoutes, {
      prefix: '/apis/media'
    });
    fastify.register(staticRoutes, {
      prefix: '/apis/static'
    });
    fastify.register(dishRoutes, {
      prefix: '/apis/dishes'
    });
    fastify.register(tablesRoutes, {
      prefix: '/apis/tables'
    });
    fastify.register(orderRoutes, {
      prefix: '/apis/orders'
    });
    fastify.register(guestRoutes, {
      prefix: '/apis/guest'
    });
    fastify.register(indicatorRoutes, {
      prefix: '/apis/indicators'
    });
    await accountController.initOwnerAccount();
    await fastify.listen({
      port: envConfig.PORT,
      host: envConfig.PRODUCTION ? '0.0.0.0' : 'localhost'
    });
    fastify.log.info(`Server đang chạy: ${API_URL}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
