import { prisma } from "../config/prisma.js";
import type { AlunoDTO } from "../types/dtos.js";

export async function getAll() {
  return await prisma.aluno.findMany();
}

export async function getOne(id: number) {
  return await prisma.aluno.findUnique({ where: { id } });
}

export async function getByEmail(email: string) {
  return await prisma.aluno.findUnique({ where: { email } });
}

export async function getByTelephone(telefone: string) {
  return await prisma.aluno.findUnique({ where: { telefone } });
}

export async function create(data: AlunoDTO) {
  return await prisma.aluno.create({ data });
}

export async function update(id: number, data: Partial<AlunoDTO>) {
  return await prisma.aluno.update({ where: { id }, data });
}

export async function remove(id: number) {
  return await prisma.aluno.delete({ where: { id } });
}
