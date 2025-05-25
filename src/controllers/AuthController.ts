import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export class AuthController {
  public async login(req: Request, res: Response): Promise<Response> {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
      const result = await authService.login(email, senha);

      if (!result) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      // Retorna o token e informações básicas do usuário (sem a senha)
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Erro no controller de login:', error.message);
      // Evitar expor detalhes internos do erro
      return res.status(500).json({ message: 'Erro interno do servidor ao tentar fazer login.' });
    }
  }

  // Pode adicionar um endpoint para obter informações do usuário logado (ex: /me)
  public async getMe(req: Request, res: Response): Promise<Response> {
    // O middleware authenticateToken já validou o token e anexou req.usuario
    if (!req.usuario) {
        // Isso não deve acontecer se o authenticateToken foi usado corretamente antes
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }
    // Retorna as informações do usuário que estavam no payload do token
    // Certifique-se de não incluir informações sensíveis que não deveriam estar no token
    return res.status(200).json({ usuario: req.usuario });
  }
}

