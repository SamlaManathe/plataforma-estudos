import type { Request, Response } from "express";
import type { AdminDTO } from "../types/dtos.js";
import * as service from "../services/adminService.js";

export async function getAll(res: Response) {
  const admins = await service.getAll();
  return res.json(admins);
}

export async function getOne(req: Request, res: Response) {
  const id: number = Number(req.params.id);
  const admin = await service.getOne(id);
  if (!admin) {
    return res.status(404).json({ mensagem: "Admin não encontrado" });
  }
  return res.json(admin);
}

export async function create(req: Request, res: Response) {
  const dados: AdminDTO = req.body;
  const admin = await service.create(dados);
  return res.status(201).json(admin);
}

export async function update(req: Request, res: Response) {
  const id: number = Number(req.params.id);
  const dados: AdminDTO = req.body;
  const admin = await service.update(id, dados);
  return res.json(admin);
}

export async function remove(req: Request, res: Response) {
  const id: number = Number(req.params.id);
  await service.remove(id);
  return res.status(204).send();
}
