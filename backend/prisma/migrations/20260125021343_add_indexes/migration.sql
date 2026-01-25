-- CreateIndex
CREATE INDEX "Movimiento_productoId_idx" ON "Movimiento"("productoId");

-- CreateIndex
CREATE INDEX "Movimiento_tipo_idx" ON "Movimiento"("tipo");

-- CreateIndex
CREATE INDEX "Movimiento_createdAt_idx" ON "Movimiento"("createdAt");

-- CreateIndex
CREATE INDEX "Producto_categoriaId_idx" ON "Producto"("categoriaId");

-- CreateIndex
CREATE INDEX "Producto_proveedorId_idx" ON "Producto"("proveedorId");

-- CreateIndex
CREATE INDEX "Producto_activo_idx" ON "Producto"("activo");

-- CreateIndex
CREATE INDEX "Producto_stock_idx" ON "Producto"("stock");

-- CreateIndex
CREATE INDEX "Proveedor_activo_idx" ON "Proveedor"("activo");
