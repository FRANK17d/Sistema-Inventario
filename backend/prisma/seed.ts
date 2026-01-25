import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Empezando seed...')

    // Limpiar base de datos
    await prisma.movimiento.deleteMany()
    await prisma.producto.deleteMany()
    await prisma.proveedor.deleteMany()
    await prisma.categoria.deleteMany()

    // 1. Crear Categorías
    const bebidas = await prisma.categoria.create({
        data: { nombre: 'Bebidas', descripcion: 'Gaseosas, aguas, jugos' }
    })
    const snacks = await prisma.categoria.create({
        data: { nombre: 'Snacks', descripcion: 'Papas, galletas, piqueos' }
    })
    const limpieza = await prisma.categoria.create({
        data: { nombre: 'Limpieza', descripcion: 'Detergentes, jabones' }
    })
    const lacteos = await prisma.categoria.create({
        data: { nombre: 'Lácteos', descripcion: 'Leche, yogurt, queso' }
    })

    // 2. Crear Proveedores
    const prov1 = await prisma.proveedor.create({
        data: { nombre: 'Distribuidora Lima', contacto: 'Juan Pérez', telefono: '999888777', email: 'ventas@distlima.com' }
    })
    const prov2 = await prisma.proveedor.create({
        data: { nombre: 'Gloria S.A.', contacto: 'María Lopez', telefono: '5551234' }
    })

    // 3. Crear Productos
    const p1 = await prisma.producto.create({
        data: {
            codigo: 'BEB001',
            nombre: 'Coca Cola 500ml',
            descripcion: 'Gaseosa sabor original',
            precio: 3.50,
            costo: 2.20,
            stock: 10,
            stockMinimo: 24,
            categoriaId: bebidas.id,
            proveedorId: prov1.id
        }
    })

    const p2 = await prisma.producto.create({
        data: {
            codigo: 'SNK001',
            nombre: 'Papas Lays Clásicas',
            descripcion: 'Papas fritas con sal',
            precio: 2.50,
            costo: 1.80,
            stock: 50,
            stockMinimo: 10,
            categoriaId: snacks.id,
            proveedorId: prov1.id
        }
    })

    const p3 = await prisma.producto.create({
        data: {
            codigo: 'LAC001',
            nombre: 'Leche Gloria Azul',
            descripcion: 'Leche evaporada entera',
            precio: 4.80,
            costo: 3.90,
            stock: 5,
            stockMinimo: 10,
            categoriaId: lacteos.id,
            proveedorId: prov2.id
        }
    })

    // 4. Crear Movimientos (Historial)
    // Entrada inicial de Coca Cola
    await prisma.movimiento.create({
        data: {
            tipo: 'ENTRADA',
            cantidad: 50,
            productoId: p1.id,
            descripcion: 'Stock inicial',
            createdAt: new Date('2025-01-01')
        }
    })
    // Venta de Coca Cola
    await prisma.movimiento.create({
        data: {
            tipo: 'SALIDA',
            cantidad: 40,
            productoId: p1.id,
            descripcion: 'Ventas de la semana',
            createdAt: new Date('2025-01-15')
        }
    })

    console.log('✅ Seed completado!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
