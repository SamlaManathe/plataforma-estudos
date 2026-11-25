import { prisma } from "../config/prisma.js";
import type { AdminDTO } from "../types/dtos.js";

export async function getAll() {
  return await prisma.admin.findMany();
}

export async function getOne(id: number) {
  return await prisma.admin.findUnique({ where: { id } });
}

export async function getByEmail(email: string) {
  return await prisma.admin.findUnique({ where: { email } });
}

export async function getByTelephone(telefone: string) {
  return await prisma.admin.findUnique({ where: { telefone } });
}

export async function create(data: AdminDTO) {
  return await prisma.admin.create({ data });
}

export async function update(id: number, data: Partial<AdminDTO>) {
  return await prisma.admin.update({ where: { id }, data });
}

export async function remove(id: number) {
  return await prisma.admin.delete({ where: { id } });
}
