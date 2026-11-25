import Router from "express";
import * as controller from "../controllers/disciplinaController.js";
import { validarBody } from "../middleware/validarSchema.js";
import { disciplinaSchema } from "@plataforma-estudos/shared/disciplina";

const router = Router();

router.get("/disciplinas", controller.getAll);
router.get("/disciplinas/:id", controller.getOne);
router.post("/disciplinas", validarBody(disciplinaSchema), controller.create);
router.put("/disciplinas/:id", validarBody(disciplinaSchema), controller.update);
router.delete("/disciplinas/:id", controller.remove);

export default router;
