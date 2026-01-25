import { prisma } from "../lib/prisma.js";

export class ProductoService {
    async listar(filtros: {
        categoriaId?: number;
        proveedorId?: number;
        activo?: boolean;
        buscar?: string;
        stockBajo?: boolean;
    }) {
        const where: any = {};

        if (filtros.categoriaId) where.categoriaId = filtros.categoriaId;
        if (filtros.proveedorId) where.proveedorId = filtros.proveedorId;
        if (filtros.activo !== undefined) where.activo = filtros.activo;
        if (filtros.buscar) {
            where.OR = [
                { nombre: { contains: filtros.buscar, mode: "insensitive" } },
                { codigo: { contains: filtros.buscar, mode: "insensitive" } },
                { descripcion: { contains: filtros.buscar, mode: "insensitive" } }
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
        // Nota: Esto estaba así en el original, filtrando en memoria después de la query
        if (filtros.stockBajo) {
            productos = productos.filter((p: any) => p.stock <= p.stockMinimo);
        }

        return productos;
    }

    async obtenerPorId(id: number) {
        return await prisma.producto.findUnique({
            where: { id },
            include: {
                categoria: true,
                proveedor: true,
                movimientos: {
                    orderBy: { createdAt: "desc" },
                    take: 10
                }
            }
        });
    }

    async crear(data: {
        codigo: string;
        nombre: string;
        descripcion?: string;
        precio: any;
        costo: any;
        stock: number;
        stockMinimo: number;
        categoriaId: number;
        proveedorId?: number;
        imagenUrl?: string;
    }) {
        return await prisma.producto.create({
            data: {
                codigo: data.codigo,
                nombre: data.nombre,
                descripcion: data.descripcion,
                precio: data.precio,
                costo: data.costo,
                stock: data.stock,
                stockMinimo: data.stockMinimo,
                categoriaId: data.categoriaId,
                proveedorId: data.proveedorId,
                imagenUrl: data.imagenUrl
            },
            include: {
                categoria: true,
                proveedor: true
            }
        });
    }

    async actualizar(id: number, data: {
        codigo?: string;
        nombre?: string;
        descripcion?: string;
        precio?: any;
        costo?: any;
        stockMinimo?: number;
        categoriaId?: number;
        proveedorId?: number;
        activo?: boolean;
        imagenUrl?: string;
    }) {
        return await prisma.producto.update({
            where: { id },
            data,
            include: {
                categoria: true,
                proveedor: true
            }
        });
    }

    async eliminar(id: number) {
        // Primero eliminar movimientos relacionados
        await prisma.movimiento.deleteMany({
            where: { productoId: id }
        });

        // Luego eliminar el producto
        return await prisma.producto.delete({
            where: { id }
        });
    }
}
