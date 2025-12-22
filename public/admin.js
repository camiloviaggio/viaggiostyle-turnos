const tablaCuerpo = document.querySelector("#tablaTurnos tbody");
const mensajeDiv = document.getElementById("mensaje");
const urlBackend = "https://viaggiostyle-turnos.onrender.com/admin/turnos";

// Formatear fecha a "22 diciembre 2025"
function formatearFecha(fechaISO) {
  const opciones = { day: "numeric", month: "long", year: "numeric" };
  return new Date(fechaISO).toLocaleDateString("es-AR", opciones);
}

// Cargar turnos desde backend
async function cargarTurnos() {
  try {
    const res = await fetch(urlBackend);
    const turnos = await res.json();

    tablaCuerpo.innerHTML = "";
    mensajeDiv.textContent = "";

    if (turnos.length === 0) {
      mensajeDiv.textContent = "No hay turnos reservados";
      return;
    }

    turnos.forEach(turno => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td class="linea-oblicua">${turno.nombre}</td>
        <td>${turno.servicio}</td>
        <td>${formatearFecha(turno.fecha)}</td>
        <td>${turno.hora}</td>
      `;

      tablaCuerpo.appendChild(fila);
    });

  } catch (err) {
    console.error(err);
    mensajeDiv.textContent = "Error al cargar los turnos";
  }
}

// Ejecutar al cargar la página
cargarTurnos();
