import { useEffect, useState } from 'react';
import { Header } from '../components/Layout';
import { categoriasApi } from '../services/api';

interface Categoria {
    id: number;
    nombre: string;
    descripcion?: string;
    _count?: { productos: number };
}

export default function Categorias() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadCategorias();
    }, []);

    const loadCategorias = async () => {
        try {
            setLoading(true);
            const response = await categoriasApi.getAll();
            setCategorias(response.data);
        } catch (err) {
            console.error('Error loading categorias:', err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (categoria?: Categoria) => {
        if (categoria) {
            setEditingCategoria(categoria);
            setFormData({ nombre: categoria.nombre, descripcion: categoria.descripcion || '' });
        } else {
            setEditingCategoria(null);
            setFormData({ nombre: '', descripcion: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingCategoria) {
                await categoriasApi.update(editingCategoria.id, formData);
            } else {
                await categoriasApi.create(formData);
            }
            setShowModal(false);
            loadCategorias();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta categoría?')) return;
        try {
            await categoriasApi.delete(id);
            loadCategorias();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al eliminar');
        }
    };

    return (
        <div>
            <Header
                title="Categorías"
                subtitle={`${categorias.length} categorías`}
                actions={
                    <button onClick={() => openModal()} className="btn btn-primary">
                        + Nueva Categoría
                    </button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full text-center text-[#94A3B8] py-8">Cargando...</div>
                ) : categorias.length === 0 ? (
                    <div className="col-span-full text-center text-[#94A3B8] py-8">
                        No hay categorías. Crea una para empezar.
                    </div>
                ) : (
                    categorias.map((cat) => (
                        <div key={cat.id} className="card">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        🏷️ {cat.nombre}
                                    </h3>
                                    {cat.descripcion && (
                                        <p className="text-sm text-[#94A3B8] mt-1">{cat.descripcion}</p>
                                    )}
                                    <p className="text-xs text-[#94A3B8] mt-2">
                                        {cat._count?.productos || 0} productos
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openModal(cat)}
                                        className="text-[#3B82F6] hover:text-[#60A5FA] text-sm"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="text-[#EF4444] hover:text-[#F87171] text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-[#475569]">
                            <h2 className="text-xl font-bold text-white">
                                {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
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
                            <div>
                                <label className="block text-sm text-[#94A3B8] mb-1">Descripción</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="input"
                                    rows={3}
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
