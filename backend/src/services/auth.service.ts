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
        });

        if (!usuario) {
            throw new Error("Credenciales inválidas");
        }

        const passwordMatch = await bcrypt.compare(data.password, usuario.password);

        if (!passwordMatch) {
            throw new Error("Credenciales inválidas");
        }

        // Generar Token JWT
        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol,
            },
            JWT_SECRET,
            { expiresIn: "8h" } // Duración de la sesión
        );

        return {
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
            },
        };
    }
}
