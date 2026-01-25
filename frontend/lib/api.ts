// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Types based on backend Prisma schema
export interface Categoria {
    id: number;
    nombre: string;
    descripcion?: string;
    imagenUrl?: string;
    createdAt: string;
    updatedAt: string;
    _count?: { productos: number };
}

export interface Proveedor {
    id: number;
    nombre: string;
    contacto?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: { productos: number };
}

export interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    costo: number;
    stock: number;
    stockMinimo: number;
    categoriaId: number;
    proveedorId?: number;
    imagenUrl?: string;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
    categoria?: Categoria;
    proveedor?: Proveedor;
}

export interface Movimiento {
    id: number;
    tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    cantidad: number;
    productoId: number;
    descripcion?: string;
    createdAt: string;
    producto?: {
        id: number;
        codigo: string;
        nombre: string;
    };
}

export interface Historial {
    id: number;
    fecha: string;
    totalProductos: number;
    stockBajo: number;
    valorizacion: string;
    valorVenta: string;
    rentabilidad: string;
}

export interface DashboardData {
    resumen: {
        totalProductos: number;
        totalCategorias: number;
        totalProveedores: number;
        productosConStockBajo: number;
        valorizacionInventario: number;
        valorVentaPotencial: number;
        margenPotencial: number;
    };
    alertas: {
        stockBajo: Array<{
            id: number;
            codigo: string;
            nombre: string;
            stock: number;
            stockMinimo: number;
            categoria: { nombre: string };
        }>;
    };
    ultimosMovimientos: Movimiento[];
    productosPorCategoria: Array<{
        id: number;
        nombre: string;
        imagenUrl?: string;
        _count: { productos: number };
    }>;
    historial?: Historial[];
}

// Input types for create/update
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
    imagenUrl?: string;
    activo?: boolean;
}

export interface CategoriaInput {
    nombre: string;
    descripcion?: string;
    imagenUrl?: string;
}

export interface ProveedorInput {
    nombre: string;
    contacto?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    activo?: boolean;
}

export interface MovimientoInput {
    productoId: number;
    tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    cantidad: number;
    descripcion?: string;
}

// ==================== AUTH ====================
export interface User {
    id: number;
    nombre: string;
    email: string;
    rol: "ADMIN" | "ALMACENERO";
}

export interface LoginResponse {
    token: string;
    usuario: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

// API Functions
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers),
        },
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    return fetchApi<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

export async function verifyAuth(token: string): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/auth/me', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

// Dashboard
export async function getDashboard(): Promise<DashboardData> {
    return fetchApi<DashboardData>('/dashboard');
}

// ==================== PRODUCTOS ====================
export async function getProductos(): Promise<Producto[]> {
    return fetchApi<Producto[]>('/productos');
}

export async function getProducto(id: number): Promise<Producto> {
    return fetchApi<Producto>(`/productos/${id}`);
}

export async function createProducto(data: ProductoInput): Promise<Producto> {
    return fetchApi<Producto>('/productos', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateProducto(id: number, data: Partial<ProductoInput>): Promise<Producto> {
    return fetchApi<Producto>(`/productos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteProducto(id: number): Promise<void> {
    await fetchApi<{ message: string }>(`/productos/${id}`, {
        method: 'DELETE',
    });
}

// ==================== CATEGORIAS ====================
export async function getCategorias(): Promise<Categoria[]> {
    return fetchApi<Categoria[]>('/categorias');
}

export async function getCategoria(id: number): Promise<Categoria> {
    return fetchApi<Categoria>(`/categorias/${id}`);
}

export async function createCategoria(data: CategoriaInput): Promise<Categoria> {
    return fetchApi<Categoria>('/categorias', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateCategoria(id: number, data: Partial<CategoriaInput>): Promise<Categoria> {
    return fetchApi<Categoria>(`/categorias/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteCategoria(id: number): Promise<void> {
    await fetchApi<{ message: string }>(`/categorias/${id}`, {
        method: 'DELETE',
    });
}

// ==================== PROVEEDORES ====================
export async function getProveedores(): Promise<Proveedor[]> {
    return fetchApi<Proveedor[]>('/proveedores');
}

export async function getProveedor(id: number): Promise<Proveedor> {
    return fetchApi<Proveedor>(`/proveedores/${id}`);
}

export async function createProveedor(data: ProveedorInput): Promise<Proveedor> {
    return fetchApi<Proveedor>('/proveedores', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateProveedor(id: number, data: Partial<ProveedorInput>): Promise<Proveedor> {
    return fetchApi<Proveedor>(`/proveedores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteProveedor(id: number): Promise<void> {
    await fetchApi<{ message: string }>(`/proveedores/${id}`, {
        method: 'DELETE',
    });
}

// ==================== MOVIMIENTOS ====================
export async function getMovimientos(): Promise<Movimiento[]> {
    return fetchApi<Movimiento[]>('/movimientos');
}

export async function createMovimiento(data: MovimientoInput): Promise<Movimiento & { stockAnterior: number; stockNuevo: number }> {
    return fetchApi<Movimiento & { stockAnterior: number; stockNuevo: number }>('/movimientos', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// ==================== UPLOAD ====================
export async function uploadImagen(file: File): Promise<{ url: string; public_id: string }> {
    const formData = new FormData();
    formData.append('imagen', file);

    const res = await fetch(`${API_BASE_URL}/upload/imagen`, {
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header, browser will set it with boundary for multipart/form-data
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error al subir imagen: ${res.status}`);
    }

    return res.json();
}
