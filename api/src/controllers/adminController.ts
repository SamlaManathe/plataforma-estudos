import type { Request, Response } from "express";
import type {
  AtualizarAdminDTO,
  CadastroAdminDTO,
} from "@plataforma-estudos/shared/admin";
import { parseId } from "../middleware/validarSchema.js";
import * as service from "../services/adminService.js";

export async function getAll(req: Request, res: Response) {
  const admins = await service.getAll();
  return res.json(admins);
}

export async function getOne(req: Request, res: Response) {
  const id: number = parseId(req.params.id);
  const admin = await service.getOne(id);
  if (!admin) {
    return res.status(404).json({ mensagem: "Admin não encontrado" });
  }
  return res.json(admin);
}

export async function create(req: Request, res: Response) {
  const dados: CadastroAdminDTO = req.body;
  const admin = await service.create(dados, false);
  return res.status(201).json(admin);
}

export async function createAprovado(req: Request, res: Response) {
  const dados: CadastroAdminDTO = req.body;
  const admin = await service.create(dados, true);
  return res.status(201).json(admin);
}

export async function update(req: Request, res: Response) {
  const id: number = parseId(req.params.id);
  const dados: AtualizarAdminDTO = req.body;
  const admin = await service.update(id, dados);
  return res.json(admin);
}

export async function alterarStatusAprovacao(req: Request, res: Response) {
  const id: number = parseId(req.params.id);
  const aprovado: boolean = Boolean(req.body.aprovado);
  const adminLogadoId: number | undefined = req.body.adminLogadoId
    ? Number(req.body.adminLogadoId)
    : undefined;
  const admin = await service.alterarStatusAprovacao(
    id,
    aprovado,
    adminLogadoId,
  );
  return res.json(admin);
}

export async function remove(req: Request, res: Response) {
  const id: number = parseId(req.params.id);
  await service.remove(id);
  return res.status(204).send();
}
