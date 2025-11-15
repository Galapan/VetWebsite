// Variables globales
let allAppointments = [];
let currentFilter = "all";

// Cargar citas al iniciar
document.addEventListener("DOMContentLoaded", async () => {
  await loadAppointments();
  setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
  // Búsqueda
  document
    .getElementById("search-input")
    .addEventListener("input", filterAppointments);

  // Filtro de estado
  document.getElementById("status-filter").addEventListener("change", (e) => {
    currentFilter = e.target.value;
    filterAppointments();
  });
}

// Cargar citas desde el backend
async function loadAppointments() {
  try {
    const response = await fetch("/api/appointments");
    const data = await response.json();

    if (response.ok) {
      allAppointments = data.data;
      updateStats();
      renderAppointments(allAppointments);
    } else {
      showError("Error al cargar las citas");
    }
  } catch (error) {
    console.error("Error:", error);
    showError("Error de conexión con el servidor");
  }
}

// Actualizar estadísticas
function updateStats() {
  const total = allAppointments.length;
  const pending = allAppointments.filter((a) => a.status === "pending").length;
  const confirmed = allAppointments.filter(
    (a) => a.status === "confirmed"
  ).length;
  const canceled = allAppointments.filter(
    (a) => a.status === "canceled"
  ).length;

  document.getElementById("total-appointments").textContent = total;
  document.getElementById("pending-appointments").textContent = pending;
  document.getElementById("confirmed-appointments").textContent = confirmed;
  document.getElementById("canceled-appointments").textContent = canceled;
}

// Filtrar citas
function filterAppointments() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();

  let filtered = allAppointments;

  // Filtrar por estado
  if (currentFilter !== "all") {
    filtered = filtered.filter((a) => a.status === currentFilter);
  }

  // Filtrar por búsqueda
  if (searchTerm) {
    filtered = filtered.filter(
      (a) =>
        a.owner_name.toLowerCase().includes(searchTerm) ||
        a.pet_name.toLowerCase().includes(searchTerm) ||
        a.preferred_date.includes(searchTerm) ||
        a.email.toLowerCase().includes(searchTerm)
    );
  }

  renderAppointments(filtered);
}

// Renderizar citas en la tabla
function renderAppointments(appointments) {
  const tbody = document.getElementById("appointments-table");

  if (appointments.length === 0) {
    tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-12">
              <i class="fa-solid fa-calendar-xmark text-4xl text-gray-300 mb-3"></i>
              <p class="text-gray-500">No se encontraron citas</p>
            </td>
          </tr>
        `;
    return;
  }

  tbody.innerHTML = appointments
    .map(
      (appointment) => `
        <tr data-id="${appointment.id}">
          <td>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-user text-gray-400"></i>
              <span class="font-medium text-gray-900">${
                appointment.owner_name
              }</span>
            </div>
          </td>
          <td>
            <div>
              <div class="font-medium text-gray-900">${
                appointment.pet_name
              }</div>
              <div class="text-xs text-gray-500">${appointment.pet_type}</div>
            </div>
          </td>
          <td>${formatService(appointment.service_requested)}</td>
          <td>
            <div>
              <div class="font-medium text-gray-900">${formatDate(
                appointment.preferred_date
              )}</div>
              <div class="text-xs text-gray-500">${
                appointment.preferred_time
              }</div>
            </div>
          </td>
          <td>
            <div>
              <div class="text-gray-900">${appointment.phone}</div>
              <div class="text-xs text-gray-500">${appointment.email}</div>
            </div>
          </td>
          <td>
            ${getStatusBadge(appointment.status)}
          </td>
          <td>
            <div class="flex gap-2">
              ${
                appointment.status !== "confirmed"
                  ? `<button onclick="updateStatus('${appointment.id}', 'confirmed')" class="action-btn btn-confirm">
                  Confirmar
                </button>`
                  : `<button onclick="updateStatus('${appointment.id}', 'pending')" class="action-btn btn-pending">
                  Pendiente
                </button>`
              }
              ${
                appointment.status !== "canceled"
                  ? `<button onclick="updateStatus('${appointment.id}', 'canceled')" class="action-btn btn-cancel">
                  Cancelar
                </button>`
                  : ""
              }
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

// Actualizar estado de cita
async function updateStatus(id, newStatus) {
  try {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      await loadAppointments();
      showSuccess(
        `Cita ${
          newStatus === "confirmed"
            ? "confirmada"
            : newStatus === "pending"
            ? "marcada como pendiente"
            : "cancelada"
        } exitosamente`
      );
    } else {
      showError("Error al actualizar el estado");
    }
  } catch (error) {
    console.error("Error:", error);
    showError("Error de conexión");
  }
}

// Helpers
function getStatusBadge(status) {
  const badges = {
    confirmed:
      '<span class="status-badge status-confirmed"><i class="fa-solid fa-check-circle"></i> Confirmada</span>',
    pending:
      '<span class="status-badge status-pending"><i class="fa-solid fa-clock"></i> Pendiente</span>',
    canceled:
      '<span class="status-badge status-canceled"><i class="fa-solid fa-times-circle"></i> Cancelada</span>',
  };
  return badges[status] || badges.pending;
}

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatService(service) {
  const services = {
    chequeo_regular: "Chequeo Regular",
    vacunacion: "Vacunación",
    emergencia: "Emergencia",
    dental: "Cuidado Dental",
    acicalamiento: "Acicalamiento",
  };
  return services[service] || service;
}

function showSuccess(message) {
  alert(message);
}

function showError(message) {
  alert(message);
}
