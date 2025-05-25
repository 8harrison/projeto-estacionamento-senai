import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export class AuthController {
  public async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({ message: 'Email e senha são obrigatórios.' });
      return;
    }

    try {
      const result = await authService.login(email, senha);

      if (!result) {
        res.status(401).json({ message: 'Credenciais inválidas.' });
        return
      }

      // Retorna o token e informações básicas do usuário (sem a senha)
      res.status(200).json(result);
      return
    } catch (error: any) {
      console.error('Erro no controller de login:', error.message);
      // Evitar expor detalhes internos do erro
      res.status(500).json({ message: 'Erro interno do servidor ao tentar fazer login.' });
      return
    }
  }

  // Pode adicionar um endpoint para obter informações do usuário logado (ex: /me)
  public async getMe(req: Request, res: Response) {
    // O middleware authenticateToken já validou o token e anexou req.usuario
    if (!req.usuario) {
      // Isso não deve acontecer se o authenticateToken foi usado corretamente antes
      res.status(401).json({ message: 'Usuário não autenticado.' });
      return
    }
    // Retorna as informações do usuário que estavam no payload do token
    // Certifique-se de não incluir informações sensíveis que não deveriam estar no token
    res.status(200).json({ usuario: req.usuario });
    return
  }
}

