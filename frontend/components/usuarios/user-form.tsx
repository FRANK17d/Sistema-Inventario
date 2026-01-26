"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createUsuario, updateUsuario, Usuario } from "@/lib/api"
import { useRoles, useUsuarios } from "@/hooks/use-data"
import { toast } from "sonner"

const formSchema = z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().optional(),
    rolId: z.coerce.number().min(1, "Selecciona un rol"),
})

interface UserFormProps {
    userToEdit?: Usuario
    onSuccess: () => void
    onCancel: () => void
}

export function UserForm({ userToEdit, onSuccess, onCancel }: UserFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { mutate } = useUsuarios()
    const { roles } = useRoles()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: userToEdit?.nombre || "",
            email: userToEdit?.email || "",
            password: "",
            rolId: userToEdit?.rolId || 0,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            if (userToEdit) {
                // If password is empty, don't send it
                const dataToUpdate = { ...values }
                if (!values.password) delete dataToUpdate.password

                await updateUsuario(userToEdit.id, dataToUpdate)
                toast.success("Usuario actualizado correctamente")
            } else {
                if (!values.password) {
                    toast.error("La contraseña es obligatoria para nuevos usuarios")
                    setIsSubmitting(false)
                    return
                }
                await createUsuario(values)
                toast.success("Usuario creado correctamente")
            }
            mutate()
            onSuccess()
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar el usuario")
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
                            <FormLabel>Nombre Completo</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Juan Pérez" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="juan@ejemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{userToEdit ? "Contraseña (Opcional)" : "Contraseña"}</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder={userToEdit ? "Dejar en blanco para mantener actual" : "********"} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="rolId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rol</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value ? String(field.value) : undefined} value={field.value ? String(field.value) : undefined}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un rol" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {roles?.map(rol => (
                                        <SelectItem key={rol.id} value={String(rol.id)}>
                                            {rol.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Guardando..." : userToEdit ? "Actualizar" : "Crear"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
