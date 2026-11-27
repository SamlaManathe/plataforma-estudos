import type { Request, Response } from "express";
import type {
  EnviarRespostasAulaDTO,
  MarcarAulaAssistidaDTO,
} from "@plataforma-estudos/shared/progresso";
import * as service from "../services/progressoService.js";

export async function responderAula(req: Request, res: Response) {
  const dados: EnviarRespostasAulaDTO = req.body;
  const resultado = await service.enviarRespostasAula(dados);
  return res.status(201).json(resultado);
}

export async function assistirAula(req: Request, res: Response) {
  const dados: MarcarAulaAssistidaDTO = req.body;
  const resultado = await service.marcarAulaAssistida(dados);
  return res.status(201).json(resultado);
}

export async function dashboardAluno(req: Request, res: Response) {
  const alunoId: number = Number(req.params.alunoId);
  const resultado = await service.getDashboardAluno(alunoId);
  return res.json(resultado);
}

export async function respostasAlunoNaAula(req: Request, res: Response) {
  const alunoId: number = Number(req.params.alunoId);
  const aulaId: number = Number(req.params.aulaId);
  const resultado = await service.getRespostasAlunoNaAula(alunoId, aulaId);
  return res.json(resultado);
}

export async function relatorioAdmin(req: Request, res: Response) {
  const relatorio = await service.getRelatorioAdmin();
  return res.json(relatorio);
}
