import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createUserSchema = z.object({
    nombre: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    rolId: z.number().int().positive()
});

const updateUserSchema = z.object({
    nombre: z.string().min(2),
    email: z.string().email(),
    password: z.string().optional(),
    rolId: z.number().int().positive()
});

export class UsuariosController {
    getUsuarios = async (req: Request, res: Response) => {
        try {
            const usuarios = await prisma.usuario.findMany({
                select: {
                    id: true,
                    nombre: true,
                    email: true,
                    rolId: true,
                    createdAt: true,
                    updatedAt: true,
                    rol: {
                        select: { nombre: true }
                    }
                },
                orderBy: { id: 'asc' }
            });
            res.json(usuarios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    };

    createUsuario = async (req: Request, res: Response) => {
        try {
            const data = createUserSchema.parse(req.body);

            // Verificar email
            const existing = await prisma.usuario.findUnique({
                where: { email: data.email }
            });

            if (existing) {
                return res.status(400).json({ error: "El email ya está registrado" });
            }

            const hashedPassword = await bcrypt.hash(data.password, 10);

            const usuario = await prisma.usuario.create({
                data: {
                    nombre: data.nombre,
                    email: data.email,
                    password: hashedPassword,
                    rolId: data.rolId
                }
            });

            const { password, ...userWithoutPassword } = usuario;
            res.status(201).json(userWithoutPassword);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error(error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    };

    updateUsuario = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const data = updateUserSchema.parse(req.body);

            const updateData: any = {
                nombre: data.nombre,
                email: data.email,
                rolId: data.rolId
            };

            if (data.password) {
                updateData.password = await bcrypt.hash(data.password, 10);
            }

            const usuario = await prisma.usuario.update({
                where: { id: Number(id) },
                data: updateData
            });

            const { password, ...userWithoutPassword } = usuario;
            res.json(userWithoutPassword);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error(error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    };

    deleteUsuario = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            // No permitir auto-eliminación
            if (req.user?.id === Number(id)) {
                return res.status(400).json({ error: "No puedes eliminar tu propio usuario" });
            }

            await prisma.usuario.delete({
                where: { id: Number(id) }
            });

            res.json({ message: "Usuario eliminado" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    };
}
