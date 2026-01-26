import { Router } from "express";
import { ProductoController } from "../controllers/producto.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();
const controller = new ProductoController();

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// GET /api/productos - Listar productos con filtros
router.get("/", controller.listar);

// GET /api/productos/:id - Obtener producto por ID
router.get("/:id", controller.obtenerPorId);

// POST /api/productos - Crear producto
router.post("/", controller.crear);

// PUT /api/productos/:id - Actualizar producto
router.put("/:id", controller.actualizar);

// DELETE /api/productos/:id - Eliminar producto
router.delete("/:id", controller.eliminar);

export default router;

