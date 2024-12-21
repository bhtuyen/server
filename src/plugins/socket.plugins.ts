import fastifyPlugin from 'fastify-plugin';

import { GuestOrderRole, ManagerRoom } from '@/constants/const';
import prisma from '@/database';
import { AuthError } from '@/utils/errors';
import { getChalk } from '@/utils/helpers';
import { verifyAccessToken } from '@/utils/jwt';

export const socketPlugin = fastifyPlugin(async (fastify) => {
  const chalk = await getChalk();
  fastify.io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth;

    if (!Authorization) {
      return next(new AuthError('Authorization không hợp lệ'));
    }
    const accessToken = Authorization.split(' ')[1];
    try {
      const decodedAccessToken = verifyAccessToken(accessToken);
      const { role } = decodedAccessToken;

      if (role === GuestOrderRole) {
        const { guestId } = decodedAccessToken;
        await prisma.socket.upsert({
          where: {
            guestId
          },
          update: {
            socketId: socket.id
          },
          create: {
            guestId,
            socketId: socket.id
          }
        });
      } else {
        const { accountId } = decodedAccessToken;
        await prisma.socket.upsert({
          where: {
            accountId
          },
          update: {
            socketId: socket.id
          },
          create: {
            accountId,
            socketId: socket.id
          }
        });
        socket.join(ManagerRoom);
      }
      socket.handshake.auth.decodedAccessToken = decodedAccessToken;
    } catch (error: any) {
      return next(error);
    }
    next();
  });
  fastify.io.on('connection', async (socket) => {
    console.log(chalk.cyanBright('🔌 Socket connected:', socket.id));
    socket.on('disconnect', async (reason) => {
      console.log(chalk.redBright('🔌 Socket disconnected:', socket.id));
    });
  });
});
