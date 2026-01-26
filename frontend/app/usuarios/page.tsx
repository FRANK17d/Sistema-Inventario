"use client"

import { useState } from "react"
import { useUsuarios, useRoles } from "@/hooks/use-data"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, User as UserIcon } from "lucide-react"
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
} from "@/components/ui/dialog"
import { UserForm } from "@/components/usuarios/user-form"
import { Usuario, deleteUsuario } from "@/lib/api"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Shell } from "@/components/dashboard/shell"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { PermissionGate } from "@/components/auth/permission-gate"
import { useAuth } from "@/components/providers/auth-provider"

export default function UsuariosPage() {
    const { usuarios, isLoading, mutate } = useUsuarios()
    const { roles } = useRoles() // Para mapear rolId a nombre si es necesario
    const { refreshProfile } = useAuth()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<Usuario | undefined>(undefined)

    const handleDelete = async (id: number) => {
        if (confirm("¿Estás seguro de eliminar este usuario?")) {
            try {
                await deleteUsuario(id)
                toast.success("Usuario eliminado")
                mutate()
                refreshProfile()
            } catch (error) {
                toast.error("No se pudo eliminar el usuario")
            }
        }
    }

    const openEdit = (user: Usuario) => {
        setSelectedUser(user)
        setIsDialogOpen(true)
    }

    const openCreate = () => {
        setSelectedUser(undefined)
        setIsDialogOpen(true)
    }

    const getRoleName = (rolId: number) => {
        return roles?.find(r => r.id === rolId)?.nombre || "Desconocido"
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
        <PermissionGuard requiredPermission="USUARIO_VER">
            <Shell>
                <div className="container mx-auto py-10 px-4 md:px-8 max-w-7xl animate-in fade-in slide-in-from-bottom duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Usuarios
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Administra los usuarios del sistema y sus roles asignados.
                            </p>
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <PermissionGate permission="USUARIO_CREAR">
                                <Button onClick={openCreate} className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                                    <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
                                </Button>
                            </PermissionGate>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>{selectedUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
                                    <DialogDescription>
                                        {selectedUser ? "Actualiza la información del usuario." : "Registra un nuevo usuario en el sistema."}
                                    </DialogDescription>
                                </DialogHeader>
                                <UserForm
                                    userToEdit={selectedUser}
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
                                    <TableHead className="w-[300px]">Usuario</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead className="text-right w-[100px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usuarios?.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-muted/5 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border border-border">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                                                    <AvatarFallback>{user.nombre.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {user.nombre}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={getRoleName(user.rolId) === "ADMIN" ? "default" : "secondary"} className="rounded-md">
                                                {getRoleName(user.rolId)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <PermissionGate permission="USUARIO_EDITAR">
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                                                        <Pencil className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                </PermissionGate>
                                                <PermissionGate permission="USUARIO_ELIMINAR">
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
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
