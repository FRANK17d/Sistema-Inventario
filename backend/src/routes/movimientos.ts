import { Router } from "express";
import { prisma } from "../lib/prisma.js";

type TipoMovimiento = "ENTRADA" | "SALIDA" | "AJUSTE";

const router = Router();

// GET /api/movimientos - Listar movimientos con filtros
router.get("/", async (req, res) => {
    try {
        const { productoId, tipo, desde, hasta, limit } = req.query;

        const where: any = {};

        if (productoId) where.productoId = parseInt(productoId as string);
        if (tipo) where.tipo = tipo as TipoMovimiento;
        if (desde || hasta) {
            where.createdAt = {};
            if (desde) where.createdAt.gte = new Date(desde as string);
            if (hasta) where.createdAt.lte = new Date(hasta as string);
        }

        const movimientos = await prisma.movimiento.findMany({
            where,
            include: {
                producto: {
                    select: { id: true, codigo: true, nombre: true }
                }
            },
            orderBy: { createdAt: "desc" },
            take: limit ? parseInt(limit as string) : 100
        });

        res.json(movimientos);
    } catch (error) {
        console.error("Error al obtener movimientos:", error);
        res.status(500).json({ error: "Error al obtener movimientos" });
    }
});

// POST /api/movimientos - Registrar movimiento (actualiza stock automáticamente)
router.post("/", async (req, res) => {
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

        // Obtener producto actual
        const producto = await prisma.producto.findUnique({
            where: { id: productoId }
        });

        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // Calcular nuevo stock
        let nuevoStock = producto.stock;
        if (tipo === "ENTRADA") {
            nuevoStock += cantidad;
        } else if (tipo === "SALIDA") {
            if (producto.stock < cantidad) {
                return res.status(400).json({
                    error: `Stock insuficiente. Stock actual: ${producto.stock}`
                });
            }
            nuevoStock -= cantidad;
        } else if (tipo === "AJUSTE") {
            nuevoStock = cantidad; // El ajuste establece el stock directamente
        }

        // Crear movimiento y actualizar stock en transacción
        const [movimiento] = await prisma.$transaction([
            prisma.movimiento.create({
                data: {
                    productoId,
                    tipo: tipo as TipoMovimiento,
                    cantidad,
                    descripcion
                },
                include: {
                    producto: {
                        select: { id: true, codigo: true, nombre: true }
                    }
                }
            }),
            prisma.producto.update({
                where: { id: productoId },
                data: { stock: nuevoStock }
            })
        ]);

        res.status(201).json({
            ...movimiento,
            stockAnterior: producto.stock,
            stockNuevo: nuevoStock
        });
    } catch (error) {
        console.error("Error al registrar movimiento:", error);
        res.status(500).json({ error: "Error al registrar movimiento" });
    }
});

// GET /api/movimientos/producto/:productoId - Kardex de un producto
router.get("/producto/:productoId", async (req, res) => {
    try {
        const { productoId } = req.params;

        const producto = await prisma.producto.findUnique({
            where: { id: parseInt(productoId) },
            include: {
                movimientos: {
                    orderBy: { createdAt: "desc" }
                },
                categoria: true
            }
        });

        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json(producto);
    } catch (error) {
        console.error("Error al obtener kardex:", error);
        res.status(500).json({ error: "Error al obtener kardex" });
    }
});

export default router;
