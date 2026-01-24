import { useEffect, useState } from 'react';
import { Header } from '../components/Layout';
import { proveedoresApi } from '../services/api';

interface Proveedor {
    id: number;
    nombre: string;
    contacto?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    activo: boolean;
    _count?: { productos: number };
}

export default function Proveedores() {
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        contacto: '',
        telefono: '',
        email: '',
        direccion: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProveedores();
    }, []);

    const loadProveedores = async () => {
        try {
            setLoading(true);
            const response = await proveedoresApi.getAll();
            setProveedores(response.data);
        } catch (err) {
            console.error('Error loading proveedores:', err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (proveedor?: Proveedor) => {
        if (proveedor) {
            setEditingProveedor(proveedor);
            setFormData({
                nombre: proveedor.nombre,
                contacto: proveedor.contacto || '',
                telefono: proveedor.telefono || '',
                email: proveedor.email || '',
                direccion: proveedor.direccion || '',
            });
        } else {
            setEditingProveedor(null);
            setFormData({ nombre: '', contacto: '', telefono: '', email: '', direccion: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingProveedor) {
                await proveedoresApi.update(editingProveedor.id, formData);
            } else {
                await proveedoresApi.create(formData);
            }
            setShowModal(false);
            loadProveedores();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este proveedor?')) return;
        try {
            await proveedoresApi.delete(id);
            loadProveedores();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al eliminar');
        }
    };

    return (
        <div>
            <Header
                title="Proveedores"
                subtitle={`${proveedores.length} proveedores`}
                actions={
                    <button onClick={() => openModal()} className="btn btn-primary">
                        + Nuevo Proveedor
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
                                <th>Nombre</th>
                                <th>Contacto</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Productos</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proveedores.map((prov) => (
                                <tr key={prov.id}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">🏢</span>
                                            <span className="font-medium text-white">{prov.nombre}</span>
                                        </div>
                                    </td>
                                    <td>{prov.contacto || '-'}</td>
                                    <td>{prov.telefono || '-'}</td>
                                    <td>{prov.email || '-'}</td>
                                    <td>{prov._count?.productos || 0}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button onClick={() => openModal(prov)} className="btn btn-secondary text-xs py-1 px-2">
                                                Editar
                                            </button>
                                            <button onClick={() => handleDelete(prov.id)} className="btn btn-danger text-xs py-1 px-2">
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {proveedores.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center text-[#94A3B8] py-8">
                                        No hay proveedores registrados
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
                                {editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#94A3B8] mb-1">Contacto</label>
                                    <input
                                        type="text"
                                        value={formData.contacto}
                                        onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#94A3B8] mb-1">Teléfono</label>
                                    <input
                                        type="text"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        className="input"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-[#94A3B8] mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[#94A3B8] mb-1">Dirección</label>
                                <textarea
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    className="input"
                                    rows={2}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={saving} className="btn btn-primary">
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
