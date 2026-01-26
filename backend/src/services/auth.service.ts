import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { loginSchema } from "../schemas/auth.schema.js";

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro_cambiar_en_prod";

export class AuthService {
    async login(data: z.infer<typeof loginSchema>) {
        const usuario = await prisma.usuario.findUnique({
            where: { email: data.email },
            include: {
                rol: {
                    include: {
                        permisos: {
                            include: {
                                permiso: true
                            }
                        }
                    }
                }
            }
        });

        if (!usuario) {
            throw new Error("Credenciales inválidas");
        }

        const passwordMatch = await bcrypt.compare(data.password, usuario.password);

        if (!passwordMatch) {
            throw new Error("Credenciales inválidas");
        }

        // Aplanar permisos
        const permisos = usuario.rol.permisos.map(p => p.permiso.nombre);

        // Generar Token JWT
        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol.nombre,
                permisos
            },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        return {
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol.nombre,
                permisos
            },
        };
    }

    async getProfile(userId: number) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: userId },
            include: {
                rol: {
                    include: {
                        permisos: {
                            include: {
                                permiso: true
                            }
                        }
                    }
                }
            }
        });

        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }

        const permisos = usuario.rol.permisos.map(p => p.permiso.nombre);

        return {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol.nombre,
            permisos
        };
    }   
}
