import { Router } from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyToken);

// Configure multer for memory storage (files stored in buffer)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Solo se permiten archivos de imagen"));
        }
    },
});

// POST /api/upload/imagen - Upload image to Cloudinary
router.post("/imagen", upload.single("imagen"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se proporcionó ninguna imagen" });
        }

        // Convert buffer to base64 data URI
        const base64 = req.file.buffer.toString("base64");
        const dataUri = `data:${req.file.mimetype};base64,${base64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: "inventario/productos",
            resource_type: "image",
        });

        res.json({
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (error: any) {
        console.error("Error al subir imagen:", error);
        res.status(500).json({ error: error.message || "Error al subir imagen" });
    }
});

// DELETE /api/upload/imagen - Delete image from Cloudinary
router.delete("/imagen", async (req, res) => {
    try {
        const { public_id } = req.body;

        if (!public_id) {
            return res.status(400).json({ error: "Se requiere public_id" });
        }

        await cloudinary.uploader.destroy(public_id);

        res.json({ message: "Imagen eliminada exitosamente" });
    } catch (error: any) {
        console.error("Error al eliminar imagen:", error);
        res.status(500).json({ error: error.message || "Error al eliminar imagen" });
    }
});

export default router;
