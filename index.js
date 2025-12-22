// =======================
// Cargar variables de entorno
// =======================
require('dotenv').config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const cors = require("cors");

// =======================
// VALIDACIÓN DE ENV
// =======================
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL no está definida");
  process.exit(1);
}

// =======================
// APP & PRISMA
// =======================
const app = express();
const prisma = new PrismaClient();

// =======================
// MIDDLEWARES
// =======================
app.use(cors());
app.use(bodyParser.json());

// =======================
// ENDPOINT: Obtener todos los turnos por fecha
// =======================
app.get('/turnos', async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.json([]);

    const turnos = await prisma.turno.findMany({
      where: { fecha: new Date(fecha) },
      orderBy: { hora: 'asc' },
    });

    res.json(turnos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener turnos" });
  }
});

// =======================
// ENDPOINT: Reservar un turno
// =======================
app.post('/reservar', async (req, res) => {
  try {
    const { nombre, servicio, fecha, hora } = req.body;

    if (!nombre || !servicio || !fecha || !hora) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    // Buscar turno existente
    const turnoExistente = await prisma.turno.findFirst({
      where: { fecha: new Date(fecha), hora }
    });

    if (!turnoExistente) {
      return res.status(404).json({ mensaje: "Turno no encontrado" });
    }

    if (!turnoExistente.disponible) {
      return res.status(400).json({ mensaje: "Turno ya ocupado" });
    }

    // Actualizar el turno
    await prisma.turno.update({
      where: { id: turnoExistente.id },
      data: {
        disponible: false,
        nombre,
        servicio
      }
    });

    res.json({ mensaje: "Turno reservado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al reservar turno" });
  }
});

// =======================
// ENDPOINT: Cancelar un turno
// =======================
app.post('/cancelar', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) return res.status(400).json({ mensaje: "ID requerido" });

    const turno = await prisma.turno.update({
      where: { id: Number(id) },
      data: {
        disponible: true,
        nombre: "",
        servicio: ""
      }
    });

    res.json({ mensaje: "Turno cancelado", turno });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al cancelar turno" });
  }
});

// =======================
// INICIAR SERVIDOR
// =======================
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('🚀 API de turnos ViaggioStyle funcionando'));
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
