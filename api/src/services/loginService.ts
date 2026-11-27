import bcrypt from "bcryptjs";
import { getByEmailAndPassword as getByEmailAndPasswordAluno } from "../repositories/alunoRepository.js";
import { getByEmailAndPassword as getByEmailAndPasswordAdmin } from "../repositories/adminRepository.js";
import type { LoginDTO } from "@plataforma-estudos/shared/login";

export async function login({ email, senha }: LoginDTO) {
  const admin = await getByEmailAndPasswordAdmin(email);
  
  if (admin && (await bcrypt.compare(senha, admin.senha))) {
    if (!admin.aprovado) {
      throw new Error(
        "Seu cadastro de administrador ainda está pendente de aprovação por um administrador.",
      );
    }
    const { senha, ...adminSemSenha } = admin;
    return { ...adminSemSenha, tipo: "admin" as const };
  }

  const aluno = await getByEmailAndPasswordAluno(email, senha);

  if (aluno && (await bcrypt.compare(senha, aluno.senha))) {
    const { senha, ...alunoSemSenha } = aluno;
    return { ...alunoSemSenha, tipo: "aluno" as const };
  }

  return null;
}