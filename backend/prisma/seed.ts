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

    // 4. Crear Categorías
    console.log("Creando categorías...");
    const categorias = [
        { nombre: "Electrónica", descripcion: "Dispositivos electrónicos y gadgets" },
        { nombre: "Ropa", descripcion: "Indumentaria para todas las edades" },
        { nombre: "Hogar", descripcion: "Artículos para el hogar y decoración" },
    ];

    const categoriasMap = new Map();
    for (const cat of categorias) {
        const categoria = await prisma.categoria.upsert({
            where: { nombre: cat.nombre },
            update: {},
            create: cat,
        });
        categoriasMap.set(cat.nombre, categoria.id);
    }

    // 5. Crear Proveedores
    console.log("Creando proveedores...");
    const proveedores = [
        { nombre: "TechDistro SA", email: "contacto@techdistro.com", telefono: "123456789" },
        { nombre: "ModaGlobal Inc", email: "ventas@modaglobal.com", telefono: "987654321" },
    ];

    const proveedoresMap = new Map();
    for (const prov of proveedores) {
        const proveedor = await prisma.proveedor.upsert({
            where: { id: -1 }, // Hack simple porque nombre no es unique en schema, ajusta si es necesario o usa findFirst
            update: {},
            create: prov,
        });
        // Como 'nombre' no es unique en el schema actual (ver schema.prisma), upsert por nombre no es directo.
        // Pero para simplificar el seed y evitar errores, usaremos create si no hay proveedores.
        // O mejor: buscamos primero.
    }

    // CORRECCIÓN: Upsert requiere unique field en where. Proveedor no tiene nombre unique.
    // Usaremos findFirst para verificar existencia.
    const prov1 = await prisma.proveedor.findFirst({ where: { nombre: "TechDistro SA" } });
    let p1Id;
    if (!prov1) {
        const p = await prisma.proveedor.create({ data: { nombre: "TechDistro SA", email: "contacto@techdistro.com" } });
        p1Id = p.id;
    } else { p1Id = prov1.id; }

    const prov2 = await prisma.proveedor.findFirst({ where: { nombre: "ModaGlobal Inc" } });
    let p2Id;
    if (!prov2) {
        const p = await prisma.proveedor.create({ data: { nombre: "ModaGlobal Inc", email: "ventas@modaglobal.com" } });
        p2Id = p.id;
    } else { p2Id = prov2.id; }


    // 6. Crear Productos
    console.log("Creando productos...");
    const productos = [
        {
            codigo: "ELEC-001",
            nombre: "Smartphone X",
            precio: 599.99,
            costo: 300.00,
            stock: 50,
            categoriaId: categoriasMap.get("Electrónica"),
            proveedorId: p1Id
        },
        {
            codigo: "ELEC-002",
            nombre: "Laptop Pro",
            precio: 1299.99,
            costo: 800.00,
            stock: 20,
            categoriaId: categoriasMap.get("Electrónica"),
            proveedorId: p1Id
        },
        {
            codigo: "ROPA-001",
            nombre: "Camiseta Básica",
            precio: 19.99,
            costo: 5.00,
            stock: 200,
            categoriaId: categoriasMap.get("Ropa"),
            proveedorId: p2Id
        },
    ];

    for (const prod of productos) {
        if (prod.categoriaId && prod.proveedorId) {
            await prisma.producto.upsert({
                where: { codigo: prod.codigo },
                update: {},
                create: prod,
            });
        }
    }

    console.log("Datos de inventario cargados exitosamente.");
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
