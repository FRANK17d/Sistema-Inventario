import { prisma } from "../lib/prisma.js";

export class ProveedorService {
    async listar() {
        return await prisma.proveedor.findMany({
            include: {
                _count: {
                    select: { productos: true }
                }
            },
            orderBy: { nombre: "asc" }
        });
    }

    async obtenerPorId(id: number) {
        return await prisma.proveedor.findUnique({
            where: { id },
            include: { productos: true }
        });
    }

    async crear(data: { nombre: string; contacto?: string; telefono?: string; email?: string; direccion?: string }) {
        return await prisma.proveedor.create({
            data
        });
    }

    async actualizar(id: number, data: { nombre?: string; contacto?: string; telefono?: string; email?: string; direccion?: string; activo?: boolean }) {
        return await prisma.proveedor.update({
            where: { id },
            data
        });
    }

    async eliminar(id: number) {
        return await prisma.proveedor.delete({
            where: { id }
        });
    }
}
