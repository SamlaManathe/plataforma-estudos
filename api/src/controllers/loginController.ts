import type { Request, Response } from "express";
import * as service from "../services/loginService.js";
import type { LoginDTO } from "@plataforma-estudos/shared/login";

export async function login(req: Request, res: Response) {
  const dados: LoginDTO = req.body;
  const aluno = await service.login(dados);
  if (!aluno) {
    // Mesma mensagem para email inexistente e senha errada: não revela qual dos dois falhou
    return res.status(401).json({ mensagem: "E-mail ou senha inválidos" });
  }
  return res.json(aluno);
}