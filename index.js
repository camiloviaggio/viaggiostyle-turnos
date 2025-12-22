require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// =======================
// HEALTH CHECK
// =======================
app.get('/', (req, res) => {
  res.send('🚀 API de turnos ViaggioStyle funcionando');
});

// =======================
// OBTENER TURNOS POR FECHA
// =======================
app.get('/turnos', async (req, res) => {
  const { fecha } = req.query;

  if (!fecha) {
    return res.status(400).json({ message: 'Fecha requerida' });
  }

  try {
    const turnos = await prisma.turno.findMany({
      where: { fecha },
      orderBy: { hora: 'asc' }
    });

    res.json(turnos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener turnos' });
  }
});

// =======================
// RESERVAR TURNO
// =======================
app.post('/reservar', async (req, res) => {
  const { nombre, servicio, fecha, hora } = req.body;

  if (!nombre || !servicio || !fecha || !hora) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  try {
    const existente = await prisma.turno.findFirst({
      where: { fecha, hora }
    });

    if (existente && !existente.disponible) {
      return res.status(409).json({ message: 'Turno ya ocupado' });
    }

    if (existente) {
      await prisma.turno.update({
        where: { id: existente.id },
        data: {
          disponible: false,
          nombre,
          servicio
        }
      });
    } else {
      await prisma.turno.create({
        data: {
          fecha,
          hora,
          nombre,
          servicio,
          disponible: false
        }
      });
    }

    res.json({ message: 'Turno reservado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al reservar turno' });
  }
});

// =======================
// CANCELAR TURNO
// =======================
app.post('/cancelar', async (req, res) => {
  const { id } = req.body;

  try {
    await prisma.turno.update({
      where: { id },
      data: {
        disponible: true,
        nombre: '',
        servicio: ''
      }
    });

    res.json({ message: 'Turno cancelado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cancelar turno' });
  }
});

// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
