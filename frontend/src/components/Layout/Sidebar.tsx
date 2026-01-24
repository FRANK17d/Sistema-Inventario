import { NavLink } from 'react-router-dom';

const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/productos', label: 'Productos', icon: '📦' },
    { path: '/categorias', label: 'Categorías', icon: '🏷️' },
    { path: '/proveedores', label: 'Proveedores', icon: '🏢' },
    { path: '/movimientos', label: 'Movimientos', icon: '📋' },
];

export default function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1E293B] border-r border-[#475569] flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-[#475569]">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">📦</span>
                    Inventario
                </h1>
                <p className="text-xs text-[#94A3B8] mt-1">Sistema de Gestión</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-1">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-[#3B82F6] text-white'
                                        : 'text-[#94A3B8] hover:bg-[#334155] hover:text-white'
                                    }`
                                }
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[#475569]">
                <div className="text-xs text-[#94A3B8] text-center">
                    <p>Zona horaria: Lima, Perú</p>
                    <p className="mt-1">Moneda: PEN (S/)</p>
                </div>
            </div>
        </aside>
    );
}
