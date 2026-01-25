import { prisma } from "../lib/prisma.js";

export class CategoriaService {
    async listar() {
        return await prisma.categoria.findMany({
            include: {
                _count: {
                    select: { productos: true }
                }
            },
            orderBy: { nombre: "asc" }
        });
    }

    async obtenerPorId(id: number) {
        return await prisma.categoria.findUnique({
            where: { id },
            include: { productos: true }
        });
    }

    async crear(data: { nombre: string; descripcion?: string; imagenUrl?: string }) {
        return await prisma.categoria.create({
            data
        });
    }

    async actualizar(id: number, data: { nombre?: string; descripcion?: string; imagenUrl?: string }) {
        return await prisma.categoria.update({
            where: { id },
            data
        });
    }

    async eliminar(id: number) {
        return await prisma.categoria.delete({
            where: { id }
        });
    }
}
