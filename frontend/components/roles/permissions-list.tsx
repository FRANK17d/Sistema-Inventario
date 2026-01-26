"use client"

import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePermisos } from "@/hooks/use-data"
import { Skeleton } from "@/components/ui/skeleton"

interface PermissionsListProps {
    selected: number[]
    onChange: (selected: number[]) => void
}

export function PermissionsList({ selected, onChange }: PermissionsListProps) {
    const { permisos, isLoading } = usePermisos()
    const [groupedPermisos, setGroupedPermisos] = useState<Record<string, typeof permisos>>({})

    useEffect(() => {
        if (permisos) {
            const grouped: Record<string, typeof permisos> = {}
            permisos.forEach(p => {
                const category = p.nombre.split('_')[0]
                if (!grouped[category]) grouped[category] = []
                grouped[category]?.push(p)
            })
            setGroupedPermisos(grouped)
        }
    }, [permisos])

    const handleCheck = (id: number, checked: boolean) => {
        if (checked) {
            onChange([...selected, id])
        } else {
            onChange(selected.filter(p => p !== id))
        }
    }

    if (isLoading) return <Skeleton className="h-[200px] w-full" />

    if (!permisos || permisos.length === 0) return <div>No hay permisos disponibles.</div>

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(groupedPermisos).map(([category, items]) => (
                <Card key={category} className="shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium capitalize">{category.toLowerCase()}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        {items?.map(permiso => (
                            <div key={permiso.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`permiso-${permiso.id}`}
                                    checked={selected.includes(permiso.id)}
                                    onCheckedChange={(c) => handleCheck(permiso.id, c === true)}
                                />
                                <Label htmlFor={`permiso-${permiso.id}`} className="text-sm font-normal cursor-pointer">
                                    {permiso.nombre.split('_').slice(1).join(' ').toLowerCase()}
                                </Label>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
