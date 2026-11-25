import Router from "express";
import * as controller from "../controllers/questaoController.js";

const router = Router();

router.get("/questoes", controller.getAll);
router.get("/questoes/:id", controller.getOne);
router.post("/questoes", controller.create);
router.put("/questoes/:id", controller.update);
router.delete("/questoes/:id", controller.remove);

export default router;
