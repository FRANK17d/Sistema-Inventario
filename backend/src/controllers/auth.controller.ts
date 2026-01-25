import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { loginSchema } from "../schemas/auth.schema.js";
import { z } from "zod";

export class AuthController {
    private service: AuthService;

    constructor() {
        this.service = new AuthService();
    }

    login = async (req: Request, res: Response) => {
        try {
            // 1. Validar datos de entrada con Zod
            const data = loginSchema.parse(req.body);

            // 2. Llamar al servicio
            const resultado = await this.service.login(data);

            res.json(resultado);
        } catch (error: any) {
            // Error de validación Zod
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }

            // Error de credenciales
            if (error.message === "Credenciales inválidas") {
                return res.status(401).json({ error: "Email o contraseña incorrectos" });
            }

            console.error("Error en login:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    };

    me = async (req: Request, res: Response) => {
        // Este endpoint devolverá la info del usuario basada en el token (middleware)
        // Por ahora devolvemos un mock hasta implementar el middleware
        res.json({ message: "Endpoint autenticado (WIP)" });
    }
}
