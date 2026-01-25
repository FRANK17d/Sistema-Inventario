import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// @ts-ignore
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    const email = "admin@abasto.com";
    const password = "admin123";
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

    console.log({ admin });
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
