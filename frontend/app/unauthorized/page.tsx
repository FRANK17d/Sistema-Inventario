import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center animate-in fade-in zoom-in duration-500">
            <div className="p-6 rounded-full bg-destructive/10 text-destructive mb-6 shadow-lg shadow-destructive/20">
                <ShieldAlert className="h-16 w-16" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Acceso Denegado</h1>
            <p className="text-muted-foreground max-w-md mb-8 text-lg">
                No tienes los permisos necesarios para acceder a esta página.
                Si crees que esto es un error, contacta a tu administrador.
            </p>
            <div className="flex gap-4">
                <Button asChild variant="outline" size="lg">
                    <Link href="/">
                        Volver al Inicio
                    </Link>
                </Button>
            </div>
        </div>
    )
}
