import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/dashboard - Estadísticas del inventario
router.get("/", async (req, res) => {
  try {
    // Total de productos
    const totalProductos = await prisma.producto.count({
      where: { activo: true }
    });
    
    // Total de categorías
    const totalCategorias = await prisma.categoria.count();
    
    // Total de proveedores
    const totalProveedores = await prisma.proveedor.count({
      where: { activo: true }
    });
    
    // Productos con stock bajo
    const productosStockBajo = await prisma.producto.findMany({
      where: {
        activo: true,
        stock: {
          lte: prisma.producto.fields.stockMinimo
        }
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        stock: true,
        stockMinimo: true,
        categoria: { select: { nombre: true } }
      },
      orderBy: { stock: "asc" }
    });
    
    // Filtrar manualmente ya que Prisma no soporta comparar campos directamente
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        stock: true,
        stockMinimo: true,
        precio: true,
        costo: true,
        categoria: { select: { nombre: true } }
      }
    });
    
    const productosConStockBajo = productos.filter(p => p.stock <= p.stockMinimo);
    
    // Valorización del inventario (stock * costo)
    const valorizacion = productos.reduce((acc, p) => {
      return acc + (p.stock * Number(p.costo));
    }, 0);
    
    // Valor de venta potencial (stock * precio)
    const valorVenta = productos.reduce((acc, p) => {
      return acc + (p.stock * Number(p.precio));
    }, 0);
    
    // Últimos movimientos
    const ultimosMovimientos = await prisma.movimiento.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        producto: {
          select: { codigo: true, nombre: true }
        }
      }
    });
    
    // Productos por categoría
    const productosPorCategoria = await prisma.categoria.findMany({
      select: {
        id: true,
        nombre: true,
        _count: {
          select: { productos: true }
        }
      },
      orderBy: { nombre: "asc" }
    });
    
    res.json({
      resumen: {
        totalProductos,
        totalCategorias,
        totalProveedores,
        productosConStockBajo: productosConStockBajo.length,
        valorizacionInventario: valorizacion,
        valorVentaPotencial: valorVenta,
        margenPotencial: valorVenta - valorizacion
      },
      alertas: {
        stockBajo: productosConStockBajo.slice(0, 10)
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
