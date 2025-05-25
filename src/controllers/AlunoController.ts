import { Request, Response } from 'express';
import { AlunoService } from '../services/AlunoService';
import { AlunoCreationAttributes } from '../models/Aluno'; // Importar se necessário para validação

const alunoService = new AlunoService();

export class AlunoController {

  // Criar um novo aluno
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      // Adicionar validação dos dados de entrada (req.body) aqui, se necessário
      const alunoData: AlunoCreationAttributes = req.body;
      const novoAluno = await alunoService.create(alunoData);
      return res.status(201).json(novoAluno);
    } catch (error: any) {
      console.error('Erro no controller ao criar aluno:', error.message);
      // Retornar erro específico se for de constraint única
      if (error.message.includes('Matrícula') && error.message.includes('já existe')) {
        return res.status(409).json({ message: error.message }); // Conflict
      }
      return res.status(500).json({ message: 'Erro interno ao criar aluno.' });
    }
  }

  // Listar todos os alunos
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      // Adicionar lógica para filtros, paginação, ordenação (via req.query) se necessário
      const alunos = await alunoService.findAll();
      return res.status(200).json(alunos);
    } catch (error: any) {
      console.error('Erro no controller ao buscar alunos:', error.message);
      return res.status(500).json({ message: 'Erro interno ao buscar alunos.' });
    }
  }

  // Buscar aluno por ID
  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const aluno = await alunoService.findById(id);
      if (!aluno) {
        return res.status(404).json({ message: 'Aluno não encontrado.' });
      }
      return res.status(200).json(aluno);
    } catch (error: any) {
      console.error('Erro no controller ao buscar aluno por ID:', error.message);
      return res.status(500).json({ message: 'Erro interno ao buscar aluno por ID.' });
    }
  }

  // Atualizar aluno por ID
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      // Adicionar validação dos dados de entrada (req.body) aqui
      const alunoData = req.body;
      const alunoAtualizado = await alunoService.update(id, alunoData);
      if (!alunoAtualizado) {
        return res.status(404).json({ message: 'Aluno não encontrado para atualização.' });
      }
      return res.status(200).json(alunoAtualizado);
    } catch (error: any) {
      console.error('Erro no controller ao atualizar aluno:', error.message);
      if (error.message.includes('Já existe um registro')) {
        return res.status(409).json({ message: error.message }); // Conflict
      }
      return res.status(500).json({ message: 'Erro interno ao atualizar aluno.' });
    }
  }

  // Deletar (marcar como inativo) aluno por ID
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const deletado = await alunoService.delete(id);
      if (!deletado) {
        return res.status(404).json({ message: 'Aluno não encontrado para exclusão.' });
      }
      // Retorna 204 No Content, pois não há corpo na resposta após a exclusão bem-sucedida
      return res.status(204).send();
    } catch (error: any) {
      console.error('Erro no controller ao deletar aluno:', error.message);
      return res.status(500).json({ message: 'Erro interno ao deletar aluno.' });
    }
  }
}

