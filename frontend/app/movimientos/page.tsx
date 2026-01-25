"use client"

import { useState } from "react"
import { Shell } from "@/components/dashboard/shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
    createMovimiento,
    type Movimiento, type MovimientoInput
} from "@/lib/api"
import { useMovimientos, useProductos, useDashboard } from "@/hooks/use-data"
import { useSWRConfig } from "swr"

export default function MovimientosPage() {
    // SWR Hooks
    const { data: movimientos, isLoading: loading } = useMovimientos()
    const { data: productos } = useProductos()
    const { mutate } = useSWRConfig()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState<MovimientoInput>({
        productoId: 0,
        tipo: "ENTRADA",
        cantidad: 1,
        descripcion: "",
    })

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-PE', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    const getTipoBadge = (tipo: string) => {
        switch (tipo) {
            case 'ENTRADA': return <Badge className="bg-success hover:bg-success/90"><ArrowDownLeft className="h-3 w-3 mr-1" /> Entrada</Badge>
            case 'SALIDA': return <Badge variant="destructive"><ArrowUpRight className="h-3 w-3 mr-1" /> Salida</Badge>
            case 'AJUSTE': return <Badge className="bg-warning hover:bg-warning/90"><RefreshCw className="h-3 w-3 mr-1" /> Ajuste</Badge>
            default: return <Badge variant="outline">{tipo}</Badge>
        }
    }

    const openCreateDialog = () => {
        setFormData({
            productoId: productos?.[0]?.id || 0,
            tipo: "ENTRADA",
            cantidad: 1,
            descripcion: "",
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        setSaving(true)
        try {
            await createMovimiento(formData)

            // Revalidate all data affected by movement
            mutate('/movimientos') // Reload movements
            mutate('/productos')   // Reload products (stock changed)
            mutate('/dashboard')   // Reload dashboard stats

            setIsDialogOpen(false)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setSaving(false)
        }
    }

    const selectedProduct = productos?.find(p => p.id === formData.productoId)

    return (
        <Shell>
            <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                    <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Registrar Movimiento
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Movimientos ({movimientos?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Producto</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead className="text-right">Cantidad</TableHead>
                                            <TableHead className="hidden md:table-cell">Descripción</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[...Array(10)].map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-36 mb-1" />
                                                    <Skeleton className="h-3 w-20" />
                                                </TableCell>
                                                <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                                                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Producto</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead className="text-right">Cantidad</TableHead>
                                            <TableHead className="hidden md:table-cell">Descripción</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {!movimientos || movimientos.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No hay movimientos registrados
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            movimientos.map((mov) => (
                                                <TableRow key={mov.id}>
                                                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                                                        {formatDate(mov.createdAt)}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {mov.producto?.nombre || `ID: ${mov.productoId}`}
                                                        <span className="block text-xs text-muted-foreground">
                                                            {mov.producto?.codigo}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>{getTipoBadge(mov.tipo)}</TableCell>
                                                    <TableCell className="text-right font-bold text-lg">
                                                        {mov.tipo === 'ENTRADA' ? '+' : mov.tipo === 'SALIDA' ? '-' : ''}{mov.cantidad}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground max-w-xs truncate hidden md:table-cell">
                                                        {mov.descripcion || '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Movement Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Registrar Movimiento</DialogTitle>
                        <DialogDescription>
                            Registra una entrada, salida o ajuste de inventario
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Producto *</Label>
                            <Select value={String(formData.productoId)} onValueChange={v => setFormData({ ...formData, productoId: parseInt(v) })}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                                <SelectContent>
                                    {productos?.map(prod => (
                                        <SelectItem key={prod.id} value={String(prod.id)}>
                                            {prod.codigo} - {prod.nombre} (Stock: {prod.stock})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedProduct && (
                                <p className="text-xs text-muted-foreground">
                                    Stock actual: <strong>{selectedProduct.stock}</strong> (Mínimo: {selectedProduct.stockMinimo})
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Movimiento *</Label>
                                <Select value={formData.tipo} onValueChange={v => setFormData({ ...formData, tipo: v as 'ENTRADA' | 'SALIDA' | 'AJUSTE' })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ENTRADA">Entrada</SelectItem>
                                        <SelectItem value="SALIDA">Salida</SelectItem>
                                        <SelectItem value="AJUSTE">Ajuste</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cantidad">Cantidad *</Label>
                                <Input
                                    id="cantidad"
                                    type="number"
                                    min="1"
                                    value={formData.cantidad}
                                    onChange={e => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-sm">
                            {formData.tipo === 'ENTRADA' && selectedProduct && (
                                <p>Stock resultante: <strong>{selectedProduct.stock + formData.cantidad}</strong></p>
                            )}
                            {formData.tipo === 'SALIDA' && selectedProduct && (
                                <p className={selectedProduct.stock - formData.cantidad < 0 ? "text-destructive" : ""}>
                                    Stock resultante: <strong>{selectedProduct.stock - formData.cantidad}</strong>
                                    {selectedProduct.stock - formData.cantidad < 0 && " (Stock insuficiente)"}
                                </p>
                            )}
                            {formData.tipo === 'AJUSTE' && (
                                <p>El stock se ajustará a: <strong>{formData.cantidad}</strong></p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descripcion">Descripción / Motivo</Label>
                            <Textarea
                                id="descripcion"
                                placeholder="Ej: Compra a proveedor, Venta, Inventario físico, etc."
                                value={formData.descripcion}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={saving || !formData.productoId || formData.cantidad < 1 || (formData.tipo === 'SALIDA' && selectedProduct && selectedProduct.stock < formData.cantidad)}
                        >
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Registrar Movimiento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Shell>
    )
}
