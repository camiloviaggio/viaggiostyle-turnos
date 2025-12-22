require('dotenv').config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("🚀 API de turnos ViaggioStyle funcionando");
});

/* =========================
   OBTENER TURNOS (ADMIN)
========================= */
app.get("/turnos", async (req, res) => {
  try {
    const turnos = await prisma.turno.findMany({
      orderBy: [
        { fecha: "asc" },
        { hora: "asc" }
      ]
    });

    res.json(turnos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener turnos" });
  }
});

/* =========================
   RESERVAR TURNO
========================= */
app.post("/reservar", async (req, res) => {
  const { nombre, servicio, fecha, hora } = req.body;

  // Validaciones duras (esto evita undefined)
  if (!nombre || !servicio || !fecha || !hora) {
    return res.status(400).json({
      error: "Faltan datos obligatorios"
    });
  }

  try {
    // Verificar si ya existe turno ocupado
    const existente = await prisma.turno.findFirst({
      where: {
        fecha: new Date(fecha),
        hora,
        disponible: false
      }
    });

    if (existente) {
      return res.status(400).json({
        error: "Turno ya ocupado"
      });
    }

    // Crear turno REAL
    await prisma.turno.create({
      data: {
        nombre,
        servicio,
        fecha: new Date(fecha),
        hora,
        disponible: false
      }
    });

    res.json({
      mensaje: "Turno reservado correctamente"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al reservar turno"
    });
  }
});

/* =========================
   INICIAR SERVIDOR
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
