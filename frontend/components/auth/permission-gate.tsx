"use client"

import { useAuth } from "@/components/providers/auth-provider"

interface PermissionGateProps {
    children: React.ReactNode
    permission: string
}

export function PermissionGate({ children, permission }: PermissionGateProps) {
    const { user } = useAuth()

    if (!user) return null
    if (user.permisos?.includes(permission)) return <>{children}</>

    return null
}
