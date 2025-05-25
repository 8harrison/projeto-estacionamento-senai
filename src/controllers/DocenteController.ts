import { Request, Response } from 'express';
import { DocenteService } from '../services/DocenteService';
import { DocenteCreationAttributes } from '../models/Docente';

const docenteService = new DocenteService();

export class DocenteController {

  // Criar um novo docente
  public async create(req: Request, res: Response) {
    try {
      const docenteData: DocenteCreationAttributes = req.body;
      const novoDocente = await docenteService.create(docenteData);
      res.status(201).json(novoDocente);
      return
    } catch (error: any) {
      console.error('Erro no controller ao criar docente:', error.message);
      if (error.message.includes('Matrícula') && error.message.includes('já existe')) {
        res.status(409).json({ message: error.message }); // Conflict
        return
      }
      res.status(500).json({ message: 'Erro interno ao criar docente.' });
      return
    }
  }

  // Listar todos os docentes
  public async findAll(req: Request, res: Response) {
    try {
      const docentes = await docenteService.findAll();
      res.status(200).json(docentes);
      return
    } catch (error: any) {
      console.error('Erro no controller ao buscar docentes:', error.message);
      res.status(500).json({ message: 'Erro interno ao buscar docentes.' });
      return
    }
  }

  // Buscar docente por ID
  public async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return
      }
      const docente = await docenteService.findById(id);
      if (!docente) {
        res.status(404).json({ message: 'Docente não encontrado.' });
        return
      }
      res.status(200).json(docente);
      return
    } catch (error: any) {
      console.error('Erro no controller ao buscar docente por ID:', error.message);
      res.status(500).json({ message: 'Erro interno ao buscar docente por ID.' });
      return
    }
  }

  // Atualizar docente por ID
  public async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return
      }
      const docenteData = req.body;
      const docenteAtualizado = await docenteService.update(id, docenteData);
      if (!docenteAtualizado) {
        res.status(404).json({ message: 'Docente não encontrado para atualização.' });
        return
      }
      res.status(200).json(docenteAtualizado);
      return
    } catch (error: any) {
      console.error('Erro no controller ao atualizar docente:', error.message);
      if (error.message.includes('Já existe um registro')) {
        res.status(409).json({ message: error.message }); // Conflict
        return
      }
      res.status(500).json({ message: 'Erro interno ao atualizar docente.' });
      return
    }
  }

  // Deletar (marcar como inativo) docente por ID
  public async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return
      }
      const deletado = await docenteService.delete(id);
      if (!deletado) {
        res.status(404).json({ message: 'Docente não encontrado para exclusão.' });
        return
      }
      res.status(204).send();
      return
    } catch (error: any) {
      console.error('Erro no controller ao deletar docente:', error.message);
      res.status(500).json({ message: 'Erro interno ao deletar docente.' });
      return
    }
  }
}

