import type { Request, Response } from "express";
import type { AlunoDTO } from "@plataforma-estudos/shared/aluno";
import * as service from "../services/alunoService.js";

export async function getAll(req: Request, res: Response) {
  const alunos = await service.getAll();
  return res.json(alunos);
}

export async function getOne(req: Request, res: Response) {
  const id: number = Number(req.params.id);
  const aluno = await service.getOne(id);
  if (!aluno) {
    return res.status(404).json({ mensagem: "Aluno não encontrado" });
  }
  return res.json(aluno);
}

export async function create(req: Request, res: Response) {
  const dados: AlunoDTO = req.body;
  const aluno = await service.create(dados);
  return res.status(201).json(aluno);
}

export async function update(req: Request, res: Response) {
  const id: number = Number(req.params.id);
  const dados: AlunoDTO = req.body;
  const aluno = await service.update(id, dados);
  return res.json(aluno);
}

export async function remove(req: Request, res: Response) {
  const id: number = Number(req.params.id);
  await service.remove(id);
  return res.status(204).send();
}
