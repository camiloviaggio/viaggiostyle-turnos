-- CreateTable
CREATE TABLE "Turno" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "servicio" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);
