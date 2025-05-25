import { Request, Response } from 'express';
import { VeiculoService } from '../services/VeiculoService';
import { VeiculoCreationAttributes } from '../models/Veiculo';

const veiculoService = new VeiculoService();

export class VeiculoController {

  // Criar um novo veículo
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const veiculoData: VeiculoCreationAttributes = req.body;
      // Validação básica de entrada
      if (!veiculoData.placa || !veiculoData.modelo) {
        return res.status(400).json({ message: 'Placa e modelo são obrigatórios.' });
      }
      // A validação de proprietário (alunoId/docenteId) é feita no service
      const novoVeiculo = await veiculoService.create(veiculoData);
      return res.status(201).json(novoVeiculo);
    } catch (error: any) {
      console.error('Erro no controller ao criar veículo:', error.message);
      // Retornar erros específicos do service
      if (error.message.includes('Placa') && error.message.includes('já existe')) {
        return res.status(409).json({ message: error.message }); // Conflict
      }
      if (error.message.includes('Aluno com ID') || error.message.includes('Docente com ID') || error.message.includes('pertencer a um Aluno ou a um Docente')) {
          return res.status(400).json({ message: error.message }); // Bad Request due to business rule
      }
      return res.status(500).json({ message: 'Erro interno ao criar veículo.' });
    }
  }

  // Listar todos os veículos
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      // Adicionar filtros (ex: por placa, modelo, proprietário) via req.query se necessário
      const veiculos = await veiculoService.findAll();
      return res.status(200).json(veiculos);
    } catch (error: any) {
      console.error('Erro no controller ao buscar veículos:', error.message);
      return res.status(500).json({ message: 'Erro interno ao buscar veículos.' });
    }
  }

  // Buscar veículo por ID
  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const veiculo = await veiculoService.findById(id);
      if (!veiculo) {
        return res.status(404).json({ message: 'Veículo não encontrado.' });
      }
      return res.status(200).json(veiculo);
    } catch (error: any) {
      console.error('Erro no controller ao buscar veículo por ID:', error.message);
      return res.status(500).json({ message: 'Erro interno ao buscar veículo por ID.' });
    }
  }

  // Atualizar veículo por ID
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const veiculoData = req.body;
      // A validação de proprietário é feita no service
      const veiculoAtualizado = await veiculoService.update(id, veiculoData);
      if (!veiculoAtualizado) {
        return res.status(404).json({ message: 'Veículo não encontrado para atualização.' });
      }
      return res.status(200).json(veiculoAtualizado);
    } catch (error: any) {
      console.error('Erro no controller ao atualizar veículo:', error.message);
      if (error.message.includes('Placa') && error.message.includes('já existe')) {
        return res.status(409).json({ message: error.message }); // Conflict
      }
       if (error.message.includes('Aluno com ID') || error.message.includes('Docente com ID') || error.message.includes('Atualização inválida')) {
          return res.status(400).json({ message: error.message }); // Bad Request due to business rule
      }
      return res.status(500).json({ message: 'Erro interno ao atualizar veículo.' });
    }
  }

  // Deletar veículo por ID
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido.' });
      }
      const deletado = await veiculoService.delete(id);
      if (!deletado) {
        return res.status(404).json({ message: 'Veículo não encontrado para exclusão.' });
      }
      return res.status(204).send();
    } catch (error: any) {
      console.error('Erro no controller ao deletar veículo:', error.message);
      // Adicionar tratamento para FK constraint se necessário
      return res.status(500).json({ message: 'Erro interno ao deletar veículo.' });
    }
  }
}

