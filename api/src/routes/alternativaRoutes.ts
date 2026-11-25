import Router from "express";
import * as controller from "../controllers/alternativaController.js";

const router = Router();

router.get("/alternativas", controller.getAll);
router.get("/alternativas/:id", controller.getOne);
router.post("/alternativas", controller.create);
router.put("/alternativas/:id", controller.update);
router.delete("/alternativas/:id", controller.remove);

export default router;
