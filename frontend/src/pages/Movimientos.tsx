import { useEffect, useState } from 'react';
import { Header } from '../components/Layout';
import { movimientosApi, productosApi, formatFechaHora } from '../services/api';

interface Movimiento {
    id: number;
    tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    cantidad: number;
    descripcion?: string;
    createdAt: string;
    producto?: { id: number; codigo: string; nombre: string };
}

interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    stock: number;
}

export default function Movimientos() {
    const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        productoId: '',
        tipo: 'ENTRADA' as 'ENTRADA' | 'SALIDA' | 'AJUSTE',
        cantidad: '',
        descripcion: '',
    });
    const [saving, setSaving] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [movRes, prodRes] = await Promise.all([
                movimientosApi.getAll({ limit: 100 }),
                productosApi.getAll(),
            ]);
            setMovimientos(movRes.data);
            setProductos(prodRes.data);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = () => {
        setFormData({ productoId: '', tipo: 'ENTRADA', cantidad: '', descripcion: '' });
        setSelectedProducto(null);
        setShowModal(true);
    };

    const handleProductoChange = (productoId: string) => {
        setFormData({ ...formData, productoId });
        const producto = productos.find(p => p.id === parseInt(productoId));
        setSelectedProducto(producto || null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await movimientosApi.create({
                productoId: parseInt(formData.productoId),
                tipo: formData.tipo,
                cantidad: parseInt(formData.cantidad),
                descripcion: formData.descripcion || undefined,
            });
            setShowModal(false);
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al registrar movimiento');
        } finally {
            setSaving(false);
        }
    };

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'ENTRADA': return '📥';
            case 'SALIDA': return '📤';
            case 'AJUSTE': return '🔄';
            default: return '📋';
        }
    };

    const getTipoBadgeClass = (tipo: string) => {
        switch (tipo) {
            case 'ENTRADA': return 'badge-success';
            case 'SALIDA': return 'badge-danger';
            case 'AJUSTE': return 'badge-warning';
            default: return '';
        }
    };

    return (
        <div>
            <Header
                title="Movimientos"
                subtitle={`${movimientos.length} movimientos registrados`}
                actions={
                    <button onClick={openModal} className="btn btn-primary">
                        + Nuevo Movimiento
                    </button>
                }
            />

            <div className="card overflow-hidden p-0">
                {loading ? (
                    <div className="p-8 text-center text-[#94A3B8]">Cargando...</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimientos.map((mov) => (
                                <tr key={mov.id}>
                                    <td className="text-sm">{formatFechaHora(mov.createdAt)}</td>
                                    <td>
                                        <span className={`badge ${getTipoBadgeClass(mov.tipo)}`}>
                                            {getTipoIcon(mov.tipo)} {mov.tipo}
                                        </span>
                                    </td>
                                    <td>
                                        <div>
                                            <p className="font-medium text-white">{mov.producto?.nombre}</p>
                                            <p className="text-xs text-[#94A3B8]">{mov.producto?.codigo}</p>
                                        </div>
                                    </td>
                                    <td className={`font-semibold ${mov.tipo === 'ENTRADA' ? 'text-green-400' :
                                            mov.tipo === 'SALIDA' ? 'text-red-400' : 'text-yellow-400'
                                        }`}>
                                        {mov.tipo === 'ENTRADA' ? '+' : mov.tipo === 'SALIDA' ? '-' : ''}{mov.cantidad}
                                    </td>
                                    <td className="text-[#94A3B8] text-sm">{mov.descripcion || '-'}</td>
                                </tr>
                            ))}
                            {movimientos.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center text-[#94A3B8] py-8">
                                        No hay movimientos registrados
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
                            <h2 className="text-xl font-bold text-white">Nuevo Movimiento</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-[#94A3B8] mb-1">Producto *</label>
                                <select
                                    value={formData.productoId}
                                    onChange={(e) => handleProductoChange(e.target.value)}
                                    className="input"
                                    required
                                >
                                    <option value="">Seleccionar producto...</option>
                                    {productos.map(prod => (
                                        <option key={prod.id} value={prod.id}>
                                            {prod.codigo} - {prod.nombre} (Stock: {prod.stock})
                                        </option>
                                    ))}
                                </select>
                                {selectedProducto && (
                                    <p className="text-xs text-[#94A3B8] mt-1">
                                        Stock actual: <span className="font-semibold text-white">{selectedProducto.stock}</span>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-[#94A3B8] mb-1">Tipo de Movimiento *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['ENTRADA', 'SALIDA', 'AJUSTE'] as const).map((tipo) => (
                                        <button
                                            key={tipo}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, tipo })}
                                            className={`p-3 rounded-lg border text-center transition-all ${formData.tipo === tipo
                                                    ? tipo === 'ENTRADA' ? 'bg-green-900/50 border-green-500 text-green-400'
                                                        : tipo === 'SALIDA' ? 'bg-red-900/50 border-red-500 text-red-400'
                                                            : 'bg-yellow-900/50 border-yellow-500 text-yellow-400'
                                                    : 'bg-[#334155] border-[#475569] text-[#94A3B8] hover:border-[#94A3B8]'
                                                }`}
                                        >
                                            <span className="text-xl">{getTipoIcon(tipo)}</span>
                                            <p className="text-sm mt-1">{tipo}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-[#94A3B8] mb-1">
                                    {formData.tipo === 'AJUSTE' ? 'Nuevo Stock *' : 'Cantidad *'}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.cantidad}
                                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                                    className="input"
                                    required
                                />
                                {formData.tipo === 'AJUSTE' && (
                                    <p className="text-xs text-[#94A3B8] mt-1">
                                        Este valor reemplazará el stock actual
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-[#94A3B8] mb-1">Descripción</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="input"
                                    rows={2}
                                    placeholder="Motivo del movimiento..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={saving} className="btn btn-primary">
                                    {saving ? 'Registrando...' : 'Registrar Movimiento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
