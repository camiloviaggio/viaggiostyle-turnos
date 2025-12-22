// =======================
// ENV
// =======================
require("dotenv").config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// =======================
// GET turnos por fecha
// =======================
app.get("/turnos", async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.json([]);

    const turnos = await prisma.turno.findMany({
      where: {
        fecha: new Date(fecha),
      },
      orderBy: { hora: "asc" },
    });

    res.json(turnos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener turnos" });
  }
});

// =======================
// POST reservar turno (FIX REAL)
// =======================
app.post("/reservar", async (req, res) => {
  try {
    const { nombre, servicio, fecha, hora } = req.body;

    if (!nombre || !servicio || !fecha || !hora) {
      return res.status(400).json({ mensaje: "Datos incompletos" });
    }

    const fechaDate = new Date(fecha);

    // Buscar si el turno ya existe
    const turnoExistente = await prisma.turno.findFirst({
      where: {
        fecha: fechaDate,
        hora: hora,
      },
    });

    // Si existe y está ocupado → error
    if (turnoExistente && turnoExistente.disponible === false) {
      return res.status(400).json({ mensaje: "Turno ya ocupado" });
    }

    // Si existe y está libre → actualizar
    if (turnoExistente) {
      await prisma.turno.update({
        where: { id: turnoExistente.id },
        data: {
          disponible: false,
          nombre,
          servicio,
        },
      });

      return res.json({ mensaje: "Turno reservado correctamente" });
    }

    // Si NO existe → crear turno
    await prisma.turno.create({
      data: {
        fecha: fechaDate,
        hora,
        nombre,
        servicio,
        disponible: false,
      },
    });

    res.json({ mensaje: "Turno reservado correctamente" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al reservar turno" });
  }
});

// =======================
// POST cancelar turno
// =======================
app.post("/cancelar", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ mensaje: "ID requerido" });

    await prisma.turno.update({
      where: { id: Number(id) },
      data: {
        disponible: true,
        nombre: "",
        servicio: "",
      },
    });

    res.json({ mensaje: "Turno cancelado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al cancelar turno" });
  }
});

// =======================
// SERVER
// =======================
const PORT = process.env.PORT || 3000;
app.get("/", (_, res) =>
  res.send("🚀 API de turnos ViaggioStyle funcionando")
);
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
);
