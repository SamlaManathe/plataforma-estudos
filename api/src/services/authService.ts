import bcrypt from "bcryptjs";
import * as alunoRepository from "../repositories/alunoRepository.js";
import type { LoginDTO } from "@plataforma-estudos/shared/auth";

// Devolve o secretário (sem senha) se email e senha conferem; senão, null
export async function login({ email, senha }: LoginDTO) {
  const aluno = await alunoRepository.getByEmailAndPassword(String(email));
  if (!aluno || !aluno.senha) {
    return null;
  }

  const senhaConfere = await bcrypt.compare(String(senha), aluno.senha);
  if (!senhaConfere) {
    return null;
  }

  const { senha: _, ...alunoSemSenha } = aluno;
  return alunoSemSenha;
}