import "dotenv/config";
import express from "express";
import cors from "cors";

// Routes
import categoriasRouter from "./routes/categorias.js";
import proveedoresRouter from "./routes/proveedores.js";
import productosRouter from "./routes/productos.js";
import movimientosRouter from "./routes/movimientos.js";
import dashboardRouter from "./routes/dashboard.js";
import uploadRouter from "./routes/upload.js";
import authRouter from "./routes/auth.js";
import rolesRouter from "./routes/roles.js";
import permisosRouter from "./routes/permisos.js";
import usuariosRouter from "./routes/usuarios.js";

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRouter);
app.use("/api/categorias", categoriasRouter);
app.use("/api/proveedores", proveedoresRouter);
app.use("/api/productos", productosRouter);
app.use("/api/movimientos", movimientosRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/permisos", permisosRouter);
app.use("/api/usuarios", usuariosRouter);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
