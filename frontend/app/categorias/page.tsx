"use client"

import { useState } from "react"
import { Shell } from "@/components/dashboard/shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Loader2, Pencil, Trash2, Upload, X, ImageIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
    createCategoria, updateCategoria, deleteCategoria, uploadImagen,
    type Categoria, type CategoriaInput
} from "@/lib/api"
import { useCategorias } from "@/hooks/use-data"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { PermissionGate } from "@/components/auth/permission-gate"

export default function CategoriasPage() {
    const { data: categorias, isLoading: loading, mutate: mutateCategorias } = useCategorias()

    // Local state
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
    const [deletingCategoria, setDeletingCategoria] = useState<Categoria | null>(null)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const [formData, setFormData] = useState<CategoriaInput>({
        nombre: "",
        descripcion: "",
        imagenUrl: undefined,
    })

    const openCreateDialog = () => {
        setEditingCategoria(null)
        setFormData({ nombre: "", descripcion: "", imagenUrl: undefined })
        setImagePreview(null)
        setIsDialogOpen(true)
    }

    const openEditDialog = (cat: Categoria) => {
        setEditingCategoria(cat)
        setFormData({ nombre: cat.nombre, descripcion: cat.descripcion || "", imagenUrl: cat.imagenUrl })
        setImagePreview(cat.imagenUrl || null)
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!categorias) return
        setSaving(true)
        try {
            if (editingCategoria) {
                // Optimistic update
                const updatedCat: Categoria = {
                    ...editingCategoria,
                    ...formData,
                    updatedAt: new Date().toISOString()
                }

                mutateCategorias(
                    categorias.map(c => c.id === editingCategoria.id ? updatedCat : c),
                    false
                )

                await updateCategoria(editingCategoria.id, formData)
                mutateCategorias()
            } else {
                // Optimistic creation is harder without ID, so we wait or use temporary ID
                // For simplicity, we'll wait for creation but use SWR mutate to update list
                const created = await createCategoria(formData)
                mutateCategorias([...categorias, created])
            }
            setIsDialogOpen(false)
        } catch (error: any) {
            alert(error.message)
            mutateCategorias()
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = (cat: Categoria) => {
        setDeletingCategoria(cat)
        setIsDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!deletingCategoria || !categorias) return
        setSaving(true)
        try {
            // Optimistic delete
            mutateCategorias(
                categorias.filter(c => c.id !== deletingCategoria.id),
                false
            )

            await deleteCategoria(deletingCategoria.id)
            setIsDeleteDialogOpen(false)
            mutateCategorias()
        } catch (error: any) {
            alert(error.message)
            mutateCategorias()
        } finally {
            setSaving(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    }

    return (
        <PermissionGuard requiredPermission="CATEGORIA_VER">
            <Shell>
                <div className="flex flex-col gap-4">
                    <div className="flex justify-end">
                        <PermissionGate permission="CATEGORIA_CREAR">
                            <Button onClick={openCreateDialog}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nueva Categoría
                            </Button>
                        </PermissionGate>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Categorías ({categorias?.length || 0})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="rounded-md border overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-16">Imagen</TableHead>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead className="hidden sm:table-cell">Descripción</TableHead>
                                                <TableHead className="text-right">Productos</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[...Array(6)].map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton className="w-10 h-10 rounded" /></TableCell>
                                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
                                                    <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
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
                                                <TableHead>Nombre</TableHead>
                                                <TableHead className="hidden sm:table-cell">Descripción</TableHead>
                                                <TableHead className="text-right">Productos</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {!categorias || categorias.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                        No hay categorías registradas
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                categorias.map((cat) => (
                                                    <TableRow key={cat.id}>
                                                        <TableCell>
                                                            {cat.imagenUrl ? (
                                                                <img src={cat.imagenUrl} alt={cat.nombre} className="w-10 h-10 rounded object-cover" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                                                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-medium">{cat.nombre}</TableCell>
                                                        <TableCell className="text-muted-foreground hidden sm:table-cell">{cat.descripcion || '-'}</TableCell>
                                                        <TableCell className="text-right">{cat._count?.productos || 0}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <PermissionGate permission="CATEGORIA_EDITAR">
                                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(cat)}>
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                </PermissionGate>
                                                                <PermissionGate permission="CATEGORIA_ELIMINAR">
                                                                    <Button variant="ghost" size="icon" onClick={() => confirmDelete(cat)} disabled={(cat._count?.productos || 0) > 0}>
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


                {/* Create/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingCategoria ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
                            <DialogDescription>
                                {editingCategoria ? "Modifica los datos de la categoría" : "Ingresa los datos de la nueva categoría"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre *</Label>
                                <Input id="nombre" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Textarea id="descripcion" value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Imagen</Label>
                                <div className="flex flex-col gap-3">
                                    {(imagePreview || formData.imagenUrl) ? (
                                        <div className="relative w-full h-32 rounded-lg border overflow-hidden bg-muted">
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
                                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                            <div className="flex flex-col items-center justify-center">
                                                <Upload className="h-6 w-6 mb-1 text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground">Click para subir imagen</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
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
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSubmit} disabled={saving || uploading || !formData.nombre}>
                                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {editingCategoria ? "Guardar Cambios" : "Crear Categoría"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente la categoría "{deletingCategoria?.nombre}".
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
