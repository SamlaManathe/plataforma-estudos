import Router from "express";
import * as controller from "../controllers/adminController.js";
import { validarBody } from "../middleware/validarSchema.js";
import { cadastroAdminSchema } from "@plataforma-estudos/shared/admin";

const router = Router();

router.get("/admins", controller.getAll);
router.get("/admins/:id", controller.getOne);
router.post("/admins", validarBody(cadastroAdminSchema), controller.create);
router.put("/admins/:id", validarBody(cadastroAdminSchema), controller.update);
router.delete("/admins/:id", controller.remove);

export default router;
