import { Request, Response, NextFunction } from 'express';

// Middleware para verificar se o usuário tem uma role específica (ou uma lista de roles)
export const authorizeRole = (allowedRoles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Verifica se o middleware de autenticação anexou o usuário à requisição
    if (!req.usuario) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const { role } = req.usuario;
    const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (rolesToCheck.includes(role)) {
      next(); // Usuário tem a role permitida, continua para a próxima etapa
    } else {
      res.status(403).json({ message: 'Acesso negado. Permissões insuficientes.' });
    }
  };
};

