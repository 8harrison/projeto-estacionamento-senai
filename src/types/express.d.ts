// src/types/express.d.ts
import { User } from '../models/User'; // Ajuste conforme seu modelo

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        roles: string[];
        // outras propriedades do usuário
      };
    }
  }
}