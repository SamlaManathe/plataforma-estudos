import type { Request, Response } from "express";
import type { AulaDTO } from "@plataforma-estudos/shared/aula";
import { parseId } from "../middleware/validarSchema.js";
import * as service from "../services/aulaService.js";

export async function getAll(req: Request, res: Response) {
  const aulas = await service.getAll();
  return res.json(aulas);
}

export async function getOne(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const aula = await service.getOne(id);
  if (!aula) {
    return res.status(404).json({ mensagem: "Aula não encontrada" });
  }
  return res.json(aula);
}

export async function getPdf(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const aula = await service.getPdf(id);
  if (!aula || !aula.pdfArquivo) {
    return res
      .status(404)
      .json({ mensagem: "PDF não encontrado para esta aula" });
  }

  const nomeArquivo = aula.pdfNome || "material.pdf";
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${encodeURIComponent(nomeArquivo)}"; filename*=UTF-8''${encodeURIComponent(nomeArquivo)}`,
  );
  return res.send(Buffer.from(aula.pdfArquivo));
}

export async function create(req: Request, res: Response) {
  const dados: AulaDTO = req.body;

  const pdf = req.file
    ? {
        nome: Buffer.from(req.file.originalname, "latin1").toString("utf8"),
        arquivo: req.file.buffer,
      }
    : undefined;

  const aula = await service.create(dados, pdf);
  return res.status(201).json(aula);
}

export async function update(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const dados: AulaDTO = req.body;
  const removerPdf =
    req.body.removerPdf === "true" || req.body.removerPdf === true;

  const pdf = req.file
    ? {
        nome: Buffer.from(req.file.originalname, "latin1").toString("utf8"),
        arquivo: req.file.buffer,
      }
    : undefined;

  const aula = await service.update(id, dados, pdf, removerPdf);
  return res.json(aula);
}

export async function remove(req: Request, res: Response) {
  const id = parseId(req.params.id);
  await service.remove(id);
  return res.status(204).send();
}
