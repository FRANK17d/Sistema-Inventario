import { prisma } from "../lib/prisma.js";
import { TipoMovimiento } from "@prisma/client";

export class MovimientoService {
    async listar(filtros: {
        productoId?: number;
        tipo?: TipoMovimiento;
        desde?: string;
        hasta?: string;
        limit?: number;
    }) {
        const where: any = {};

        if (filtros.productoId) where.productoId = filtros.productoId;
        if (filtros.tipo) where.tipo = filtros.tipo;
        if (filtros.desde || filtros.hasta) {
            where.createdAt = {};
            if (filtros.desde) where.createdAt.gte = new Date(filtros.desde);
            if (filtros.hasta) where.createdAt.lte = new Date(filtros.hasta);
        }

        return await prisma.movimiento.findMany({
            where,
            include: {
                producto: {
                    select: { id: true, codigo: true, nombre: true }
                }
            },
            orderBy: { createdAt: "desc" },
            take: filtros.limit || 100
        });
    }

    async registrar(data: {
        productoId: number;
        tipo: "ENTRADA" | "SALIDA" | "AJUSTE";
        cantidad: number;
        descripcion?: string;
    }) {
        const { productoId, tipo, cantidad, descripcion } = data;

        // Obtener producto actual
        const producto = await prisma.producto.findUnique({
            where: { id: productoId }
        });

        if (!producto) {
            throw new Error("Producto no encontrado");
        }

        // Calcular nuevo stock
        let nuevoStock = producto.stock;
        if (tipo === "ENTRADA") {
            nuevoStock += cantidad;
        } else if (tipo === "SALIDA") {
            if (producto.stock < cantidad) {
                throw new Error(`Stock insuficiente. Stock actual: ${producto.stock}`);
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

        return {
            ...movimiento,
            stockAnterior: producto.stock,
            stockNuevo: nuevoStock
        };
    }

    async obtenerKardex(productoId: number) {
        return await prisma.producto.findUnique({
            where: { id: productoId },
            include: {
                movimientos: {
                    orderBy: { createdAt: "desc" }
                },
                categoria: true
            }
        });
    }
}
