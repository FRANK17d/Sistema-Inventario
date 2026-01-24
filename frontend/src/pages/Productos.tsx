import { useEffect, useState } from 'react';
import { Header } from '../components/Layout';
import { productosApi, categoriasApi, proveedoresApi, formatSoles } from '../services/api';

interface Producto {
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
    activo: boolean;
    categoria?: { nombre: string };
    proveedor?: { nombre: string };
}

interface Categoria {
    id: number;
    nombre: string;
}

interface Proveedor {
    id: number;
    nombre: string;
}

export default function Productos() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [buscar, setBuscar] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        precio: '',
        costo: '',
        stock: '0',
        stockMinimo: '5',
        categoriaId: '',
        proveedorId: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes, provRes] = await Promise.all([
                productosApi.getAll(),
                categoriasApi.getAll(),
                proveedoresApi.getAll(),
            ]);
            setProductos(prodRes.data);
            setCategorias(catRes.data);
            setProveedores(provRes.data);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProductos = productos.filter(p => {
        const matchBuscar = !buscar ||
            p.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
            p.codigo.toLowerCase().includes(buscar.toLowerCase());
        const matchCategoria = !filtroCategoria || p.categoriaId === parseInt(filtroCategoria);
        return matchBuscar && matchCategoria;
    });

    const openModal = (producto?: Producto) => {
        if (producto) {
            setEditingProducto(producto);
            setFormData({
                codigo: producto.codigo,
                nombre: producto.nombre,
                descripcion: producto.descripcion || '',
                precio: producto.precio.toString(),
                costo: producto.costo.toString(),
                stock: producto.stock.toString(),
                stockMinimo: producto.stockMinimo.toString(),
                categoriaId: producto.categoriaId.toString(),
                proveedorId: producto.proveedorId?.toString() || '',
            });
        } else {
            setEditingProducto(null);
            setFormData({
                codigo: '',
                nombre: '',
                descripcion: '',
                precio: '',
                costo: '',
                stock: '0',
                stockMinimo: '5',
                categoriaId: categorias[0]?.id.toString() || '',
                proveedorId: '',
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = {
                codigo: formData.codigo,
                nombre: formData.nombre,
                descripcion: formData.descripcion || undefined,
                precio: parseFloat(formData.precio),
                costo: parseFloat(formData.costo),
                stock: parseInt(formData.stock),
                stockMinimo: parseInt(formData.stockMinimo),
                categoriaId: parseInt(formData.categoriaId),
                proveedorId: formData.proveedorId ? parseInt(formData.proveedorId) : undefined,
            };

            if (editingProducto) {
                await productosApi.update(editingProducto.id, data);
            } else {
                await productosApi.create(data);
            }

            setShowModal(false);
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este producto?')) return;
        try {
            await productosApi.delete(id);
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al eliminar');
        }
    };

    return (
        <div>
            <Header
                title="Productos"
                subtitle={`${filteredProductos.length} productos`}
                actions={
                    <button onClick={() => openModal()} className="btn btn-primary">
                        + Nuevo Producto
                    </button>
                }
            />

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        className="input flex-1 min-w-[200px]"
                    />
                    <select
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                        className="input w-auto"
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden p-0">
                {loading ? (
                    <div className="p-8 text-center text-[#94A3B8]">Cargando...</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Costo</th>
                                <th>Stock</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProductos.map((p) => (
                                <tr key={p.id}>
                                    <td className="font-mono text-sm">{p.codigo}</td>
                                    <td>
                                        <div>
                                            <p className="font-medium text-white">{p.nombre}</p>
                                            {p.proveedor && (
                                                <p className="text-xs text-[#94A3B8]">{p.proveedor.nombre}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td>{p.categoria?.nombre}</td>
                                    <td className="text-[#10B981]">{formatSoles(Number(p.precio))}</td>
                                    <td className="text-[#94A3B8]">{formatSoles(Number(p.costo))}</td>
                                    <td>
                                        <span className={`font-semibold ${p.stock <= p.stockMinimo ? 'text-yellow-400' : 'text-white'
                                            }`}>
                                            {p.stock}
                                        </span>
                                        <span className="text-[#94A3B8] text-xs"> / {p.stockMinimo}</span>
                                    </td>
                                    <td>
                                        {p.stock <= p.stockMinimo ? (
                                            <span className="badge badge-warning">Stock Bajo</span>
                                        ) : (
                                            <span className="badge badge-success">Normal</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openModal(p)}
                                                className="btn btn-secondary text-xs py-1 px-2"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="btn btn-danger text-xs py-1 px-2"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProductos.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center text-[#94A3B8] py-8">
                                        No se encontraron productos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-[#475569]">
                            <h2 className="text-xl font-bold text-white">
                                {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#94A3B8] mb-1">Código *</label>
                                    <input
                                        type="text"
                                        value={formData.codigo}
                                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#94A3B8] mb-1">Nombre *</label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-[#94A3B8] mb-1">Descripción</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="input"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#94A3B8] mb-1">Precio (S/) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.precio}
                                        onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#94A3B8] mb-1">Costo (S/) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.costo}
                                        onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#94A3B8] mb-1">Stock Inicial</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#94A3B8] mb-1">Stock Mínimo</label>
                                    <input
                                        type="number"
                                        value={formData.stockMinimo}
                                        onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#94A3B8] mb-1">Categoría *</label>
                                    <select
                                        value={formData.categoriaId}
                                        onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                                        className="input"
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        {categorias.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-[#94A3B8] mb-1">Proveedor</label>
                                    <select
                                        value={formData.proveedorId}
                                        onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}
                                        className="input"
                                    >
                                        <option value="">Sin proveedor</option>
                                        {proveedores.map(prov => (
                                            <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn btn-primary"
                                >
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
