"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login as apiLogin, LoginCredentials } from "@/lib/api";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

// 1. Esquema de validación Zod (Frontend)
const loginSchema = z.object({
    email: z.string().email({ message: "Ingresa un correo electrónico válido." }),
    password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    // 2. Inicializar formulario
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        setLoading(true);
        try {
            const data = await apiLogin(values);
            login(data.token, data.usuario);
        } catch (error: any) {
            toast.error("Error de Autenticación", {
                description: error.message,
                className: "bg-destructive text-destructive-foreground",
            });
            // Opcional: enfocar el campo de contraseña si falla
            form.setValue("password", "");
            form.setFocus("password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50/50 dark:bg-zinc-900/50 px-4">
            {/* Fondo decorativo sutil */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-zinc-950 [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-20"></div>

            <Card className="w-full max-w-sm shadow-xl border-t-4 border-t-primary animate-in fade-in zoom-in duration-300">
                <CardHeader className="text-center space-y-2 pb-6">
                    <div className="flex justify-center mb-4">
                        <div className="h-20 w-20 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center p-4 border transition-transform hover:scale-105 duration-300">
                            <img src="/abasto-logo.svg" alt="Abasto Logo" className="h-full w-full object-contain" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Bienvenido</CardTitle>
                    <CardDescription className="text-balance">
                        Ingresa tus credenciales para acceder a la plataforma de gestión.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="admin@abasto.com"
                                                    className="pl-9 transition-all focus-visible:ring-2 focus-visible:ring-primary/50"
                                                    {...field}
                                                />
                                            </div>
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
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="password"
                                                    placeholder="••••••"
                                                    className="pl-9 transition-all focus-visible:ring-2 focus-visible:ring-primary/50"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button className="w-full font-semibold h-10 mt-6 shadow-md hover:shadow-lg transition-all" type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Autenticando...
                                    </>
                                ) : (
                                    "Iniciar Sesión"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center pb-6">
                    <p className="text-xs text-center text-muted-foreground px-4">
                        &copy; {new Date().getFullYear()} Sistema Abasto. Acceso restringido solo a personal autorizado.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
