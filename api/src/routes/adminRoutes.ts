import Router from "express";
import * as controller from "../controllers/adminController.js";
import { validarBody } from "../middleware/validarSchema.js";
import {
  atualizarAdminSchema,
  cadastroAdminSchema,
} from "@plataforma-estudos/shared/admin";

const router = Router();

router.get("/admins", controller.getAll);
router.get("/admins/:id", controller.getOne);
router.post("/admins", validarBody(cadastroAdminSchema), controller.create);
router.post(
  "/admins/direto",
  validarBody(cadastroAdminSchema),
  controller.createAprovado,
);
router.put("/admins/:id", validarBody(atualizarAdminSchema), controller.update);
router.patch("/admins/:id/aprovar", controller.aprovar);
router.delete("/admins/:id", controller.remove);

export default router;