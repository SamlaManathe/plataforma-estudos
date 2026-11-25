import Router from "express";
import * as controller from "../controllers/authController.js";
import { validarBody } from "../middleware/validarSchema.js";
import { loginSchema } from "@plataforma-estudos/shared/auth";

const router = Router();

router.post("/auth/login", validarBody(loginSchema), controller.login);

export default router;