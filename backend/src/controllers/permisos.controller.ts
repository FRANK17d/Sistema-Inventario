import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export class PermisosController {
    getPermisos = async (req: Request, res: Response) => {
        try {
            const permisos = await prisma.permiso.findMany({
                orderBy: { nombre: 'asc' }
            });
            res.json(permisos);
        } catch (error) {
            console.error("Error al obtener permisos:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    };
}
