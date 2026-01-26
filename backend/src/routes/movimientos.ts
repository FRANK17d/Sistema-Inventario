import { Router } from "express";
import { MovimientoController } from "../controllers/movimiento.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();
const controller = new MovimientoController();

router.use(verifyToken);

// GET /api/movimientos - Listar movimientos con filtros
router.get("/", controller.listar);

// POST /api/movimientos - Registrar movimiento (actualiza stock automáticamente)
router.post("/", controller.registrar);

// GET /api/movimientos/producto/:productoId - Kardex de un producto
router.get("/producto/:productoId", controller.obtenerKardex);

export default router;

