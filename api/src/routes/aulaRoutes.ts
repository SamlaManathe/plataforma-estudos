import Router from "express";
import * as controller from "../controllers/aulaController.js";
import { validarBody } from "../middleware/validarSchema.js";
import { aulaSchema } from "@plataforma-estudos/shared/aula";

const router = Router();

router.get("/aulas", controller.getAll);
router.get("/aulas/:id", controller.getOne);
router.get("/aulas/:id/pdf", controller.getPdf);
router.post("/aulas", validarBody(aulaSchema), controller.create);
router.put("/aulas/:id", validarBody(aulaSchema), controller.update);
router.delete("/aulas/:id", controller.remove);

export default router;
