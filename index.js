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
app.use(cors()); // Para que puedas conectar con tu frontend si está en otra URL

// =======================
// ENDPOINT: Obtener todos los turnos por fecha
// =======================
app.get('/turnos', async (req, res) => {
  try {
    const { fecha } = req.query; // obtiene ?fecha=AAAA-MM-DD
    const filtro = fecha ? { fecha: new Date(fecha) } : {};

    const turnos = await prisma.turno.findMany({
      orderBy: { fecha: 'asc' }
    });

    res.json(turnos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener turnos" });
  }
});
// =======================
// ENDPOINT: Reservar un turno
// =======================
app.post("/reservar", async (req, res) => {
  const { nombre, servicio, fecha, hora } = req.body;

  if (!nombre || !servicio || !fecha || !hora) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    const turnoExistente = await prisma.turno.findFirst({
      where: {
        fecha: new Date(fecha),
        hora,
        disponible: true,
      },
    });

    if (!turnoExistente) {
      return res.status(400).json({ message: "Turno no disponible" });
    }

    const turno = await prisma.turno.update({
      where: { id: turnoExistente.id },
      data: {
        nombre,
        servicio,
        disponible: false,
      },
    });

    res.json({ message: "Turno reservado", turno });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al reservar turno" });
  }
});

// =======================
// ENDPOINT: Cancelar un turno
// =======================
app.post("/cancelar", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "ID requerido" });
  }

  try {
    const turno = await prisma.turno.update({
      where: { id: Number(id) },
      data: {
        disponible: true,
        nombre: "",
        servicio: "",
      },
    });

    res.json({ message: "Turno cancelado", turno });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cancelar turno" });
  }
});

// =======================
// INICIAR SERVIDOR
// =======================
const PORT = process.env.PORT || 3000; // ahora toma la variable de entorno si existe 
app.get('/', (req, res) => {
  res.send('🚀 API de turnos ViaggioStyle funcionando');
});
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
