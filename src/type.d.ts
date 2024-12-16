import type { TokenPayload } from '@/types/jwt.types';
import 'fastify';
import type { Server } from 'socket.io';
declare global {
  interface BigInt {
    toJSON(): string;
  }
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof configSchema> {}
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
