import "dotenv/config";
import express from "express";
import cors from "cors";

// Routes
import categoriasRouter from "./routes/categorias.js";
import proveedoresRouter from "./routes/proveedores.js";
import productosRouter from "./routes/productos.js";
import movimientosRouter from "./routes/movimientos.js";
import dashboardRouter from "./routes/dashboard.js";

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/categorias", categoriasRouter);
app.use("/api/proveedores", proveedoresRouter);
app.use("/api/productos", productosRouter);
app.use("/api/movimientos", movimientosRouter);
app.use("/api/dashboard", dashboardRouter);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
