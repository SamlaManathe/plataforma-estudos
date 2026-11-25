import Router from "express";
import * as controller from "../controllers/adminController.js";

const router = Router();

router.get("/admins", controller.getAll);
router.get("/admins/:id", controller.getOne);
router.post("/admins", controller.create);
router.put("/admins/:id", controller.update);
router.delete("/admins/:id", controller.remove);

export default router;
