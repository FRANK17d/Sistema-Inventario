import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/categorias - Listar todas las categorías
router.get("/", async (req, res) => {
    try {
        const categorias = await prisma.categoria.findMany({
            include: {
                _count: {
                    select: { productos: true }
                }
            },
            orderBy: { nombre: "asc" }
        });
        res.json(categorias);
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ error: "Error al obtener categorías" });
    }
});

// GET /api/categorias/:id - Obtener categoría por ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const categoria = await prisma.categoria.findUnique({
            where: { id: parseInt(id) },
            include: { productos: true }
        });

        if (!categoria) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        res.json(categoria);
    } catch (error) {
        console.error("Error al obtener categoría:", error);
        res.status(500).json({ error: "Error al obtener categoría" });
    }
});

// POST /api/categorias - Crear categoría
router.post("/", async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: "El nombre es requerido" });
        }

        const categoria = await prisma.categoria.create({
            data: { nombre, descripcion }
        });

        res.status(201).json(categoria);
    } catch (error: any) {
        if (error.code === "P2002") {
            return res.status(400).json({ error: "Ya existe una categoría con ese nombre" });
        }
        console.error("Error al crear categoría:", error);
        res.status(500).json({ error: "Error al crear categoría" });
    }
});

// PUT /api/categorias/:id - Actualizar categoría
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        const categoria = await prisma.categoria.update({
            where: { id: parseInt(id) },
            data: { nombre, descripcion }
        });

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
});

// DELETE /api/categorias/:id - Eliminar categoría
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.categoria.delete({
            where: { id: parseInt(id) }
        });

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
});

export default router;
