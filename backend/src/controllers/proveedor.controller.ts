import { Request, Response } from "express";
import { ProveedorService } from "../services/proveedor.service.js";

export class ProveedorController {
    private service: ProveedorService;

    constructor() {
        this.service = new ProveedorService();
    }

    listar = async (req: Request, res: Response) => {
        try {
            const proveedores = await this.service.listar();
            res.json(proveedores);
        } catch (error) {
            console.error("Error al obtener proveedores:", error);
            res.status(500).json({ error: "Error al obtener proveedores" });
        }
    }

    obtenerPorId = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const proveedor = await this.service.obtenerPorId(parseInt(id as string));

            if (!proveedor) {
                return res.status(404).json({ error: "Proveedor no encontrado" });
            }

            res.json(proveedor);
        } catch (error) {
            console.error("Error al obtener proveedor:", error);
            res.status(500).json({ error: "Error al obtener proveedor" });
        }
    }

    crear = async (req: Request, res: Response) => {
        try {
            const { nombre, contacto, telefono, email, direccion } = req.body;

            if (!nombre) {
                return res.status(400).json({ error: "El nombre es requerido" });
            }

            const proveedor = await this.service.crear({ nombre, contacto, telefono, email, direccion });

            res.status(201).json(proveedor);
        } catch (error) {
            console.error("Error al crear proveedor:", error);
            res.status(500).json({ error: "Error al crear proveedor" });
        }
    }

    actualizar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { nombre, contacto, telefono, email, direccion, activo } = req.body;

            const proveedor = await this.service.actualizar(parseInt(id as string), {
                nombre, contacto, telefono, email, direccion, activo
            });

            res.json(proveedor);
        } catch (error: any) {
            if (error.code === "P2025") {
                return res.status(404).json({ error: "Proveedor no encontrado" });
            }
            console.error("Error al actualizar proveedor:", error);
            res.status(500).json({ error: "Error al actualizar proveedor" });
        }
    }

    eliminar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            await this.service.eliminar(parseInt(id as string));

            res.json({ message: "Proveedor eliminado exitosamente" });
        } catch (error: any) {
            if (error.code === "P2025") {
                return res.status(404).json({ error: "Proveedor no encontrado" });
            }
            if (error.code === "P2003") {
                return res.status(400).json({ error: "No se puede eliminar: hay productos asociados" });
            }
            console.error("Error al eliminar proveedor:", error);
            res.status(500).json({ error: "Error al eliminar proveedor" });
        }
    }
}
