import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/Layout';
import { Dashboard, Productos, Categorias, Proveedores, Movimientos } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<Productos />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="movimientos" element={<Movimientos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
