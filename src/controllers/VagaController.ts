import { Request, Response } from 'express';
import { VagaService } from '../services/VagaService';
import { VagaCreationAttributes } from '../models/Vaga';

const vagaService = new VagaService();

export class VagaController {

  // Criar uma nova vaga
  public async create(req: Request, res: Response) {
    try {
      const vagaData: VagaCreationAttributes = req.body;
      if (!vagaData.numero || !vagaData.tipo) {
        res.status(400).json({ message: 'Número e tipo da vaga são obrigatórios.' });
        return
      }
      const novaVaga = await vagaService.create(vagaData);
      res.status(201).json(novaVaga);
      return
    } catch (error: any) {
      console.error('Erro no controller ao criar vaga:', error.message);
      if (error.message.includes('Número de vaga') && error.message.includes('já existe')) {
        res.status(409).json({ message: error.message }); // Conflict
        return
      }
      res.status(500).json({ message: 'Erro interno ao criar vaga.' });
      return
    }
  }

  // Listar todas as vagas (com filtros opcionais)
  public async findAll(req: Request, res: Response) {
    try {
      // Exemplo de como pegar filtros da query string: req.query.ocupada, req.query.tipo
      const filterOptions: any = {};
      if (req.query.ocupada !== undefined) {
        // Converter string 'true'/'false' para boolean
        filterOptions.ocupada = String(req.query.ocupada).toLowerCase() === 'true';
      }
      if (req.query.tipo) {
        // Adicionar validação para os tipos permitidos se necessário
        filterOptions.tipo = req.query.tipo as 'Comum' | 'Prioritária' | 'Docente';
      }

      const options = Object.keys(filterOptions).length > 0 ? { where: filterOptions } : undefined;
      const vagas = await vagaService.findAll(options);
      res.status(200).json(vagas);
      return
    } catch (error: any) {
      console.error('Erro no controller ao buscar vagas:', error.message);
      res.status(500).json({ message: 'Erro interno ao buscar vagas.' });
      return
    }
  }

  // Listar vagas disponíveis
  public async findAvailable(req: Request, res: Response) {
    try {
      const tipo = req.query.tipo as 'Comum' | 'Prioritária' | 'Docente' | undefined;
      // Adicionar validação para o tipo se necessário
      const vagasDisponiveis = await vagaService.findAvailable(tipo);
      res.status(200).json(vagasDisponiveis);
      return
    } catch (error: any) {
      console.error('Erro no controller ao buscar vagas disponíveis:', error.message);
      res.status(500).json({ message: 'Erro interno ao buscar vagas disponíveis.' });
      return
    }
  }

  // Buscar vaga por ID
  public async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return
      }
      const vaga = await vagaService.findById(id);
      if (!vaga) {
        res.status(404).json({ message: 'Vaga não encontrada.' });
        return
      }
      res.status(200).json(vaga);
      return
    } catch (error: any) {
      console.error('Erro no controller ao buscar vaga por ID:', error.message);
      res.status(500).json({ message: 'Erro interno ao buscar vaga por ID.' });
      return
    }
  }

  // Atualizar vaga por ID
  public async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return
      }
      const vagaData = req.body;
      // O service já impede a atualização direta do status 'ocupada'
      const vagaAtualizada = await vagaService.update(id, vagaData);
      if (!vagaAtualizada) {
        res.status(404).json({ message: 'Vaga não encontrada para atualização.' });
        return
      }
      res.status(200).json(vagaAtualizada);
      return
    } catch (error: any) {
      console.error('Erro no controller ao atualizar vaga:', error.message);
      if (error.message.includes('Número de vaga') && error.message.includes('já existe')) {
        res.status(409).json({ message: error.message }); // Conflict
        return
      }
      res.status(500).json({ message: 'Erro interno ao atualizar vaga.' });
      return
    }
  }

  // Deletar vaga por ID
  public async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return
      }
      const deletado = await vagaService.delete(id);
      if (!deletado) {
        res.status(404).json({ message: 'Vaga não encontrada para exclusão.' });
        return
      }
      res.status(204).send();
      return
    } catch (error: any) {
      console.error('Erro no controller ao deletar vaga:', error.message);
      if (error.message.includes('existem registros de estacionamento associados')) {
        res.status(409).json({ message: error.message }); // Conflict due to FK constraint
        return
      }
      res.status(500).json({ message: 'Erro interno ao deletar vaga.' });
      return
    }
  }
}

