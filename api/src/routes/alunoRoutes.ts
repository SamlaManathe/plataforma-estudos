import Router from "express";
import * as controller from "../controllers/alunoController.js";

const router = Router();

router.get("/alunos", controller.getAll);
router.get("/alunos/:id", controller.getOne);
router.post("/alunos", controller.create);
router.put("/alunos/:id", controller.update);
router.delete("/alunos/:id", controller.remove);

export default router;
