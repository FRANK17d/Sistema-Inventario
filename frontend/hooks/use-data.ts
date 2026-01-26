import useSWR from 'swr'
import * as api from '@/lib/api'
import type { DashboardData, Producto, Categoria, Proveedor, Movimiento, Rol, Permiso, Usuario } from '@/lib/api'
import {
    getDashboard,
    getProductos,
    getCategorias,
    getProveedores,
    getMovimientos
} from '@/lib/api'

// Dashboard hook con polling cada 30s
export function useDashboard() {
    return useSWR<DashboardData>('/dashboard', api.getDashboard, {
        refreshInterval: 30000, // 30 segundos
        revalidateOnFocus: true,
        dedupingInterval: 5000,
    })
}

export function useProductos() {
    const { data, error, mutate } = useSWR("/productos", api.getProductos);
    return {
        productos: data,
        isLoading: !error && !data,
        isError: error,
        mutate,
    };
}

export function useRoles() {
    const { data, error, mutate } = useSWR<Rol[]>("/roles", api.getRoles);
    return {
        roles: data,
        isLoading: !error && !data,
        isError: error,
        mutate,
    };
}

export function usePermisos() {
    const { data, error, mutate } = useSWR<Permiso[]>("/permisos", api.getPermisos);
    return {
        permisos: data,
        isLoading: !error && !data,
        isError: error,
        mutate,
    };
}

export function useUsuarios() {
    const { data, error, mutate } = useSWR<Usuario[]>("/usuarios", api.getUsuarios);
    return {
        usuarios: data,
        isLoading: !error && !data,
        isError: error,
        mutate,
    };
}

// Categorías hook
export function useCategorias() {
    return useSWR<Categoria[]>('/categorias', api.getCategorias, {
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
