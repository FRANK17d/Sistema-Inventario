import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/proveedores - Listar todos los proveedores
router.get("/", async (req, res) => {
    try {
        const proveedores = await prisma.proveedor.findMany({
            include: {
                _count: {
                    select: { productos: true }
                }
            },
            orderBy: { nombre: "asc" }
        });
        res.json(proveedores);
    } catch (error) {
        console.error("Error al obtener proveedores:", error);
        res.status(500).json({ error: "Error al obtener proveedores" });
    }
});

// GET /api/proveedores/:id - Obtener proveedor por ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const proveedor = await prisma.proveedor.findUnique({
            where: { id: parseInt(id) },
            include: { productos: true }
        });

        if (!proveedor) {
            return res.status(404).json({ error: "Proveedor no encontrado" });
        }

        res.json(proveedor);
    } catch (error) {
        console.error("Error al obtener proveedor:", error);
        res.status(500).json({ error: "Error al obtener proveedor" });
    }
});

// POST /api/proveedores - Crear proveedor
router.post("/", async (req, res) => {
    try {
        const { nombre, contacto, telefono, email, direccion } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: "El nombre es requerido" });
        }

        const proveedor = await prisma.proveedor.create({
            data: { nombre, contacto, telefono, email, direccion }
        });

        res.status(201).json(proveedor);
    } catch (error) {
        console.error("Error al crear proveedor:", error);
        res.status(500).json({ error: "Error al crear proveedor" });
    }
});

// PUT /api/proveedores/:id - Actualizar proveedor
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, contacto, telefono, email, direccion, activo } = req.body;

        const proveedor = await prisma.proveedor.update({
            where: { id: parseInt(id) },
            data: { nombre, contacto, telefono, email, direccion, activo }
        });

        res.json(proveedor);
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Proveedor no encontrado" });
        }
        console.error("Error al actualizar proveedor:", error);
        res.status(500).json({ error: "Error al actualizar proveedor" });
    }
});

// DELETE /api/proveedores/:id - Eliminar proveedor
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.proveedor.delete({
            where: { id: parseInt(id) }
        });

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
});

export default router;
