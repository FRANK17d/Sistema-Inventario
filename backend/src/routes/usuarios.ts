import { Router } from "express";
import { UsuariosController } from "../controllers/usuarios.controller.js";
import { verifyToken, requirePermission } from "../middlewares/auth.middleware.js";

const router = Router();
const controller = new UsuariosController();

router.use(verifyToken);

router.get("/", requirePermission("USUARIO_VER"), controller.getUsuarios);
router.post("/", requirePermission("USUARIO_CREAR"), controller.createUsuario);
router.put("/:id", requirePermission("USUARIO_EDITAR"), controller.updateUsuario);
router.delete("/:id", requirePermission("USUARIO_ELIMINAR"), controller.deleteUsuario);

export default router;
