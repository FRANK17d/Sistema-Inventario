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
    const email = "admin3@abasto.com";
    const password = "admin1238";
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.usuario.upsert({
        where: { email },
        update: {},
        create: {
            nombre: "Administrador",
            email,
            password: hashedPassword,
            rol: "ADMIN",
        },
    });

    const almaceneroEmail = "almacenero@abasto.com";
    const almaceneroPassword = "almacen123";
    const hashedAlmaceneroPassword = await bcrypt.hash(almaceneroPassword, 10);

    const almacenero = await prisma.usuario.upsert({
        where: { email: almaceneroEmail },
        update: {},
        create: {
            nombre: "Almacenero Jefe",
            email: almaceneroEmail,
            password: hashedAlmaceneroPassword,
            rol: "ALMACENERO",
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
