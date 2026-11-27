import { prisma } from "../config/prisma.js";
import type { AulaDTO } from "@plataforma-estudos/shared/aula";

export async function getAll() {
  return await prisma.aula.findMany({
    omit: { pdfArquivo: true },
    include: { disciplina: true },
    orderBy: { id: "asc" },
  });
}

export async function getOne(id: number) {
  return await prisma.aula.findUnique({
    where: { id },
    omit: { pdfArquivo: true },
    include: {
      disciplina: true,
      questoes: {
        orderBy: { numeroQuestao: "asc" },
        include: {
          alternativas: { orderBy: { letra: "asc" } },
        },
      },
    },
  });
}

export async function getPdf(id: number) {
  return await prisma.aula.findUnique({
    where: { id },
    select: { pdfNome: true, pdfArquivo: true },
  });
}

export async function getByTituloAndDisciplina(
  titulo: string,
  disciplinaId: number,
) {
  return await prisma.aula.findFirst({
    where: { titulo, disciplinaId },
  });
}

type ArquivoPDF = {
  nome: string;
  arquivo: Buffer;
}; // transferir para outro lugar (no zod, talvez)

function converterPdf(arquivo: Buffer): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(arquivo.byteLength));
  bytes.set(arquivo);
  return bytes;
}

export async function create(data: AulaDTO, pdf?: ArquivoPDF) {
  return await prisma.aula.create({
    data: {
      titulo: data.titulo,
      disciplina: {
        connect: { id: data.disciplinaId },
      },
      ...(data.videoUrl !== undefined && {
        videoUrl: data.videoUrl,
      }),
      pdfNome: pdf?.nome ?? null,
      pdfArquivo: pdf ? converterPdf(pdf.arquivo) : null,
    },
    omit: { pdfArquivo: true },
    include: { questoes: true },
  });
}

export async function update(
  id: number,
  data: Partial<AulaDTO>,
  pdf?: ArquivoPDF,
) {
  return await prisma.aula.update({
    where: { id },
    data: {
      ...(data.titulo !== undefined && {
        titulo: data.titulo,
      }),
      ...(data.disciplinaId !== undefined && {
        disciplina: {
          connect: { id: data.disciplinaId },
        },
      }),
      ...(data.videoUrl !== undefined && {
        videoUrl: data.videoUrl,
      }),
      ...(pdf
        ? {
            pdfNome: pdf.nome,
            pdfArquivo: converterPdf(pdf.arquivo),
          }
        : data.removerPdf
          ? {
              pdfNome: null,
              pdfArquivo: null,
            }
          : {}),
    },
    omit: { pdfArquivo: true },
    include: { questoes: true },
  });
}

export async function remove(id: number) {
  return await prisma.aula.delete({ where: { id } });
}
