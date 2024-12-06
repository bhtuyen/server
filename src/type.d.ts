import type { TokenPayload } from '@/types/jwt.types';
import 'fastify';
import type { Server } from 'socket.io';
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    io: Server;
  }
  interface FastifyRequest {
    decodedAccessToken?: TokenPayload;
  }
}
