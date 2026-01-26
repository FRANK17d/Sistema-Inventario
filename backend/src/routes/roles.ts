import { Router } from "express";
import { RolesController } from "../controllers/roles.controller.js";
import { verifyToken, requirePermission } from "../middlewares/auth.middleware.js";

const router = Router();
const controller = new RolesController();

router.use(verifyToken);

router.get("/", requirePermission("USUARIO_VER"), controller.getRoles); // O un permiso específico ROL_VER si existiera
router.post("/", requirePermission("USUARIO_CREAR"), controller.createRol);
router.put("/:id", requirePermission("USUARIO_EDITAR"), controller.updateRol);
router.delete("/:id", requirePermission("USUARIO_ELIMINAR"), controller.deleteRol);

export default router;
