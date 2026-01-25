import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/dashboard - Estadísticas del inventario
router.get("/", async (req, res) => {
  try {
    // Total de productos
    const [
      totalProductos,
      totalCategorias,
      totalProveedores,
      productosConStockBajoDB,
      resumenFinanciero,
      ultimosMovimientos,
      productosPorCategoria
    ] = await Promise.all([
      // 1. Total productos activos
      prisma.producto.count({ where: { activo: true } }),

      // 2. Total categorías
      prisma.categoria.count(),

      // 3. Total proveedores activos
      prisma.proveedor.count({ where: { activo: true } }),

      // 4. Productos con stock bajo (limitado a 10 para la alerta)
      prisma.producto.findMany({
        where: {
          activo: true,
          stock: { lte: prisma.producto.fields.stockMinimo }
        },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          stock: true,
          stockMinimo: true,
          categoria: { select: { nombre: true } }
        },
        orderBy: { stock: "asc" },
        take: 10 // Optimización: solo traer los necesarios para UI
      }),

      // 5. Totales financieros (Traer solo campos necesarios)
      prisma.producto.findMany({
        where: { activo: true },
        select: {
          stock: true,
          precio: true,
          costo: true
        }
      }),

      // 6. Últimos movimientos
      prisma.movimiento.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          producto: {
            select: { codigo: true, nombre: true }
          }
        }
      }),

      // 7. Productos por categoría
      prisma.categoria.findMany({
        select: {
          id: true,
          nombre: true,
          imagenUrl: true,
          _count: {
            select: { productos: true }
          }
        },
        orderBy: { nombre: "asc" }
      })
    ]);

    // Calcular totales en memoria (mucho más rápido con payload reducido)
    const valorizacion = resumenFinanciero.reduce((acc: number, p: { stock: number, costo: any }) => acc + (p.stock * Number(p.costo)), 0);
    const valorVenta = resumenFinanciero.reduce((acc: number, p: { stock: number, precio: any }) => acc + (p.stock * Number(p.precio)), 0);

    // Contar total de stock bajo sin traer todos los registros
    // Nota: Esto es una query adicional rápida
    const totalStockBajoCount = await prisma.producto.count({
      where: {
        activo: true,
        stock: { lte: prisma.producto.fields.stockMinimo }
      }
    });

    res.json({
      resumen: {
        totalProductos,
        totalCategorias,
        totalProveedores,
        productosConStockBajo: totalStockBajoCount,
        valorizacionInventario: valorizacion,
        valorVentaPotencial: valorVenta,
        margenPotencial: valorVenta - valorizacion
      },
      alertas: {
        stockBajo: productosConStockBajoDB
      },
      ultimosMovimientos,
      productosPorCategoria
    });
  } catch (error) {
    console.error("Error al obtener dashboard:", error);
    res.status(500).json({ error: "Error al obtener dashboard" });
  }
});

export default router;
