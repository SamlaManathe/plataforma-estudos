import type { Request, Response } from "express";
import type { AulaDTO } from "../types/dtos.js";
import * as service from "../services/aulaService.js";

export async function getAll(req: Request, res: Response) {
  const aulas = await service.getAll();
  return res.json(aulas);
}

export async function getOne(req: Request, res: Response) {
  const id = Number(req.params.id);
  const aula = await service.getOne(id);
  if (!aula) {
    return res.status(404).json({ mensagem: "Aula não encontrada" });
  }
  return res.json(aula);
}

export async function getPdf(req: Request, res: Response) {
  const id = Number(req.params.id);
  const aula = await service.getPdf(id);
  if (!aula || !aula.pdfArquivo) {
    return res
      .status(404)
      .json({ mensagem: "PDF não encontrado para esta aula" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${aula.pdfNome || "material.pdf"}"`,
  );
  return res.send(Buffer.from(aula.pdfArquivo));
}

export async function create(req: Request, res: Response) {
  const dados: AulaDTO = req.body;
  const aula = await service.create(dados);
  return res.status(201).json(aula);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const dados: AulaDTO = req.body;
  const aula = await service.update(id, dados);
  return res.json(aula);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await service.remove(id);
  return res.status(204).send();
}
