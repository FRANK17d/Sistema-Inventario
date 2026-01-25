import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";

const router = Router();

// GET /api/dashboard - Estadísticas del inventario
router.get("/", async (req, res) => {
  try {
    // Queries paralelas optimizadas
    const [
      totalProductos,
      totalCategorias,
      totalProveedores,
      productosConStockBajoDB,
      ultimosMovimientos,
      productosPorCategoria,
      historialReciente,
      finanzas // Query raw optimizada
    ] = await Promise.all([
      // 1. Total productos activos
      prisma.producto.count({ where: { activo: true } }),

      // 2. Total categorías
      prisma.categoria.count(),

      // 3. Total proveedores activos
      prisma.proveedor.count({ where: { activo: true } }),

      // 4. Productos con stock bajo (Top 10 para UI)
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
        take: 10
      }),

      // 5. Últimos movimientos
      prisma.movimiento.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          producto: {
            select: { codigo: true, nombre: true }
          }
        }
      }),

      // 6. Productos por categoría
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
      }),

      // 7. Historial (30 días)
      prisma.historial.findMany({
        take: 30,
        orderBy: { fecha: "asc" }
      }),

      // 8. Cálculo financiero en DB (Mucho más rápido que traer todos los registros)
      prisma.$queryRaw`
        SELECT 
          SUM(stock * costo) as valorizacion,
          SUM(stock * precio) as "valorVenta"
        FROM "Producto"
        WHERE "activo" = true
      `
    ]);

    // Procesar resultados de la query raw
    // Nota: Prisma devuelve array de objetos, y los números pueden venir como BigInt o Decimal
    const finanzasData = (finanzas as any[])[0] || {};
    const valorizacion = Number(finanzasData.valorizacion || 0);
    const valorVenta = Number(finanzasData.valorVenta || 0);

    // Conteo rápido de stock bajo total
    const totalStockBajoCount = await prisma.producto.count({
      where: {
        activo: true,
        stock: { lte: prisma.producto.fields.stockMinimo }
      }
    });

    const rentabilidad = valorizacion > 0 ? ((valorVenta - valorizacion) / valorizacion) * 100 : 0;

    // LÓGICA DE SNAPSHOT DIARIO
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Verificar si ya tenemos el dato de hoy en lo que trajimos
    const historialHoy = historialReciente.find((h) => {
      const hFecha = new Date(h.fecha);
      hFecha.setHours(0, 0, 0, 0);
      return hFecha.getTime() === hoy.getTime();
    });

    if (!historialHoy) {
      // Registrar snapshot
      // Usamos catch para evitar errores si concurrencia intenta insertar doble
      prisma.historial.upsert({
        where: { fecha: hoy },
        update: {
          // Si ya existe (ej. re-run en mismo día), actualizamos metrícas por si cambiaron
          totalProductos,
          stockBajo: totalStockBajoCount,
          valorizacion: new Prisma.Decimal(valorizacion),
          valorVenta: new Prisma.Decimal(valorVenta),
          rentabilidad: new Prisma.Decimal(rentabilidad)
        },
        create: {
          fecha: hoy,
          totalProductos,
          stockBajo: totalStockBajoCount,
          valorizacion: new Prisma.Decimal(valorizacion),
          valorVenta: new Prisma.Decimal(valorVenta),
          rentabilidad: new Prisma.Decimal(rentabilidad)
        }
      }).catch(err => console.error("Error actualizando historial diario:", err));

      // No agregamos manualmente al array de respuesta para mantener consistencia, 
      // el next polling lo traerá, o el cliente mostrará los datos realtime del 'resumen'.
    }

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
      productosPorCategoria,
      historial: historialReciente
    });
  } catch (error) {
    console.error("Error al obtener dashboard:", error);
    res.status(500).json({ error: "Error al obtener dashboard" });
  }
});

export default router;
