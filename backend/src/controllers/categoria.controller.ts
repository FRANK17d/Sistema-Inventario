import { Request, Response } from "express";
import { CategoriaService } from "../services/categoria.service.js";

export class CategoriaController {
    private service: CategoriaService;

    constructor() {
        this.service = new CategoriaService();
    }

    listar = async (req: Request, res: Response) => {
        try {
            const categorias = await this.service.listar();
            res.json(categorias);
        } catch (error) {
            console.error("Error al obtener categorías:", error);
            res.status(500).json({ error: "Error al obtener categorías" });
        }
    }

    obtenerPorId = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const categoria = await this.service.obtenerPorId(parseInt(id as string));

            if (!categoria) {
                return res.status(404).json({ error: "Categoría no encontrada" });
            }

            res.json(categoria);
        } catch (error) {
            console.error("Error al obtener categoría:", error);
            res.status(500).json({ error: "Error al obtener categoría" });
        }
    }

    crear = async (req: Request, res: Response) => {
        try {
            const { nombre, descripcion, imagenUrl } = req.body;

            if (!nombre) {
                return res.status(400).json({ error: "El nombre es requerido" });
            }

            const categoria = await this.service.crear({ nombre, descripcion, imagenUrl });

            res.status(201).json(categoria);
        } catch (error: any) {
            if (error.code === "P2002") {
                return res.status(400).json({ error: "Ya existe una categoría con ese nombre" });
            }
            console.error("Error al crear categoría:", error);
            res.status(500).json({ error: "Error al crear categoría" });
        }
    }

    actualizar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { nombre, descripcion, imagenUrl } = req.body;

            const categoria = await this.service.actualizar(parseInt(id as string), { nombre, descripcion, imagenUrl });

            res.json(categoria);
        } catch (error: any) {
            if (error.code === "P2025") {
                return res.status(404).json({ error: "Categoría no encontrada" });
            }
            if (error.code === "P2002") {
                return res.status(400).json({ error: "Ya existe una categoría con ese nombre" });
            }
            console.error("Error al actualizar categoría:", error);
            res.status(500).json({ error: "Error al actualizar categoría" });
        }
    }

    eliminar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            await this.service.eliminar(parseInt(id as string));

            res.json({ message: "Categoría eliminada exitosamente" });
        } catch (error: any) {
            if (error.code === "P2025") {
                return res.status(404).json({ error: "Categoría no encontrada" });
            }
            if (error.code === "P2003") {
                return res.status(400).json({ error: "No se puede eliminar: hay productos asociados" });
            }
            console.error("Error al eliminar categoría:", error);
            res.status(500).json({ error: "Error al eliminar categoría" });
        }
    }
}
