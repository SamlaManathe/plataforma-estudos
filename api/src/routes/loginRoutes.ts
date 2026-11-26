import Router from "express";
import * as controller from "../controllers/loginController.js";
import { validarBody } from "../middleware/validarSchema.js";
import { loginSchema } from "@plataforma-estudos/shared/login";

const router = Router();

router.post("/login", validarBody(loginSchema), controller.login);

export default router;