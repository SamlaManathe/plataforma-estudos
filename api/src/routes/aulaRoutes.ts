import Router from "express";
import * as controller from "../controllers/aulaController.js";

const router = Router();

router.get("/aulas", controller.getAll);
router.get("/aulas/:id", controller.getOne);
router.get("/aulas/:id/pdf", controller.getPdf);
router.post("/aulas", controller.create);
router.put("/aulas/:id", controller.update);
router.delete("/aulas/:id", controller.remove);

export default router;
