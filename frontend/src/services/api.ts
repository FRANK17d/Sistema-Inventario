import axios from 'axios';

const API_URL = 'http://localhost:3030/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ==================== CATEGORÍAS ====================
export const categoriasApi = {
    getAll: () => api.get('/categorias'),
    getById: (id: number) => api.get(`/categorias/${id}`),
    create: (data: { nombre: string; descripcion?: string }) =>
        api.post('/categorias', data),
    update: (id: number, data: { nombre?: string; descripcion?: string }) =>
        api.put(`/categorias/${id}`, data),
    delete: (id: number) => api.delete(`/categorias/${id}`),
};

// ==================== PROVEEDORES ====================
export const proveedoresApi = {
    getAll: () => api.get('/proveedores'),
    getById: (id: number) => api.get(`/proveedores/${id}`),
    create: (data: {
        nombre: string;
        contacto?: string;
        telefono?: string;
        email?: string;
        direccion?: string
    }) => api.post('/proveedores', data),
    update: (id: number, data: any) => api.put(`/proveedores/${id}`, data),
    delete: (id: number) => api.delete(`/proveedores/${id}`),
};

// ==================== PRODUCTOS ====================
export interface ProductoInput {
    codigo: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    costo: number;
    stock?: number;
    stockMinimo?: number;
    categoriaId: number;
    proveedorId?: number;
}

export const productosApi = {
    getAll: (params?: { categoriaId?: number; buscar?: string; stockBajo?: boolean }) =>
        api.get('/productos', { params }),
    getById: (id: number) => api.get(`/productos/${id}`),
    create: (data: ProductoInput) => api.post('/productos', data),
    update: (id: number, data: Partial<ProductoInput>) =>
        api.put(`/productos/${id}`, data),
    delete: (id: number) => api.delete(`/productos/${id}`),
};

// ==================== MOVIMIENTOS ====================
export interface MovimientoInput {
    productoId: number;
    tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    cantidad: number;
    descripcion?: string;
}

export const movimientosApi = {
    getAll: (params?: { productoId?: number; tipo?: string; limit?: number }) =>
        api.get('/movimientos', { params }),
    create: (data: MovimientoInput) => api.post('/movimientos', data),
    getKardex: (productoId: number) => api.get(`/movimientos/producto/${productoId}`),
};

// ==================== DASHBOARD ====================
export const dashboardApi = {
    get: () => api.get('/dashboard'),
};

// ==================== UTILIDADES ====================
// Formatear moneda peruana
export const formatSoles = (amount: number): string => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(amount);
};

// Formatear fecha peruana
export const formatFecha = (date: string | Date): string => {
    return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(date));
};

// Formatear fecha y hora peruana
export const formatFechaHora = (date: string | Date): string => {
    return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
};

export default api;
