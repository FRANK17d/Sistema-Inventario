import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // 1. Crear Permisos Base
    const permisosNombres = [
        // Dashboard
        "DASHBOARD_VER",

        // Usuarios
        "USUARIO_VER", "USUARIO_CREAR", "USUARIO_EDITAR", "USUARIO_ELIMINAR",

        // Roles
        "ROL_VER", "ROL_CREAR", "ROL_EDITAR", "ROL_ELIMINAR",

        // Productos
        "PRODUCTO_VER", "PRODUCTO_CREAR", "PRODUCTO_EDITAR", "PRODUCTO_ELIMINAR",

        // Categorías
        "CATEGORIA_VER", "CATEGORIA_CREAR", "CATEGORIA_EDITAR", "CATEGORIA_ELIMINAR",

        // Proveedores
        "PROVEEDOR_VER", "PROVEEDOR_CREAR", "PROVEEDOR_EDITAR", "PROVEEDOR_ELIMINAR",

        // Movimientos
        "MOVIMIENTO_VER", "MOVIMIENTO_CREAR",
    ];

    console.log("Creando permisos...");
    const permisosMap = new Map();
    for (const nombre of permisosNombres) {
        const permiso = await prisma.permiso.upsert({
            where: { nombre },
            update: {},
            create: { nombre, descripcion: `Permiso para ${nombre}` },
        });
        permisosMap.set(nombre, permiso.id);
    }

    // 2. Crear Roles
    console.log("Creando roles...");

    // Rol ADMIN (Todos los permisos)
    const adminRol = await prisma.rol.upsert({
        where: { nombre: "ADMIN" },
        update: {},
        create: { nombre: "ADMIN", descripcion: "Administrador del sistema con acceso total" },
    });

    // Asignar todos los permisos a ADMIN
    for (const [nombre, id] of permisosMap) {
        await prisma.rolPermiso.upsert({
            where: { rolId_permisoId: { rolId: adminRol.id, permisoId: id } },
            update: {},
            create: { rolId: adminRol.id, permisoId: id },
        });
    }

    // Rol ALMACENERO (Solo Inventario)
    const almacenRol = await prisma.rol.upsert({
        where: { nombre: "ALMACENERO" },
        update: {},
        create: { nombre: "ALMACENERO", descripcion: "Encargado de gestión de inventario" },
    });

    const permisosAlmacenero = [
        "DASHBOARD_VER",
        "PRODUCTO_VER", "PRODUCTO_CREAR", "PRODUCTO_EDITAR", // No eliminar
        "CATEGORIA_VER", "CATEGORIA_CREAR",
        "PROVEEDOR_VER", "PROVEEDOR_CREAR",
        "MOVIMIENTO_VER", "MOVIMIENTO_CREAR"
    ];

    for (const nombre of permisosAlmacenero) {
        const id = permisosMap.get(nombre);
        if (id) {
            await prisma.rolPermiso.upsert({
                where: { rolId_permisoId: { rolId: almacenRol.id, permisoId: id } },
                update: {},
                create: { rolId: almacenRol.id, permisoId: id },
            });
        }
    }

    // 3. Crear Usuarios
    console.log("Creando usuarios...");
    const email = "admin3@abasto.com";
    const password = "admin1238";
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.usuario.upsert({
        where: { email },
        update: { rolId: adminRol.id }, // Actualizar rol si existe
        create: {
            nombre: "Administrador",
            email,
            password: hashedPassword,
            rolId: adminRol.id,
        },
    });

    const almaceneroEmail = "almacenero@abasto.com";
    const almaceneroPassword = "almacen123";
    const hashedAlmaceneroPassword = await bcrypt.hash(almaceneroPassword, 10);

    const almacenero = await prisma.usuario.upsert({
        where: { email: almaceneroEmail },
        update: { rolId: almacenRol.id },
        create: {
            nombre: "Almacenero Jefe",
            email: almaceneroEmail,
            password: hashedAlmaceneroPassword,
            rolId: almacenRol.id,
        },
    });

    console.log({ admin, almacenero });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        throw e;
    });
