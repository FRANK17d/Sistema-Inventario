-- CreateTable
CREATE TABLE "Historial" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalProductos" INTEGER NOT NULL,
    "stockBajo" INTEGER NOT NULL,
    "valorizacion" DECIMAL(10,2) NOT NULL,
    "valorVenta" DECIMAL(10,2) NOT NULL,
    "rentabilidad" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Historial_fecha_key" ON "Historial"("fecha");

-- CreateIndex
CREATE INDEX "Historial_fecha_idx" ON "Historial"("fecha");
