import Router from "express";
import * as controller from "../controllers/alternativaController.js";
import { validarBody } from "../middleware/validarSchema.js";
import { alternativaSchema } from "@plataforma-estudos/shared/alternativa";

const router = Router();

router.get("/alternativas", controller.getAll);
router.get("/alternativas/:id", controller.getOne);
router.post("/alternativas", validarBody(alternativaSchema), controller.create);
router.put("/alternativas/:id", validarBody(alternativaSchema), controller.update);
router.delete("/alternativas/:id", controller.remove);

export default router;
