import { Router } from "express";
import { ProveedorController } from "../controllers/proveedor.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();
const controller = new ProveedorController();

router.use(verifyToken);

// GET /api/proveedores - Listar todos los proveedores
router.get("/", controller.listar);

// GET /api/proveedores/:id - Obtener proveedor por ID
router.get("/:id", controller.obtenerPorId);

// POST /api/proveedores - Crear proveedor
router.post("/", controller.crear);

// PUT /api/proveedores/:id - Actualizar proveedor
router.put("/:id", controller.actualizar);

// DELETE /api/proveedores/:id - Eliminar proveedor
router.delete("/:id", controller.eliminar);

export default router;

