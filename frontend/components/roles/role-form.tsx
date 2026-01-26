"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { PermissionsList } from "./permissions-list"
import { createRol, updateRol, Rol } from "@/lib/api"
import { useRoles } from "@/hooks/use-data"
import { toast } from "sonner"

const formSchema = z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    descripcion: z.string().optional(),
    permisos: z.array(z.number()).min(1, "Selecciona al menos un permiso"),
})

interface RoleFormProps {
    roleToEdit?: Rol
    onSuccess: () => void
    onCancel: () => void
}

export function RoleForm({ roleToEdit, onSuccess, onCancel }: RoleFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { mutate } = useRoles()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: roleToEdit?.nombre || "",
            descripcion: roleToEdit?.descripcion || "",
            permisos: roleToEdit?.permisos.map(p => p.id) || [],
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            if (roleToEdit) {
                await updateRol(roleToEdit.id, values)
                toast.success("Rol actualizado correctamente")
            } else {
                await createRol(values)
                toast.success("Rol creado correctamente")
            }
            mutate()
            onSuccess()
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar el rol")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Rol</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: VENDEDOR" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Descripción opcional..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-2">
                    <FormLabel>Permisos</FormLabel>
                    <PermissionsList
                        selected={form.watch("permisos")}
                        onChange={(val) => form.setValue("permisos", val)}
                    />
                    <FormMessage>{form.formState.errors.permisos?.message}</FormMessage>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Guardando..." : roleToEdit ? "Actualizar" : "Crear"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
