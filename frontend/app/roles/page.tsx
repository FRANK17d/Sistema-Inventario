"use client"

import { useState } from "react"
import { useRoles } from "@/hooks/use-data"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Shield } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"
import { RoleForm } from "@/components/roles/role-form"
import { Rol, deleteRol } from "@/lib/api"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Shell } from "@/components/dashboard/shell"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { PermissionGate } from "@/components/auth/permission-gate"
import { useAuth } from "@/components/providers/auth-provider"

export default function RolesPage() {
    const { roles, isLoading, mutate } = useRoles()
    const { refreshProfile } = useAuth()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<Rol | undefined>(undefined)

    const handleDelete = async (id: number) => {
        if (confirm("¿Estás seguro de eliminar este rol?")) {
            try {
                await deleteRol(id)
                toast.success("Rol eliminado")
                mutate()
                refreshProfile()
            } catch (error) {
                toast.error("No se pudo eliminar el rol")
            }
        }
    }

    const openEdit = (rol: Rol) => {
        setSelectedRole(rol)
        setIsDialogOpen(true)
    }

    const openCreate = () => {
        setSelectedRole(undefined)
        setIsDialogOpen(true)
    }

    if (isLoading) {
        return <div className="p-8 space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-[400px] w-full" />
        </div>
    }

    return (
        <PermissionGuard requiredPermission="ROL_VER">
            <Shell>
                <div className="container mx-auto py-10 px-4 md:px-8 max-w-7xl animate-in fade-in slide-in-from-bottom duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Roles y Permisos
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Gestiona los roles de usuario y sus niveles de acceso al sistema.
                            </p>
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <PermissionGate permission="ROL_CREAR">
                                <Button onClick={openCreate} className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                                    <Plus className="mr-2 h-4 w-4" /> Nuevo Rol
                                </Button>
                            </PermissionGate>
                            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{selectedRole ? "Editar Rol" : "Crear Nuevo Rol"}</DialogTitle>
                                    <DialogDescription>
                                        {selectedRole ? "Modifica los permisos del rol." : "Define un nuevo rol y sus permisos."}
                                    </DialogDescription>
                                </DialogHeader>
                                <RoleForm
                                    roleToEdit={selectedRole}
                                    onSuccess={() => {
                                        setIsDialogOpen(false)
                                        refreshProfile()
                                    }}
                                    onCancel={() => setIsDialogOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[200px]">Nombre</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-center w-[100px]">Usuarios</TableHead>
                                    <TableHead className="text-center w-[100px]">Permisos</TableHead>
                                    <TableHead className="text-right w-[150px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles?.map((rol) => (
                                    <TableRow key={rol.id} className="hover:bg-muted/5 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                    <Shield className="h-4 w-4" />
                                                </div>
                                                {rol.nombre}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{rol.descripcion || "Sin descripción"}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="font-mono">
                                                {rol._count?.usuarios || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="font-mono">
                                                {rol.permisos.length}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <PermissionGate permission="ROL_EDITAR">
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(rol)}>
                                                        <Pencil className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                </PermissionGate>
                                                <PermissionGate permission="ROL_ELIMINAR">
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(rol.id)} disabled={rol.nombre === "ADMIN"}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </PermissionGate>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </Shell>
        </PermissionGuard>
    )
}
