import type { Request, Response } from "express";
import type { DisciplinaDTO } from "@plataforma-estudos/shared/disciplina";
import { parseId } from "../middleware/validarSchema.js";
import * as service from "../services/disciplinaService.js";

export async function getAll(req: Request, res: Response) {
  const disciplinas = await service.getAll();
  return res.json(disciplinas);
}

export async function getOne(req: Request, res: Response) {
  const id: number = parseId(req.params.id);
  const disciplina = await service.getOne(id);
  if (!disciplina) {
    return res.status(404).json({ mensagem: "Disciplina não encontrada" });
  }
  return res.json(disciplina);
}

export async function create(req: Request, res: Response) {
  const dados: DisciplinaDTO = req.body;
  const disciplina = await service.create(dados);
  return res.status(201).json(disciplina);
}

export async function update(req: Request, res: Response) {
  const id: number = parseId(req.params.id);
  const dados: DisciplinaDTO = req.body;
  const disciplina = await service.update(id, dados);
  return res.json(disciplina);
}

export async function remove(req: Request, res: Response) {
  const id: number = parseId(req.params.id);
  await service.remove(id);
  return res.status(204).send();
}
