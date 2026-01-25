import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("El email no es válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registroSchema = z.object({
    nombre: z.string().min(2, "El nombre es muy corto"),
    email: z.string().email("El email no es válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    rol: z.enum(["ADMIN", "ALMACENERO"]).optional(),
});
