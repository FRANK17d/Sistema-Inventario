"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { User, verifyAuth } from "@/lib/api";

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    refreshProfile: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchProfile = async (currentUser: User | null = null) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const updatedUser = await verifyAuth(token);
            setUser(updatedUser);
            // Optionally update localStorage if we want to persist between reloads without network
            // But relying on network for permissions is safer for "dynamic" updates.
            localStorage.setItem("user", JSON.stringify(updatedUser));
            return updatedUser;
        } catch (error) {
            console.error("Error refreshing profile", error);
            // If checking auth failed (401), we might want to logout, but for refresh we might just fail silently
        }
    };

    useEffect(() => {
        // 1. Verificar si hay sesión al cargar
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            const savedUser = localStorage.getItem("user");

            if (token) {
                try {
                    // Validar token con backend y obtener perfil fresco
                    const userFromApi = await verifyAuth(token);
                    setUser(userFromApi);
                    localStorage.setItem("user", JSON.stringify(userFromApi));
                } catch (error) {
                    console.error("Sesión inválida o expirada", error);
                    // Fallback to saved user if API fails? Or logout?
                    // Better to logout if token is invalid.
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
        <AuthContext.Provider value={{ user, login, logout, refreshProfile: async () => { await fetchProfile(); }, loading }}>
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
