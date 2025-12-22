// =======================
// Cargar variables de entorno
// =======================
require('dotenv').config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const cors = require("cors");

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint raíz sirve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


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
    const { fecha } = req.query; // obtiene ?fecha=AAAA-MM-DD
    const filtro = fecha ? { fecha: new Date(fecha) } : {};

    const turnos = await prisma.turno.findMany({
      where: filtro,
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
app.post('/reservar', async (req, res) => {
  const { hora } = req.body;

  try {
    // Buscar si el turno ya existe
    const turnoExistente = await prisma.turno.findUnique({ where: { hora } });

    if (!turnoExistente) {
      return res.status(404).json({ error: 'Turno no existe' });
    }

    // Validar si está disponible
    if (!turnoExistente.disponible) {
      return res.status(400).json({ error: 'Turno ya ocupado' });
    }

    // Marcar como ocupado
    const turnoActualizado = await prisma.turno.update({
      where: { hora },
      data: { disponible: false }
    });

    res.json({ mensaje: 'Turno reservado correctamente', turno: turnoActualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al reservar turno' });
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
// ENDPOINT RAÍZ
// =======================
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🚀 API de turnos ViaggioStyle funcionando');
});

// =======================
// INICIAR SERVIDOR
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
