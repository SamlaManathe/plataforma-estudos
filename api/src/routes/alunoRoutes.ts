import Router from "express";
import * as controller from "../controllers/alunoController.js";
import { validarBody } from "../middleware/validarSchema.js";
import {
  cadastroAlunoSchema,
  atualizarAlunoSchema,
} from "@plataforma-estudos/shared/aluno";

const router = Router();

router.get("/alunos", controller.getAll);
router.get("/alunos/:id", controller.getOne);
router.post("/alunos", validarBody(cadastroAlunoSchema), controller.create);
router.put("/alunos/:id", validarBody(atualizarAlunoSchema), controller.update);
router.delete("/alunos/:id", controller.remove);

export default router;