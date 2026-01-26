"use client"

import { useState } from "react"
import { Shell } from "@/components/dashboard/shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Plus, Loader2, Pencil, Trash2, ImageIcon, Upload, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
    createProducto, updateProducto, deleteProducto, uploadImagen,
    type Producto, type ProductoInput
} from "@/lib/api"
import { useProductos, useCategorias, useProveedores } from "@/hooks/use-data"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { PermissionGate } from "@/components/auth/permission-gate"

export default function ProductosPage() {
    // SWR Hooks
    const { productos, isLoading: loadingProductos, mutate: mutateProductos } = useProductos()
    const { data: categorias } = useCategorias()
    const { data: proveedores } = useProveedores()

    // Local state
    const [searchTerm, setSearchTerm] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingProducto, setEditingProducto] = useState<Producto | null>(null)
    const [deletingProducto, setDeletingProducto] = useState<Producto | null>(null)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState<ProductoInput>({
        codigo: "",
        nombre: "",
        descripcion: "",
        precio: 0,
        costo: 0,
        stock: 0,
        stockMinimo: 5,
        categoriaId: 0,
        proveedorId: undefined,
        imagenUrl: undefined,
    })

    const openCreateDialog = () => {
        setEditingProducto(null)
        setFormData({
            codigo: "",
            nombre: "",
            descripcion: "",
            precio: 0,
            costo: 0,
            stock: 0,
            stockMinimo: 5,
            categoriaId: categorias?.[0]?.id || 0,
            proveedorId: undefined,
            imagenUrl: undefined,
        })
        setImagePreview(null)
        setIsDialogOpen(true)
    }

    const openEditDialog = (producto: Producto) => {
        setEditingProducto(producto)
        setFormData({
            codigo: producto.codigo,
            nombre: producto.nombre,
            descripcion: producto.descripcion || "",
            precio: Number(producto.precio),
            costo: Number(producto.costo),
            stock: producto.stock,
            stockMinimo: producto.stockMinimo,
            categoriaId: producto.categoriaId,
            proveedorId: producto.proveedorId || undefined,
            imagenUrl: producto.imagenUrl || undefined,
        })
        setImagePreview(producto.imagenUrl || null)
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!productos) return

        setSaving(true)
        try {
            if (editingProducto) {
                // Optimistic update
                const updatedProduct: Producto = {
                    ...editingProducto,
                    ...formData,
                    updatedAt: new Date().toISOString(),
                    categoria: categorias?.find(c => c.id === formData.categoriaId)
                }

                // Update local cache immediately
                mutateProductos(
                    productos.map(p => p.id === editingProducto.id ? updatedProduct : p),
                    false // Don't revalidate immediately
                )

                await updateProducto(editingProducto.id, formData)
                mutateProductos() // Revalidate to be sure
            } else {
                // Create
                const created = await createProducto(formData)
                mutateProductos([...productos, created])
            }
            setIsDialogOpen(false)
        } catch (error: any) {
            alert(error.message)
            mutateProductos() // Revert changes on error
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = (producto: Producto) => {
        setDeletingProducto(producto)
        setIsDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!deletingProducto || !productos) return
        setSaving(true)
        try {
            // Optimistic delete
            mutateProductos(
                productos.filter(p => p.id !== deletingProducto.id),
                false
            )

            await deleteProducto(deletingProducto.id)
            setIsDeleteDialogOpen(false)
            mutateProductos()
        } catch (error: any) {
            alert(error.message)
            mutateProductos() // Revert
        } finally {
            setSaving(false)
        }
    }

    const filteredProductos = productos?.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    return (
        <PermissionGuard requiredPermission="PRODUCTO_VER">
            <Shell>
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar productos..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <PermissionGate permission="PRODUCTO_CREAR">
                            <Button onClick={openCreateDialog}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Producto
                            </Button>
                        </PermissionGate>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Listado de Productos ({filteredProductos.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingProductos ? (
                                <div className="rounded-md border overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-16">Imagen</TableHead>
                                                <TableHead>Código</TableHead>
                                                <TableHead>Producto</TableHead>
                                                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                                                <TableHead className="text-right">Precio</TableHead>
                                                <TableHead className="text-right hidden sm:table-cell">Stock</TableHead>
                                                <TableHead className="hidden lg:table-cell">Estado</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[...Array(8)].map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="w-10 h-10 rounded" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                                    <TableCell className="text-right hidden sm:table-cell"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                                                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Skeleton className="w-8 h-8" />
                                                            <Skeleton className="w-8 h-8" />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="rounded-md border overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-16">Imagen</TableHead>
                                                <TableHead>Código</TableHead>
                                                <TableHead>Producto</TableHead>
                                                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                                                <TableHead className="text-right">Precio</TableHead>
                                                <TableHead className="text-right hidden sm:table-cell">Stock</TableHead>
                                                <TableHead className="hidden lg:table-cell">Estado</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredProductos.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                        No se encontraron productos
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredProductos.map((producto) => (
                                                    <TableRow key={producto.id}>
                                                        <TableCell>
                                                            {producto.imagenUrl ? (
                                                                <img src={producto.imagenUrl} alt={producto.nombre} className="w-10 h-10 rounded object-cover" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                                                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-medium">{producto.codigo}</TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{producto.nombre}</div>
                                                            {producto.descripcion && (
                                                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">{producto.descripcion}</div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            <Badge variant="outline">{producto.categoria?.nombre || '-'}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">S/ {Number(producto.precio).toFixed(2)}</TableCell>
                                                        <TableCell className="text-right hidden sm:table-cell">
                                                            <span className={producto.stock <= producto.stockMinimo ? "text-destructive font-bold" : ""}>
                                                                {producto.stock}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell">
                                                            <Badge variant={producto.activo ? "default" : "secondary"}>
                                                                {producto.activo ? "Activo" : "Inactivo"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <PermissionGate permission="PRODUCTO_EDITAR">
                                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(producto)}>
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                </PermissionGate>
                                                                <PermissionGate permission="PRODUCTO_ELIMINAR">
                                                                    <Button variant="ghost" size="icon" onClick={() => confirmDelete(producto)}>
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </PermissionGate>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Create/Edit Modal and Delete Confirm - Same as before but utilizing new state management */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProducto ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
                            <DialogDescription>
                                {editingProducto ? "Modifica los datos del producto" : "Ingresa los datos del nuevo producto"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="codigo">Código *</Label>
                                    <Input id="codigo" value={formData.codigo} onChange={e => setFormData({ ...formData, codigo: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre *</Label>
                                    <Input id="nombre" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Textarea id="descripcion" value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="precio">Precio *</Label>
                                    <Input id="precio" type="number" step="0.01" value={formData.precio} onChange={e => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="costo">Costo *</Label>
                                    <Input id="costo" type="number" step="0.01" value={formData.costo} onChange={e => setFormData({ ...formData, costo: parseFloat(e.target.value) || 0 })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Stock Inicial</Label>
                                    <Input id="stock" type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} disabled={!!editingProducto} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stockMinimo">Stock Mínimo</Label>
                                    <Input id="stockMinimo" type="number" value={formData.stockMinimo} onChange={e => setFormData({ ...formData, stockMinimo: parseInt(e.target.value) || 5 })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Imagen del Producto</Label>
                                <div className="flex flex-col gap-3">
                                    {(imagePreview || formData.imagenUrl) ? (
                                        <div className="relative w-full h-40 rounded-lg border overflow-hidden bg-muted">
                                            <img
                                                src={imagePreview || formData.imagenUrl}
                                                alt="Preview"
                                                className="w-full h-full object-contain"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-7 w-7"
                                                onClick={() => {
                                                    setImagePreview(null)
                                                    setFormData({ ...formData, imagenUrl: undefined })
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                                                <p className="mb-1 text-sm text-muted-foreground">
                                                    <span className="font-semibold">Click para subir</span> o arrastra
                                                </p>
                                                <p className="text-xs text-muted-foreground">PNG, JPG hasta 5MB</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0]
                                                    if (!file) return
                                                    setUploading(true)
                                                    try {
                                                        setImagePreview(URL.createObjectURL(file))
                                                        const result = await uploadImagen(file)
                                                        setFormData({ ...formData, imagenUrl: result.url })
                                                    } catch (error: any) {
                                                        alert('Error al subir imagen: ' + error.message)
                                                        setImagePreview(null)
                                                    } finally {
                                                        setUploading(false)
                                                    }
                                                }}
                                                disabled={uploading}
                                            />
                                        </label>
                                    )}
                                    {uploading && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Subiendo imagen...
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Categoría *</Label>
                                    <Select value={String(formData.categoriaId)} onValueChange={v => setFormData({ ...formData, categoriaId: parseInt(v) })}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                        <SelectContent>
                                            {categorias?.map(cat => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>{cat.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Proveedor</Label>
                                    <Select value={formData.proveedorId ? String(formData.proveedorId) : "none"} onValueChange={v => setFormData({ ...formData, proveedorId: v === "none" ? undefined : parseInt(v) })}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sin proveedor</SelectItem>
                                            {proveedores?.map(prov => (
                                                <SelectItem key={prov.id} value={String(prov.id)}>{prov.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSubmit} disabled={saving || !formData.codigo || !formData.nombre || !formData.precio}>
                                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {editingProducto ? "Guardar Cambios" : "Crear Producto"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el producto "{deletingProducto?.nombre}".
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Shell>
        </PermissionGuard>
    )
}
