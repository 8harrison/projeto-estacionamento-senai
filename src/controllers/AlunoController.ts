import { Request, Response } from 'express';
import { AlunoService } from '../services/AlunoService';
import { AlunoCreationAttributes } from '../models/Aluno'; // Importar se necessário para validação

const alunoService = new AlunoService();

export class AlunoController {

  // Criar um novo aluno
  public async create(req: Request, res: Response) {
    try {
      // Adicionar validação dos dados de entrada (req.body) aqui, se necessário
      const alunoData: AlunoCreationAttributes = req.body;
      const novoAluno = await alunoService.create(alunoData);
      res.status(201).json(novoAluno);
      return
    } catch (error: any) {
      console.error('Erro no controller ao criar aluno:', error.message);
      // Retornar erro específico se for de constraint única
      if (error.message.includes('Matrícula') && error.message.includes('já existe')) {
        res.status(409).json({ message: error.message }); // Conflict
        return
      }
      res.status(500).json({ message: 'Erro interno ao criar aluno.' });
      return
    }
  }

  // Listar todos os alunos
  public async findAll(req: Request, res: Response) {
    try {
      // Adicionar lógica para filtros, paginação, ordenação (via req.query) se necessário
      const alunos = await alunoService.findAll();
      res.status(200).json(alunos);
      return
    } catch (error: any) {
      console.error('Erro no controller ao buscar alunos:', error.message);
      res.status(500).json({ message: 'Erro interno ao buscar alunos.' });
      return
    }
  }

  // Buscar aluno por ID
  public async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return
      }
      const aluno = await alunoService.findById(id);
      if (!aluno) {
        res.status(404).json({ message: 'Aluno não encontrado.' });
        return
      }
      res.status(200).json(aluno);
      return
    } catch (error: any) {
      console.error('Erro no controller ao buscar aluno por ID:', error.message);
      res.status(500).json({ message: 'Erro interno ao buscar aluno por ID.' });
      return
    }
  }

  // Atualizar aluno por ID
  public async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return
      }
      // Adicionar validação dos dados de entrada (req.body) aqui
      const alunoData = req.body;
      const alunoAtualizado = await alunoService.update(id, alunoData);
      if (!alunoAtualizado) {
        res.status(404).json({ message: 'Aluno não encontrado para atualização.' });
        return
      }
      res.status(200).json(alunoAtualizado);
      return
    } catch (error: any) {
      console.error('Erro no controller ao atualizar aluno:', error.message);
      if (error.message.includes('Já existe um registro')) {
        res.status(409).json({ message: error.message }); // Conflict
        return
      }
      res.status(500).json({ message: 'Erro interno ao atualizar aluno.' });
      return
    }
  }

  // Deletar (marcar como inativo) aluno por ID
  public async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return
      }
      const deletado = await alunoService.delete(id);
      if (!deletado) {
        res.status(404).json({ message: 'Aluno não encontrado para exclusão.' });
        return
      }
      // Retorna 204 No Content, pois não há corpo na resposta após a exclusão bem-sucedida
      res.status(204).send();
      return
    } catch (error: any) {
      console.error('Erro no controller ao deletar aluno:', error.message);
      res.status(500).json({ message: 'Erro interno ao deletar aluno.' });
      return
    }
  }
}

