import { prisma } from "../config/prisma.js";
import type { DisciplinaDTO } from "../types/dtos.js";

export async function getAll() {
  return await prisma.disciplina.findMany({ orderBy: { nome: "asc" } });
}

export async function getOne(id: number) {
  return await prisma.disciplina.findUnique({
    where: { id },
    include: { aulas: true },
  });
}

export async function getByName(nome: string) {
  return await prisma.disciplina.findUnique({ where: { nome } });
}

export async function create(data: DisciplinaDTO) {
  return await prisma.disciplina.create({ data });
}

export async function update(id: number, data: DisciplinaDTO) {
  return await prisma.disciplina.update({ where: { id }, data });
}

export async function remove(id: number) {
  return await prisma.disciplina.delete({ where: { id } });
}
