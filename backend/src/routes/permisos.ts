import { Router } from "express";
import { PermisosController } from "../controllers/permisos.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();
const controller = new PermisosController();

router.use(verifyToken);
router.get("/", controller.getPermisos);

export default router;
