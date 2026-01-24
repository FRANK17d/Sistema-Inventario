import { useEffect, useState } from 'react';
import { Header } from '../components/Layout';
import { dashboardApi, formatSoles, formatFechaHora } from '../services/api';

interface DashboardData {
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
        stockBajo: any[];
    };
    ultimosMovimientos: any[];
    productosPorCategoria: any[];
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const response = await dashboardApi.get();
            setData(response.data);
        } catch (err) {
            setError('Error al cargar el dashboard');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-[#94A3B8]">Cargando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card bg-red-900/20 border-red-500">
                <p className="text-red-400">{error}</p>
                <button onClick={loadDashboard} className="btn btn-primary mt-4">
                    Reintentar
                </button>
            </div>
        );
    }

    if (!data) return null;

    const { resumen, alertas, ultimosMovimientos } = data;

    return (
        <div>
            <Header
                title="Dashboard"
                subtitle="Resumen general del inventario"
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Total Productos</p>
                            <p className="text-3xl font-bold text-white mt-1">{resumen.totalProductos}</p>
                        </div>
                        <div className="text-4xl">📦</div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Categorías</p>
                            <p className="text-3xl font-bold text-white mt-1">{resumen.totalCategorias}</p>
                        </div>
                        <div className="text-4xl">🏷️</div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Proveedores</p>
                            <p className="text-3xl font-bold text-white mt-1">{resumen.totalProveedores}</p>
                        </div>
                        <div className="text-4xl">🏢</div>
                    </div>
                </div>

                <div className={`card ${resumen.productosConStockBajo > 0 ? 'border-yellow-500' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#94A3B8] text-sm">Stock Bajo</p>
                            <p className={`text-3xl font-bold mt-1 ${resumen.productosConStockBajo > 0 ? 'text-yellow-400' : 'text-white'}`}>
                                {resumen.productosConStockBajo}
                            </p>
                        </div>
                        <div className="text-4xl">⚠️</div>
                    </div>
                </div>
            </div>

            {/* Financial KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="card bg-linear-to-br from-[#1E293B] to-[#0F172A]">
                    <p className="text-[#94A3B8] text-sm">Valorización Inventario</p>
                    <p className="text-2xl font-bold text-[#10B981] mt-2">
                        {formatSoles(resumen.valorizacionInventario)}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-1">Costo total del stock</p>
                </div>

                <div className="card bg-linear-to-br from-[#1E293B] to-[#0F172A]">
                    <p className="text-[#94A3B8] text-sm">Valor Venta Potencial</p>
                    <p className="text-2xl font-bold text-[#3B82F6] mt-2">
                        {formatSoles(resumen.valorVentaPotencial)}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-1">Si se vende todo el stock</p>
                </div>

                <div className="card bg-linear-to-br from-[#1E293B] to-[#0F172A]">
                    <p className="text-[#94A3B8] text-sm">Margen Potencial</p>
                    <p className="text-2xl font-bold text-[#F59E0B] mt-2">
                        {formatSoles(resumen.margenPotencial)}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-1">Ganancia potencial</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stock Bajo Alert */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>⚠️</span> Productos con Stock Bajo
                    </h2>
                    {alertas.stockBajo.length === 0 ? (
                        <p className="text-[#94A3B8] text-sm">No hay productos con stock bajo</p>
                    ) : (
                        <div className="space-y-2">
                            {alertas.stockBajo.map((producto: any) => (
                                <div
                                    key={producto.id}
                                    className="flex items-center justify-between p-3 bg-[#334155] rounded-lg"
                                >
                                    <div>
                                        <p className="text-white font-medium">{producto.nombre}</p>
                                        <p className="text-xs text-[#94A3B8]">{producto.codigo}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="badge badge-danger">
                                            Stock: {producto.stock} / {producto.stockMinimo}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Últimos Movimientos */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>📋</span> Últimos Movimientos
                    </h2>
                    {ultimosMovimientos.length === 0 ? (
                        <p className="text-[#94A3B8] text-sm">No hay movimientos registrados</p>
                    ) : (
                        <div className="space-y-2">
                            {ultimosMovimientos.map((mov: any) => (
                                <div
                                    key={mov.id}
                                    className="flex items-center justify-between p-3 bg-[#334155] rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-lg ${mov.tipo === 'ENTRADA' ? 'text-green-400' :
                                            mov.tipo === 'SALIDA' ? 'text-red-400' : 'text-yellow-400'
                                            }`}>
                                            {mov.tipo === 'ENTRADA' ? '📥' : mov.tipo === 'SALIDA' ? '📤' : '🔄'}
                                        </span>
                                        <div>
                                            <p className="text-white font-medium">{mov.producto?.nombre}</p>
                                            <p className="text-xs text-[#94A3B8]">{formatFechaHora(mov.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`badge ${mov.tipo === 'ENTRADA' ? 'badge-success' :
                                            mov.tipo === 'SALIDA' ? 'badge-danger' : 'badge-warning'
                                            }`}>
                                            {mov.tipo === 'ENTRADA' ? '+' : mov.tipo === 'SALIDA' ? '-' : ''}{mov.cantidad}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
