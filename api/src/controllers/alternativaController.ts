import type { Request, Response } from "express";
import * as service from "../services/alternativaService.js";

export async function getAll(req: Request, res: Response) {
  const alternativas = await service.getAll();
  return res.json(alternativas);
}

export async function getOne(req: Request, res: Response) {
  const id: number = Number(req.params.id);
  const alternativa = await service.getOne(id);
  if (!alternativa) {
    return res.status(404).json({ mensagem: "Alternativa não encontrada" });
  }
  return res.json(alternativa);
}

export async function create(req: Request, res: Response) {
  const dados: AlternativaDTO = req.body;
  const alternativa = await service.create(dados);
  return res.status(201).json(alternativa);
}

export async function update(req: Request, res: Response) {
  const id: number = Number(req.params.id);
  const dados: AlternativaDTO = req.body;
  const alternativa = await service.update(id, dados);
  return res.json(alternativa);
}

export async function remove(req: Request, res: Response) {
  const id: number = Number(req.params.id);
  await service.remove(id);
  return res.status(204).send();
}
