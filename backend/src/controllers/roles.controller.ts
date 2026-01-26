import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";

const roleSchema = z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    descripcion: z.string().optional(),
    permisos: z.array(z.number()),
});

export class RolesController {
    getRoles = async (req: Request, res: Response) => {
        try {
            const roles = await prisma.rol.findMany({
                include: {
                    permisos: {
                        include: {
                            permiso: true
                        }
                    },
                    _count: {
                        select: { usuarios: true }
                    }
                },
                orderBy: { id: 'asc' }
            });

            // Aplanar permisos para el frontend
            const formattedRoles = roles.map(rol => ({
                ...rol,
                permisos: rol.permisos.map(p => p.permiso)
            }));

            res.json(formattedRoles);
        } catch (error) {
            console.error("Error al obtener roles:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    };

    createRol = async (req: Request, res: Response) => {
        try {
            const data = roleSchema.parse(req.body);

            // Verificar si ya existe
            const existing = await prisma.rol.findUnique({
                where: { nombre: data.nombre }
            });

            if (existing) {
                return res.status(400).json({ error: "Ya existe un rol con ese nombre" });
            }

            const rol = await prisma.rol.create({
                data: {
                    nombre: data.nombre,
                    descripcion: data.descripcion,
                    permisos: {
                        create: data.permisos.map(permisoId => ({
                            permisoId
                        }))
                    }
                },
                include: {
                    permisos: {
                        include: { permiso: true }
                    }
                }
            });

            const formattedRol = {
                ...rol,
                permisos: rol.permisos.map(p => p.permiso)
            };

            res.status(201).json(formattedRol);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error(error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    };

    updateRol = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const data = roleSchema.parse(req.body);

            // Primero borramos los permisos existentes
            await prisma.rolPermiso.deleteMany({
                where: { rolId: Number(id) }
            });

            // Actualizamos rol y creamos nuevos permisos
            const rol = await prisma.rol.update({
                where: { id: Number(id) },
                data: {
                    nombre: data.nombre,
                    descripcion: data.descripcion,
                    permisos: {
                        create: data.permisos.map(permisoId => ({
                            permisoId
                        }))
                    }
                },
                include: {
                    permisos: { include: { permiso: true } }
                }
            });

            const formattedRol = {
                ...rol,
                permisos: rol.permisos.map(p => p.permiso)
            };

            res.json(formattedRol);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error(error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    };

    deleteRol = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            // Verificar si hay usuarios usándolo
            const usersCount = await prisma.usuario.count({
                where: { rolId: Number(id) }
            });

            if (usersCount > 0) {
                return res.status(400).json({ error: "No se puede eliminar un rol que tiene usuarios asignados" });
            }

            // Verificar si es ADMIN
            const rol = await prisma.rol.findUnique({ where: { id: Number(id) } });
            if (rol?.nombre === "ADMIN") {
                return res.status(400).json({ error: "No se puede eliminar el rol de Administrador" });
            }

            // Eliminar relaciones primero
            await prisma.rolPermiso.deleteMany({
                where: { rolId: Number(id) }
            });

            await prisma.rol.delete({
                where: { id: Number(id) }
            });

            res.json({ message: "Rol eliminado correctamente" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    };
}
