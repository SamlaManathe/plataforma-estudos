import Router from "express";
import multer from "multer";
import * as controller from "../controllers/aulaController.js";
import { validarBody } from "../middleware/validarSchema.js";
import { aulaSchema } from "@plataforma-estudos/shared/aula";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/aulas", controller.getAll);
router.get("/aulas/:id", controller.getOne);
router.get("/aulas/:id/pdf", controller.getPdf);
router.post("/aulas", upload.single("pdf"), validarBody(aulaSchema), controller.create);
router.put("/aulas/:id", upload.single("pdf"), validarBody(aulaSchema), controller.update);
router.delete("/aulas/:id", controller.remove);

export default router;
