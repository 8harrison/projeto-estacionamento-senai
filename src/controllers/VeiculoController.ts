import { NextFunction, Request, Response } from 'express';
import { VeiculoService } from '../services/VeiculoService';
import { VeiculoCreationAttributes } from '../models/Veiculo';

const veiculoService = new VeiculoService();

export class VeiculoController {

  // Criar um novo veículo
  public async create(req: Request, res: Response) {
    try {
      const veiculoData: VeiculoCreationAttributes = req.body;
      // Validação básica de entrada
      if (!veiculoData.placa || !veiculoData.modelo) {
        res.status(400).json({ message: 'Placa e modelo são obrigatórios.' });
        return
      }
      // A validação de proprietário (alunoId/docenteId) é feita no service
      const novoVeiculo = await veiculoService.create(veiculoData);
      res.status(201).json(novoVeiculo);
      return
    } catch (error: any) {
      console.error('Erro no controller ao criar veículo:', error.message);
      // Retornar erros específicos do service
      if (error.message.includes('Placa') && error.message.includes('já existe')) {
        res.status(409).json({ message: error.message }); // Conflict
        return
      }
      if (error.message.includes('Aluno com ID') || error.message.includes('Docente com ID') || error.message.includes('pertencer a um Aluno ou a um Docente')) {
        res.status(400).json({ message: error.message }); // Bad Request due to business rule
        return
      }
      res.status(500).json({ message: 'Erro interno ao criar veículo.' });
      return
    }
  }

  // Listar todos os veículos
  public async findAll(req: Request, res: Response) {
    try {
      // Adicionar filtros (ex: por placa, modelo, proprietário) via req.query se necessário
      const veiculos = await veiculoService.findAll();
      res.status(200).json(veiculos);
      return
    } catch (error: any) {
      console.error('Erro no controller ao buscar veículos:', error.message);
      res.status(500).json({ message: 'Erro interno ao buscar veículos.' });
      return
    }
  }

  // Buscar veículo por ID
  public async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return
      }
      const veiculo = await veiculoService.findById(id);
      if (!veiculo) {
        res.status(404).json({ message: 'Veículo não encontrado.' });
        return
      }
      res.status(200).json(veiculo);
      return
    } catch (error: any) {
      console.error('Erro no controller ao buscar veículo por ID:', error.message);
      res.status(500).json({ message: 'Erro interno ao buscar veículo por ID.' });
      return
    }
  }

  // Atualizar veículo por ID
  public async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return
      }
      const veiculoData = req.body;
      // A validação de proprietário é feita no service
      const veiculoAtualizado = await veiculoService.update(id, veiculoData);
      if (!veiculoAtualizado) {
        res.status(404).json({ message: 'Veículo não encontrado para atualização.' });
        return
      }
      res.status(200).json(veiculoAtualizado);
      return
    } catch (error: any) {
      console.error('Erro no controller ao atualizar veículo:', error.message);
      if (error.message.includes('Placa') && error.message.includes('já existe')) {
        res.status(409).json({ message: error.message }); // Conflict
        return
      }
      if (error.message.includes('Aluno com ID') || error.message.includes('Docente com ID') || error.message.includes('Atualização inválida')) {
        res.status(400).json({ message: error.message }); // Bad Request due to business rule
        return
      }
      res.status(500).json({ message: 'Erro interno ao atualizar veículo.' });
      return
    }
  }

  // Deletar veículo por ID
  public async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return
      }
      const deletado = await veiculoService.delete(id);
      if (!deletado) {
        res.status(404).json({ message: 'Veículo não encontrado para exclusão.' });
        return
      }
      res.status(204).send();
      return
    } catch (error: any) {
      console.error('Erro no controller ao deletar veículo:', error.message);
      // Adicionar tratamento para FK constraint se necessário
      res.status(500).json({ message: 'Erro interno ao deletar veículo.' });
      return
    }
  }

  public async findByPlacaOrModelo(req: Request, res: Response) {
    try {
      const  query  = req.query.termo
      const veiculo = await veiculoService.findByPlacaOrModelo(query as string)
      
      if (!veiculo || veiculo.length == 0) {
        const error = {message: 'Veículo não encontrado.', placa: query}
        req.io.emit('resultado-placa', {error})
        res.status(404).json({ message: 'Veículo não encontrado.' });
        return
      }
      req.io.emit('resultado-placa', veiculo)
      res.status(200).json(veiculo);
      return
    } catch (error: any) {
      console.error('Erro no controller ao buscar veículo por ID:', error.message);
      res.status(500).json({ message: 'Erro interno ao buscar veículo por placa ou modelo.' });
      return
    }
  }
}

