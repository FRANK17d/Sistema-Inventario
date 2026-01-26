import { Router } from "express";
import { CategoriaController } from "../controllers/categoria.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();
const controller = new CategoriaController();

router.use(verifyToken);

// GET /api/categorias - Listar todas las categorías
router.get("/", controller.listar);

// GET /api/categorias/:id - Obtener categoría por ID
router.get("/:id", controller.obtenerPorId);

// POST /api/categorias - Crear categoría
router.post("/", controller.crear);

// PUT /api/categorias/:id - Actualizar categoría
router.put("/:id", controller.actualizar);

// DELETE /api/categorias/:id - Eliminar categoría
router.delete("/:id", controller.eliminar);

export default router;

