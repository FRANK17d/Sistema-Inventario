import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();
const controller = new AuthController();

// POST /api/auth/login - Iniciar sesión
router.post("/login", controller.login);

// GET /api/auth/me - Validar token y obtener usuario actual
router.get("/me", verifyToken, controller.me);

export default router;
