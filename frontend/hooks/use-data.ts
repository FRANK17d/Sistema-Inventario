import useSWR from 'swr'
import type { DashboardData, Producto, Categoria, Proveedor, Movimiento } from '@/lib/api'
import {
    getDashboard,
    getProductos,
    getCategorias,
    getProveedores,
    getMovimientos
} from '@/lib/api'

// Dashboard hook con polling cada 30s
export function useDashboard() {
    return useSWR<DashboardData>('/dashboard', getDashboard, {
        refreshInterval: 30000, // 30 segundos
        revalidateOnFocus: true,
        dedupingInterval: 5000,
    })
}

// Productos hook
export function useProductos() {
    return useSWR<Producto[]>('/productos', getProductos, {
        revalidateOnFocus: true,
    })
}

// Categorías hook
export function useCategorias() {
    return useSWR<Categoria[]>('/categorias', getCategorias, {
        revalidateOnFocus: true,
    })
}

// Proveedores hook
export function useProveedores() {
    return useSWR<Proveedor[]>('/proveedores', getProveedores, {
        revalidateOnFocus: true,
    })
}

// Movimientos hook con polling más agresivo
export function useMovimientos() {
    return useSWR<Movimiento[]>('/movimientos', getMovimientos, {
        refreshInterval: 60000, // 1 minuto
        revalidateOnFocus: true,
    })
}

// Hook genérico para datos que rara vez cambian
export function useStaticData<T>(key: string, fetcher: () => Promise<T>) {
    return useSWR<T>(key, fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 60000, // 1 minuto
    })
}
