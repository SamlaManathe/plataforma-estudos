import Router from "express";
import * as controller from "../controllers/progressoController.js";
import { validarBody } from "../middleware/validarSchema.js";
import {
  enviarRespostasAulaSchema,
  marcarAulaAssistidaSchema,
} from "@plataforma-estudos/shared/progresso";

const router = Router();

router.post(
  "/progresso/responder-aula",
  validarBody(enviarRespostasAulaSchema),
  controller.responderAula,
);
router.post(
  "/progresso/assistir-aula",
  validarBody(marcarAulaAssistidaSchema),
  controller.assistirAula,
);
router.get("/progresso/aluno/:alunoId", controller.dashboardAluno);
router.get("/progresso/admin/relatorio", controller.relatorioAdmin);

export default router;