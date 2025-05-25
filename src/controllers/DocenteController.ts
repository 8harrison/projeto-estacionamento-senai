import { Request, Response } from 'express';
import { DocenteService } from '../services/DocenteService';
import { DocenteCreationAttributes } from '../models/Docente';

const docenteService = new DocenteService();

export class DocenteController {

  // Criar um novo docente
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const docenteData: DocenteCreationAttributes = req.body;
      const novoDocente = await docenteService.create(docenteData);
      return res.status(201).json(novoDocente);
    } catch (error: any) {
      console.error('Erro no controller ao criar docente:', error.message);
      if (error.message.includes('Matrícula') && error.message.includes('já existe')) {
        return res.status(409).json({ message: error.message }); // Conflict
      }
      return res.status(500).json({ message: 'Erro interno ao criar docente.' });
    }
  }

  // Listar todos os docentes
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const docentes = await docenteService.findAll();
      return res.status(200).json(docentes);
    } catch (error: any) {
      console.error('Erro no controller ao buscar docentes:', error.message);
      return res.status(500).json({ message: 'Erro interno ao buscar docentes.' });
    }
  }

  // Buscar docente por ID
  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const docente = await docenteService.findById(id);
      if (!docente) {
        return res.status(404).json({ message: 'Docente não encontrado.' });
      }
      return res.status(200).json(docente);
    } catch (error: any) {
      console.error('Erro no controller ao buscar docente por ID:', error.message);
      return res.status(500).json({ message: 'Erro interno ao buscar docente por ID.' });
    }
  }

  // Atualizar docente por ID
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const docenteData = req.body;
      const docenteAtualizado = await docenteService.update(id, docenteData);
      if (!docenteAtualizado) {
        return res.status(404).json({ message: 'Docente não encontrado para atualização.' });
      }
      return res.status(200).json(docenteAtualizado);
    } catch (error: any) {
      console.error('Erro no controller ao atualizar docente:', error.message);
      if (error.message.includes('Já existe um registro')) {
        return res.status(409).json({ message: error.message }); // Conflict
      }
      return res.status(500).json({ message: 'Erro interno ao atualizar docente.' });
    }
  }

  // Deletar (marcar como inativo) docente por ID
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const deletado = await docenteService.delete(id);
      if (!deletado) {
        return res.status(404).json({ message: 'Docente não encontrado para exclusão.' });
      }
      return res.status(204).send();
    } catch (error: any) {
      console.error('Erro no controller ao deletar docente:', error.message);
      return res.status(500).json({ message: 'Erro interno ao deletar docente.' });
    }
  }
}

