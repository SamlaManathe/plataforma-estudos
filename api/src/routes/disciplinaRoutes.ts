import Router from "express";
import * as controller from "../controllers/disciplinaController.js";

const router = Router();

router.get("/disciplinas", controller.getAll);
router.get("/disciplinas/:id", controller.getOne);
router.post("/disciplinas", controller.create);
router.put("/disciplinas/:id", controller.update);
router.delete("/disciplinas/:id", controller.remove);

export default router;
