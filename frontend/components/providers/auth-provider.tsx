"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { User, verifyAuth } from "@/lib/api";

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // 1. Verificar si hay sesión al cargar
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            const savedUser = localStorage.getItem("user");

            if (token && savedUser) {
                try {
                    // Validar token con backend
                    await verifyAuth(token);
                    setUser(JSON.parse(savedUser));
                } catch (error) {
                    console.error("Sesión inválida o expirada", error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    useEffect(() => {
        // 2. Proteger rutas
        if (!loading) {
            const isLoginPage = pathname === "/login";
            const isPublic = isLoginPage; // Agregar otras rutas públicas si existen

            if (!user && !isPublic) {
                router.push("/login"); // Redirigir a login si no hay usuario
            } else if (user && isLoginPage) {
                router.push("/"); // Redirigir a home si ya está logueado e intenta ir a login
            }
        }
    }, [user, loading, pathname, router]);


    const login = (token: string, userData: User) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        toast.success(`Bienvenido de nuevo, ${userData.nombre}`);
        router.push("/");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        toast.info("Sesión cerrada correctamente");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
