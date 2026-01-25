import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/productos - Listar productos con filtros
router.get("/", async (req, res) => {
    try {
        const { categoriaId, proveedorId, activo, buscar, stockBajo } = req.query;

        const where: any = {};

        if (categoriaId) where.categoriaId = parseInt(categoriaId as string);
        if (proveedorId) where.proveedorId = parseInt(proveedorId as string);
        if (activo !== undefined) where.activo = activo === "true";
        if (buscar) {
            where.OR = [
                { nombre: { contains: buscar as string, mode: "insensitive" } },
                { codigo: { contains: buscar as string, mode: "insensitive" } },
                { descripcion: { contains: buscar as string, mode: "insensitive" } }
            ];
        }

        let productos = await prisma.producto.findMany({
            where,
            include: {
                categoria: true,
                proveedor: true
            },
            orderBy: { nombre: "asc" }
        });

        // Filtrar productos con stock bajo
        if (stockBajo === "true") {
            productos = productos.filter(p => p.stock <= p.stockMinimo);
        }

        res.json(productos);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

// GET /api/productos/:id - Obtener producto por ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await prisma.producto.findUnique({
            where: { id: parseInt(id) },
            include: {
                categoria: true,
                proveedor: true,
                movimientos: {
                    orderBy: { createdAt: "desc" },
                    take: 10
                }
            }
        });

        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json(producto);
    } catch (error) {
        console.error("Error al obtener producto:", error);
        res.status(500).json({ error: "Error al obtener producto" });
    }
});

// POST /api/productos - Crear producto
router.post("/", async (req, res) => {
    try {
        const { codigo, nombre, descripcion, precio, costo, stock, stockMinimo, categoriaId, proveedorId, imagenUrl } = req.body;

        if (!codigo || !nombre || !precio || !costo || !categoriaId) {
            return res.status(400).json({
                error: "Campos requeridos: codigo, nombre, precio, costo, categoriaId"
            });
        }

        const producto = await prisma.producto.create({
            data: {
                codigo,
                nombre,
                descripcion,
                precio: precio,
                costo: costo,
                stock: stock || 0,
                stockMinimo: stockMinimo || 5,
                categoriaId,
                proveedorId,
                imagenUrl
            },
            include: {
                categoria: true,
                proveedor: true
            }
        });

        res.status(201).json(producto);
    } catch (error: any) {
        if (error.code === "P2002") {
            return res.status(400).json({ error: "Ya existe un producto con ese código" });
        }
        if (error.code === "P2003") {
            return res.status(400).json({ error: "Categoría o proveedor no encontrado" });
        }
        console.error("Error al crear producto:", error);
        res.status(500).json({ error: "Error al crear producto" });
    }
});

// PUT /api/productos/:id - Actualizar producto
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { codigo, nombre, descripcion, precio, costo, stockMinimo, categoriaId, proveedorId, activo, imagenUrl } = req.body;

        const data: any = {};
        if (codigo !== undefined) data.codigo = codigo;
        if (nombre !== undefined) data.nombre = nombre;
        if (descripcion !== undefined) data.descripcion = descripcion;
        if (precio !== undefined) data.precio = precio;
        if (costo !== undefined) data.costo = costo;
        if (stockMinimo !== undefined) data.stockMinimo = stockMinimo;
        if (categoriaId !== undefined) data.categoriaId = categoriaId;
        if (proveedorId !== undefined) data.proveedorId = proveedorId;
        if (activo !== undefined) data.activo = activo;
        if (imagenUrl !== undefined) data.imagenUrl = imagenUrl;

        const producto = await prisma.producto.update({
            where: { id: parseInt(id) },
            data,
            include: {
                categoria: true,
                proveedor: true
            }
        });

        res.json(producto);
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        if (error.code === "P2002") {
            return res.status(400).json({ error: "Ya existe un producto con ese código" });
        }
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ error: "Error al actualizar producto" });
    }
});

// DELETE /api/productos/:id - Eliminar producto
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Primero eliminar movimientos relacionados
        await prisma.movimiento.deleteMany({
            where: { productoId: parseInt(id) }
        });

        await prisma.producto.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: "Producto eliminado exitosamente" });
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ error: "Error al eliminar producto" });
    }
});

export default router;
