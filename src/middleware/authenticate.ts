import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('Erro: Variável de ambiente JWT_SECRET não definida.');
  process.exit(1);
}

// Estender a interface Request do Express para incluir a propriedade 'usuario'
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Express {
    interface Request {
      usuario?: { id: number; role: string };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    return
  }

  jwt.verify(token, JWT_SECRET, (err: any, usuario: any) => {
    if (err) {
      console.error('Erro na verificação do JWT:', err.message);
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Token expirado.' });
      }
      return res.status(403).json({ message: 'Token inválido.' });
    }

    // Anexa as informações do usuário (payload do token) ao objeto Request
    req.usuario = { id: usuario.id, role: usuario.role };
    next(); // Passa para o próximo middleware ou rota
  });
};

