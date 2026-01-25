import { Request, Response } from "express";
import { MovimientoService } from "../services/movimiento.service.js";

export class MovimientoController {
    private service: MovimientoService;

    constructor() {
        this.service = new MovimientoService();
    }

    listar = async (req: Request, res: Response) => {
        try {
            const { productoId, tipo, desde, hasta, limit } = req.query;

            const filtros = {
                productoId: productoId ? parseInt(productoId as string) : undefined,
                tipo: tipo as any,
                desde: desde as string,
                hasta: hasta as string,
                limit: limit ? parseInt(limit as string) : undefined
            };

            const movimientos = await this.service.listar(filtros);
            res.json(movimientos);
        } catch (error) {
            console.error("Error al obtener movimientos:", error);
            res.status(500).json({ error: "Error al obtener movimientos" });
        }
    }

    registrar = async (req: Request, res: Response) => {
        try {
            const { productoId, tipo, cantidad, descripcion } = req.body;

            if (!productoId || !tipo || !cantidad) {
                return res.status(400).json({
                    error: "Campos requeridos: productoId, tipo, cantidad"
                });
            }

            if (!["ENTRADA", "SALIDA", "AJUSTE"].includes(tipo)) {
                return res.status(400).json({
                    error: "Tipo inválido. Use: ENTRADA, SALIDA o AJUSTE"
                });
            }

            if (cantidad <= 0) {
                return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
            }

            const resultado = await this.service.registrar({
                productoId,
                tipo,
                cantidad,
                descripcion
            });

            res.status(201).json(resultado);
        } catch (error: any) {
            console.error("Error al registrar movimiento:", error);

            // Mapeo de errores de negocio a 400 o 404
            if (error.message === "Producto no encontrado") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes("Stock insuficiente")) {
                return res.status(400).json({ error: error.message });
            }

            res.status(500).json({ error: "Error al registrar movimiento" });
        }
    }

    obtenerKardex = async (req: Request, res: Response) => {
        try {
            const { productoId } = req.params;

            const producto = await this.service.obtenerKardex(parseInt(productoId as string));

            if (!producto) {
                return res.status(404).json({ error: "Producto no encontrado" });
            }

            res.json(producto);
        } catch (error) {
            console.error("Error al obtener kardex:", error);
            res.status(500).json({ error: "Error al obtener kardex" });
        }
    }
}
