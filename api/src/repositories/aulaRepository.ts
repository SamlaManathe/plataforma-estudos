import { prisma } from "../config/prisma.js";
import type { AulaDTO } from "../types/dtos.js";

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

export async function getPdfById(id: number) {
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

export async function create(data: AulaDTO) {
  return await prisma.aula.create({
    data,
    omit: { pdfArquivo: true },
  });
}

export async function update(id: number, data: Partial<AulaDTO>) {
  return await prisma.aula.update({
    where: { id },
    data,
    omit: { pdfArquivo: true },
  });
}

export async function remove(id: number) {
  return await prisma.aula.delete({ where: { id } });
}
