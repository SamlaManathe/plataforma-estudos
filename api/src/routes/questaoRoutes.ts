import Router from "express";
import * as controller from "../controllers/questaoController.js";
import { validarBody } from "../middleware/validarSchema.js";
import { questaoSchema } from "@plataforma-estudos/shared/questao";

const router = Router();

router.get("/questoes", controller.getAll);
router.get("/questoes/:id", controller.getOne);
router.post("/questoes", validarBody(questaoSchema), controller.create);
router.put("/questoes/:id", validarBody(questaoSchema), controller.update);
router.delete("/questoes/:id", controller.remove);

export default router;
