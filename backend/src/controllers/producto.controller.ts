import { Request, Response } from "express";
import { ProductoService } from "../services/producto.service.js";

export class ProductoController {
    private service: ProductoService;

    constructor() {
        this.service = new ProductoService();
    }

    listar = async (req: Request, res: Response) => {
        try {
            const { categoriaId, proveedorId, activo, buscar, stockBajo } = req.query;

            const filtros = {
                categoriaId: categoriaId ? parseInt(categoriaId as string) : undefined,
                proveedorId: proveedorId ? parseInt(proveedorId as string) : undefined,
                activo: activo !== undefined ? activo === "true" : undefined,
                buscar: buscar as string,
                stockBajo: stockBajo === "true"
            };

            const productos = await this.service.listar(filtros);
            res.json(productos);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            res.status(500).json({ error: "Error al obtener productos" });
        }
    }

    obtenerPorId = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const producto = await this.service.obtenerPorId(parseInt(id as string));

            if (!producto) {
                return res.status(404).json({ error: "Producto no encontrado" });
            }

            res.json(producto);
        } catch (error) {
            console.error("Error al obtener producto:", error);
            res.status(500).json({ error: "Error al obtener producto" });
        }
    }

    crear = async (req: Request, res: Response) => {
        try {
            const { codigo, nombre, descripcion, precio, costo, stock, stockMinimo, categoriaId, proveedorId, imagenUrl } = req.body;

            if (!codigo || !nombre || !precio || !costo || !categoriaId) {
                return res.status(400).json({
                    error: "Campos requeridos: codigo, nombre, precio, costo, categoriaId"
                });
            }

            const producto = await this.service.crear({
                codigo,
                nombre,
                descripcion,
                precio,
                costo,
                stock: stock || 0,
                stockMinimo: stockMinimo || 5,
                categoriaId,
                proveedorId,
                imagenUrl
            });

            res.status(201).json(producto);
        } catch (error: any) {
            if (error.code === "P2002") {
                return res.status(400).json({ error: "Ya existe un producto con ese código" });
            }
            if (error.code === "P2003") {
                return res.status(400).json({ error: "Categoría o proveedor no encontrado" });
            }
            console.error("Error al crear producto:", error);
            res.status(500).json({ error: "Error al crear producto" });
        }
    }

    actualizar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { codigo, nombre, descripcion, precio, costo, stockMinimo, categoriaId, proveedorId, activo, imagenUrl } = req.body;

            const data: any = {};
            if (codigo !== undefined) data.codigo = codigo;
            if (nombre !== undefined) data.nombre = nombre;
            if (descripcion !== undefined) data.descripcion = descripcion;
            if (precio !== undefined) data.precio = precio;
            if (costo !== undefined) data.costo = costo;
            if (stockMinimo !== undefined) data.stockMinimo = stockMinimo;
            if (categoriaId !== undefined) data.categoriaId = categoriaId;
            if (proveedorId !== undefined) data.proveedorId = proveedorId;
            if (activo !== undefined) data.activo = activo;
            if (imagenUrl !== undefined) data.imagenUrl = imagenUrl;

            const producto = await this.service.actualizar(parseInt(id as string), data);

            res.json(producto);
        } catch (error: any) {
            if (error.code === "P2025") {
                return res.status(404).json({ error: "Producto no encontrado" });
            }
            if (error.code === "P2002") {
                return res.status(400).json({ error: "Ya existe un producto con ese código" });
            }
            console.error("Error al actualizar producto:", error);
            res.status(500).json({ error: "Error al actualizar producto" });
        }
    }

    eliminar = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            await this.service.eliminar(parseInt(id as string));

            res.json({ message: "Producto eliminado exitosamente" });
        } catch (error: any) {
            if (error.code === "P2025") {
                return res.status(404).json({ error: "Producto no encontrado" });
            }
            console.error("Error al eliminar producto:", error);
            res.status(500).json({ error: "Error al eliminar producto" });
        }
    }
}
