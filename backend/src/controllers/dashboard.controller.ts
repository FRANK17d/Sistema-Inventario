import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service.js";

export class DashboardController {
    private service: DashboardService;

    constructor() {
        this.service = new DashboardService();
    }

    obtenerEstadisticas = async (req: Request, res: Response) => {
        try {
            const estadisticas = await this.service.obtenerEstadisticas();
            res.json(estadisticas);
        } catch (error) {
            console.error("Error al obtener dashboard:", error);
            res.status(500).json({ error: "Error al obtener dashboard" });
        }
    }
}
