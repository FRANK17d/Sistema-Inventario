"use client"

import { useState } from "react"
import { Shell } from "@/components/dashboard/shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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
import { Plus, Loader2, Pencil, Trash2, Phone, Mail, MapPin } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
    createProveedor, updateProveedor, deleteProveedor,
    type Proveedor, type ProveedorInput
} from "@/lib/api"
import { useProveedores } from "@/hooks/use-data"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { PermissionGate } from "@/components/auth/permission-gate"

export default function ProveedoresPage() {
    const { data: proveedores, isLoading: loading, mutate: mutateProveedores } = useProveedores()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)
    const [deletingProveedor, setDeletingProveedor] = useState<Proveedor | null>(null)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState<ProveedorInput>({
        nombre: "",
        contacto: "",
        telefono: "",
        email: "",
        direccion: "",
        activo: true,
    })

    const openCreateDialog = () => {
        setEditingProveedor(null)
        setFormData({ nombre: "", contacto: "", telefono: "", email: "", direccion: "", activo: true })
        setIsDialogOpen(true)
    }

    const openEditDialog = (prov: Proveedor) => {
        setEditingProveedor(prov)
        setFormData({
            nombre: prov.nombre,
            contacto: prov.contacto || "",
            telefono: prov.telefono || "",
            email: prov.email || "",
            direccion: prov.direccion || "",
            activo: prov.activo,
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!proveedores) return
        setSaving(true)
        try {
            if (editingProveedor) {
                // Optimistic update
                const updatedProv: Proveedor = {
                    ...editingProveedor,
                    ...formData,
                    updatedAt: new Date().toISOString()
                }

                mutateProveedores(
                    proveedores.map(p => p.id === editingProveedor.id ? updatedProv : p),
                    false
                )

                await updateProveedor(editingProveedor.id, formData)
                mutateProveedores()
            } else {
                const created = await createProveedor(formData)
                mutateProveedores([...proveedores, created])
            }
            setIsDialogOpen(false)
        } catch (error: any) {
            alert(error.message)
            mutateProveedores()
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = (prov: Proveedor) => {
        setDeletingProveedor(prov)
        setIsDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!deletingProveedor || !proveedores) return
        setSaving(true)
        try {
            // Optimistic delete
            mutateProveedores(
                proveedores.filter(p => p.id !== deletingProveedor.id),
                false
            )

            await deleteProveedor(deletingProveedor.id)
            setIsDeleteDialogOpen(false)
            mutateProveedores()
        } catch (error: any) {
            alert(error.message)
            mutateProveedores()
        } finally {
            setSaving(false)
        }
    }

    return (
        <PermissionGuard requiredPermission="PROVEEDOR_VER">
            <Shell>
                <div className="flex flex-col gap-4">
                    <div className="flex justify-end">
                        <PermissionGate permission="PROVEEDOR_CREAR">
                            <Button onClick={openCreateDialog}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Proveedor
                            </Button>
                        </PermissionGate>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="overflow-hidden">
                                    <CardHeader className="pb-3 bg-muted/30">
                                        <div className="flex justify-between items-start">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-2">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-36" />
                                        <Skeleton className="h-4 w-44" />
                                        <div className="pt-3 mt-2 border-t flex justify-between items-center">
                                            <Skeleton className="h-3 w-20" />
                                            <div className="flex gap-1">
                                                <Skeleton className="w-8 h-8" />
                                                <Skeleton className="w-8 h-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (!proveedores || proveedores.length === 0) ? (
                        <Card className="p-12 text-center text-muted-foreground">
                            No hay proveedores registrados
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {proveedores.map((prov) => (
                                <Card key={prov.id} className="overflow-hidden">
                                    <CardHeader className="pb-3 bg-muted/30">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{prov.nombre}</CardTitle>
                                            <Badge variant={prov.activo ? "default" : "secondary"}>
                                                {prov.activo ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-2 text-sm">
                                        {prov.contacto && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <span className="font-medium text-foreground">Contacto:</span> {prov.contacto}
                                            </div>
                                        )}
                                        {prov.telefono && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="h-4 w-4" /> {prov.telefono}
                                            </div>
                                        )}
                                        {prov.email && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="h-4 w-4" /> {prov.email}
                                            </div>
                                        )}
                                        {prov.direccion && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-4 w-4" /> {prov.direccion}
                                            </div>
                                        )}
                                        <div className="pt-3 mt-2 border-t flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">Productos: {prov._count?.productos || 0}</span>
                                            <div className="flex gap-1">
                                                <PermissionGate permission="PROVEEDOR_EDITAR">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(prov)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </PermissionGate>
                                                <PermissionGate permission="PROVEEDOR_ELIMINAR">
                                                    <Button variant="ghost" size="icon" onClick={() => confirmDelete(prov)} disabled={(prov._count?.productos || 0) > 0}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </PermissionGate>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProveedor ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
                            <DialogDescription>
                                {editingProveedor ? "Modifica los datos del proveedor" : "Ingresa los datos del nuevo proveedor"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre *</Label>
                                <Input id="nombre" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contacto">Contacto</Label>
                                <Input id="contacto" value={formData.contacto} onChange={e => setFormData({ ...formData, contacto: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono</Label>
                                    <Input id="telefono" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="direccion">Dirección</Label>
                                <Input id="direccion" value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSubmit} disabled={saving || !formData.nombre}>
                                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {editingProveedor ? "Guardar Cambios" : "Crear Proveedor"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el proveedor "{deletingProveedor?.nombre}".
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
