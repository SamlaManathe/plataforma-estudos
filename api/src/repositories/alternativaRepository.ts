import { prisma } from "../config/prisma.js";
import type { AlternativaDTO } from "@plataforma-estudos/shared/alternativa";

export async function getAll() {
  return await prisma.alternativa.findMany({
    orderBy: [{ questaoId: "asc" }, { letra: "asc" }],
  });
}

export async function getOne(id: number) {
  return await prisma.alternativa.findUnique({ where: { id } });
}

export async function getByQuestionAndLetter(
  questaoId: number,
  letra: AlternativaDTO["letra"],
) {
  return await prisma.alternativa.findFirst({
    where: { questaoId, letra },
  });
}

export async function create(data: AlternativaDTO) {
  return await prisma.alternativa.create({ data });
}

export async function update(id: number, data: AlternativaDTO) {
  return await prisma.alternativa.update({ where: { id }, data });
}

export async function remove(id: number) {
  return await prisma.alternativa.delete({ where: { id } });
}
