# 📦 ABASTO - Sistema de Inventario

<p align="center">
  <img src="frontend/public/abasto-logo.svg" alt="ABASTO Logo" width="120"/>
</p>

Sistema completo de gestión de inventario con autenticación, roles y permisos granulares. Desarrollado con **Next.js 16**, **Express**, **Prisma** y **PostgreSQL**.

---

## ✨ Características Principales

### 🔐 Autenticación y Autorización
- Login seguro con **JWT**
- Sistema de **roles y permisos granulares**
- 23 permisos configurables por módulo
- Redirección inteligente según permisos del usuario
- Protección de rutas en frontend y backend

### 📊 Dashboard
- Estadísticas en tiempo real
- Gráficos interactivos con **Recharts**
- KPIs: Total productos, stock bajo, valorización, rentabilidad
- Panel de ventas recientes
- Historial gráfico de inventario

### 📦 Gestión de Productos
- CRUD completo de productos
- Código único, precio, costo y stock
- Stock mínimo con alertas
- Carga de imágenes con **Cloudinary**
- Filtrado y búsqueda

### 🏷️ Categorías
- Organización por categorías
- Imágenes por categoría
- Relación con productos

### 🚚 Proveedores
- Gestión de proveedores
- Datos de contacto
- Estado activo/inactivo

### 📝 Movimientos de Inventario
- Registro de entradas y salidas
- Tipos: ENTRADA, SALIDA, AJUSTE
- Actualización automática de stock
- Historial completo

### 👥 Gestión de Usuarios
- CRUD de usuarios
- Asignación de roles
- Contraseñas encriptadas con **bcrypt**

### 🛡️ Roles y Permisos
- Creación de roles personalizados
- Asignación de permisos por módulo
- Módulos: Dashboard, Usuarios, Roles, Productos, Categorías, Proveedores, Movimientos

---

## 🛠️ Stack Tecnológico

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Node.js | 20+ | Runtime |
| Express | 5.x | Framework web |
| TypeScript | 5.x | Tipado estático |
| Prisma | 7.x | ORM |
| PostgreSQL | 16 | Base de datos |
| JWT | 9.x | Autenticación |
| bcrypt | 3.x | Encriptación |
| Cloudinary | 2.x | Almacenamiento de imágenes |
| Zod | 4.x | Validación |
| Docker | - | Contenedores |

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 16 | Framework React |
| React | 19 | UI Library |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 4.x | Estilos |
| Radix UI | - | Componentes accesibles |
| Recharts | 2.x | Gráficos |
| SWR | 2.x | Data fetching |
| Lucide React | - | Iconos |
| Sonner | - | Notificaciones toast |

---

## 📁 Estructura del Proyecto

```
Sistema-Inventario/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Esquema de BD
│   │   ├── seed.ts            # Datos iniciales
│   │   └── migrations/        # Migraciones
│   ├── src/
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── routes/            # Endpoints API
│   │   ├── middlewares/       # Auth, etc.
│   │   ├── services/          # Servicios
│   │   ├── schemas/           # Validaciones Zod
│   │   └── index.ts           # Entry point
│   ├── docker-compose.yml     # PostgreSQL
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── page.tsx           # Dashboard
    │   ├── productos/         # Módulo productos
    │   ├── categorias/        # Módulo categorías
    │   ├── proveedores/       # Módulo proveedores
    │   ├── movimientos/       # Módulo movimientos
    │   ├── usuarios/          # Módulo usuarios
    │   ├── roles/             # Módulo roles
    │   ├── login/             # Autenticación
    │   └── unauthorized/      # Página 403
    ├── components/
    │   ├── auth/              # Guards de permisos
    │   ├── dashboard/         # Sidebar, Stats, Charts
    │   ├── providers/         # Auth, Theme
    │   └── ui/                # Componentes Shadcn/UI
    └── package.json
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 20+
- Docker & Docker Compose
- npm o pnpm

### 1. Clonar el repositorio
```bash
git clone <repo-url>
cd Sistema-Inventario
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Iniciar PostgreSQL con Docker
npm run db:start

# Crear archivo .env
# DATABASE_URL="postgresql://postgres:postgres123@localhost:5433/inventario_db"
# JWT_SECRET="tu_secret_key"
# CLOUDINARY_URL="cloudinary://..."

# Ejecutar migraciones
npm run db:migrate

# Poblar base de datos
npx prisma db seed

# Iniciar servidor de desarrollo
npm run dev
```

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Iniciar servidor de desarrollo
npm run dev
```

---

## 🔑 Credenciales por Defecto

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| Admin | admin3@abasto.com | admin1238 | ADMIN |
| Almacenero | almacenero@abasto.com | almacen123 | ALMACENERO |

---

## 📡 API Endpoints

### Autenticación
```
POST   /api/auth/login      # Iniciar sesión
POST   /api/auth/register   # Registrar usuario
```

### Productos
```
GET    /api/productos       # Listar productos
POST   /api/productos       # Crear producto
PUT    /api/productos/:id   # Actualizar producto
DELETE /api/productos/:id   # Eliminar producto
```

### Categorías
```
GET    /api/categorias      # Listar categorías
POST   /api/categorias      # Crear categoría
PUT    /api/categorias/:id  # Actualizar categoría
DELETE /api/categorias/:id  # Eliminar categoría
```

### Proveedores
```
GET    /api/proveedores      # Listar proveedores
POST   /api/proveedores      # Crear proveedor
PUT    /api/proveedores/:id  # Actualizar proveedor
DELETE /api/proveedores/:id  # Eliminar proveedor
```

### Movimientos
```
GET    /api/movimientos      # Listar movimientos
POST   /api/movimientos      # Crear movimiento
```

### Usuarios
```
GET    /api/usuarios      # Listar usuarios
POST   /api/usuarios      # Crear usuario
PUT    /api/usuarios/:id  # Actualizar usuario
DELETE /api/usuarios/:id  # Eliminar usuario
```

### Roles
```
GET    /api/roles         # Listar roles
POST   /api/roles         # Crear rol
PUT    /api/roles/:id     # Actualizar rol
DELETE /api/roles/:id     # Eliminar rol
```

### Dashboard
```
GET    /api/dashboard/stats       # Estadísticas generales
GET    /api/dashboard/chart       # Datos para gráficos
GET    /api/dashboard/recent      # Movimientos recientes
```

---

## 🎨 Interfaz de Usuario

- **Tema claro/oscuro** automático
- **Diseño responsivo** mobile-first
- **Sidebar colapsable** con navegación inteligente
- **Tablas con búsqueda y filtros**
- **Modales de confirmación** para acciones destructivas
- **Notificaciones toast** para feedback
- **Carga lazy** de componentes pesados

---

## 🔒 Sistema de Permisos

Los permisos están organizados por módulo:

| Módulo | Permisos |
|--------|----------|
| Dashboard | `DASHBOARD_VER` |
| Usuarios | `USUARIO_VER`, `USUARIO_CREAR`, `USUARIO_EDITAR`, `USUARIO_ELIMINAR` |
| Roles | `ROL_VER`, `ROL_CREAR`, `ROL_EDITAR`, `ROL_ELIMINAR` |
| Productos | `PRODUCTO_VER`, `PRODUCTO_CREAR`, `PRODUCTO_EDITAR`, `PRODUCTO_ELIMINAR` |
| Categorías | `CATEGORIA_VER`, `CATEGORIA_CREAR`, `CATEGORIA_EDITAR`, `CATEGORIA_ELIMINAR` |
| Proveedores | `PROVEEDOR_VER`, `PROVEEDOR_CREAR`, `PROVEEDOR_EDITAR`, `PROVEEDOR_ELIMINAR` |
| Movimientos | `MOVIMIENTO_VER`, `MOVIMIENTO_CREAR` |

---

## 📜 Scripts Disponibles

### Backend
```bash
npm run dev         # Desarrollo con hot-reload
npm run build       # Build producción
npm run start       # Iniciar producción
npm run db:start    # Iniciar PostgreSQL
npm run db:stop     # Detener PostgreSQL
npm run db:migrate  # Ejecutar migraciones
npm run db:studio   # Abrir Prisma Studio
```

### Frontend
```bash
npm run dev    # Desarrollo
npm run build  # Build producción
npm run start  # Iniciar producción
npm run lint   # Linter
```

---

## 📄 Licencia

ISC

---

<p align="center">
  Desarrollado con ❤️ usando Next.js + Express + Prisma
</p>
