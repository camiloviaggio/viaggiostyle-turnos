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
  const { fecha } = req.query;

  if (!fecha) {
    return res.status(400).json({ mensaje: "Falta la fecha" });
  }

  const inicio = new Date(fecha + "T00:00:00.000Z");
  const fin = new Date(fecha + "T23:59:59.999Z");

  const turnos = await prisma.turno.findMany({
    where: {
      fecha: {
        gte: inicio,
        lte: fin
      },
      disponible: false
    }
  });

  res.json(turnos);
});


/* =========================
   RESERVAR TURNO
========================= */
app.post("/reservar", async (req, res) => {
  const { nombre, servicio, fecha, hora } = req.body;

  if (!nombre || !servicio || !fecha || !hora) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }

  const inicio = new Date(fecha + "T00:00:00.000Z");
  const fin = new Date(fecha + "T23:59:59.999Z");

  const existente = await prisma.turno.findFirst({
    where: {
      hora,
      fecha: {
        gte: inicio,
        lte: fin
      },
      disponible: false
    }
  });

  if (existente) {
    return res.status(409).json({ mensaje: "Ese horario ya está ocupado" });
  }

  await prisma.turno.create({
    data: {
      nombre,
      servicio,
      fecha: new Date(fecha),
      hora,
      disponible: false
    }
  });

  res.json({ mensaje: "Turno reservado correctamente" });
});



/* =========================
   INICIAR SERVIDOR
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
