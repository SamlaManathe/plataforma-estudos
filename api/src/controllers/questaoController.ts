import type { Request, Response } from "express";
import type { QuestaoDTO } from "@plataforma-estudos/shared/questao";
import * as service from "../services/questaoService.js";

export async function getAll(req: Request, res: Response) {
  const questoes = await service.getAll();
  return res.json(questoes);
}

export async function getOne(req: Request, res: Response) {
  const id: number = Number(req.params.id);
  const questao = await service.getOne(id);
  if (!questao) {
    return res.status(404).json({ mensagem: "Questão não encontrada" });
  }
  return res.json(questao);
}

export async function create(req: Request, res: Response) {
  const dados: QuestaoDTO = req.body;
  const questao = await service.create(dados);
  return res.status(201).json(questao);
}

export async function update(req: Request, res: Response) {
  const id: number = Number(req.params.id);
  const dados: QuestaoDTO = req.body;
  const questao = await service.update(id, dados);
  return res.json(questao);
}

export async function remove(req: Request, res: Response) {
  const id: number = Number(req.params.id);
  await service.remove(id);
  return res.status(204).send();
}
