// Lubripoint Booking Logic with Vehicle & Oil Selects, 40min Slots, and Local Database

// Data catalog for vehicles (Cars & Motorcycles)
const VEHICLE_DATA = {
  Carro: {
    Chevrolet: ["Spark / Spark GT", "Sail", "Onix", "Tracker", "Cruze", "Captiva", "D-Max", "Aveo", "Optra", "Otro"],
    Renault: ["Sandero / Stepway", "Logan", "Duster", "Kwid", "Clio", "Captur", "Koleos", "Megane", "Oroch", "Otro"],
    Mazda: ["Mazda 2", "Mazda 3", "Mazda 6", "CX-30", "CX-5", "CX-50", "CX-9", "Allegro", "BT-50", "Otro"],
    Toyota: ["Corolla / Corolla Cross", "Hilux", "Prado / TXL", "Fortuner", "Yaris", "Rav4", "Land Cruiser", "Otro"],
    Kia: ["Picanto", "Rio", "Cerato", "Sportage", "Seltos", "Soul", "Sorento", "Otro"],
    Hyundai: ["i10 / Grand i10", "Accent", "Tucson", "Creta", "Elantra", "Santa Fe", "Otro"],
    Nissan: ["Versa", "March", "Kicks", "Frontier / Navara", "Sentra", "Qashqai", "X-Trail", "Otro"],
    Ford: ["Fiesta", "EcoSport", "Escape", "Ranger", "Explorer", "Focus", "Otro"],
    Volkswagen: ["Gol", "Voyage", "Polo", "Jetta", "T-Cross", "Tiguan", "Amarok", "Otro"],
    Suzuki: ["Swift", "Vitara / Grand Vitara", "Jimny", "S-Cross", "Alto", "Celerio", "Otro"],
    BMW: ["Serie 1", "Serie 3", "X1", "X3", "X5", "Otro"],
    MercedesBenz: ["Clase A", "Clase C", "GLA", "GLC", "Otro"],
    Otro: ["Otro modelo"]
  },
  Moto: {
    Yamaha: ["FZ 16 / 2.0 / 25", "NMAX 155", "Crypton", "MT-03", "MT-07 / 09", "XTZ 125 / 150 / 250", "R15 / R3", "BWS 125", "Otro"],
    Bajaj: ["Pulsar NS 200 / 160", "Pulsar 180 / 220", "Boxer CT 100", "Dominar 400 / 250", "Discover 125", "Platina 100", "Otro"],
    Honda: ["CB 125F / 160F / 190R", "Wave 110", "XR 150L / 190L", "XRE 300", "Navi", "Dio 110", "CB 500X", "Otro"],
    Suzuki: ["Gixxer 150 / 250", "GN 125", "AX 4 / 100", "DR 150 / 650", "Burgman", "V-Strom 250 / 650", "Otro"],
    AKT: ["NKD 125", "CR4 125 / 162", "TT Dual Sport 200", "Dynamic Pro 125", "Special 110", "Vortex 300", "Otro"],
    KTM: ["Duke 200 / 250 / 390", "RC 200 / 390", "Adventure 250 / 390", "Otro"],
    TVS: ["Apache RTR 160 / 180 / 200", "Stryker 125", "NTORQ 125", "Raider 125", "Otro"],
    Hero: ["Eco Deluxe", "Splendor", "Hunk 160R", "XPulse 200", "Otro"],
    Kymco: ["Agility 125 / RS / Naked", "Twist 125", "Downtown 300", "Otro"],
    BMW: ["G 310 R / GS", "F 750 / 850 GS", "R 1250 GS", "Otro"],
    Otro: ["Otro modelo"]
  }
};

let currentStep = 1;

document.addEventListener('DOMContentLoaded', () => {
  initVehicleTypeSelection();
  populateYears();
  populateBrands();
  initVehicleSelectListeners();
  initOilPreferencesListeners();
  initServiceSelection();
  initDateConstraints();
  generate40MinTimeSlots();
  initFormSubmit();
  loadAppointmentsCount();
  checkCookieConsent();
});

// 1. Populates Years dropdown (2026 to 1995 + "Anterior a 1995")
function populateYears() {
  const yearSelect = document.getElementById('yearSelect');
  if (!yearSelect) return;

  const currentYear = new Date().getFullYear();
  yearSelect.innerHTML = '<option value="">Selecciona el año...</option>';
  
  for (let y = currentYear + 1; y >= 1995; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    if (y === 2021) opt.selected = true; // default helpful
    yearSelect.appendChild(opt);
  }

  const optOlder = document.createElement('option');
  optOlder.value = 'Anterior a 1995';
  optOlder.textContent = '1994 o anterior';
  yearSelect.appendChild(optOlder);
}

// 2. Populate Brands according to Vehicle Type (Carro / Moto)
function populateBrands() {
  const brandSelect = document.getElementById('brandSelect');
  const type = document.querySelector('input[name="vehicleType"]:checked')?.value || 'Carro';
  if (!brandSelect) return;

  const brands = Object.keys(VEHICLE_DATA[type] || {});
  brandSelect.innerHTML = '<option value="">Selecciona la marca...</option>';

  brands.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    opt.textContent = b === 'Otro' ? 'Otra marca (Escribir)' : b;
    brandSelect.appendChild(opt);
  });

  // Reset models
  populateModels('');
}

// 3. Populate Models according to selected Brand
function populateModels(brand) {
  const modelSelect = document.getElementById('modelSelect');
  const customModelGroup = document.getElementById('customModelGroup');
  const type = document.querySelector('input[name="vehicleType"]:checked')?.value || 'Carro';
  if (!modelSelect) return;

  if (!brand || !VEHICLE_DATA[type] || !VEHICLE_DATA[type][brand]) {
    modelSelect.innerHTML = '<option value="">Selecciona primero la marca...</option>';
    if (customModelGroup) customModelGroup.style.display = 'none';
    return;
  }

  const models = VEHICLE_DATA[type][brand];
  modelSelect.innerHTML = '<option value="">Selecciona la línea / modelo...</option>';

  models.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m === 'Otro' ? 'Otro modelo (Escribir)' : m;
    modelSelect.appendChild(opt);
  });
}

// Listeners for Vehicle Selection and "Otro" manual input
function initVehicleSelectListeners() {
  const brandSelect = document.getElementById('brandSelect');
  const modelSelect = document.getElementById('modelSelect');
  const customBrandGroup = document.getElementById('customBrandGroup');
  const customBrandInput = document.getElementById('customBrand');
  const customModelGroup = document.getElementById('customModelGroup');
  const customModelInput = document.getElementById('customModel');

  brandSelect.addEventListener('change', () => {
    const val = brandSelect.value;
    if (val === 'Otro') {
      customBrandGroup.style.display = 'flex';
      customBrandInput.required = true;
      populateModels('Otro');
      customModelGroup.style.display = 'flex';
      customModelInput.required = true;
    } else {
      customBrandGroup.style.display = 'none';
      customBrandInput.required = false;
      populateModels(val);
    }
  });

  modelSelect.addEventListener('change', () => {
    const val = modelSelect.value;
    if (val === 'Otro') {
      customModelGroup.style.display = 'flex';
      customModelInput.required = true;
      customModelInput.focus();
    } else {
      if (brandSelect.value !== 'Otro') {
        customModelGroup.style.display = 'none';
        customModelInput.required = false;
      }
    }
  });
}

// Listeners for Oil Viscosity & Brand "OTRO" manual inputs
function initOilPreferencesListeners() {
  const viscositySelect = document.getElementById('oilViscositySelect');
  const customViscosityGroup = document.getElementById('customViscosityGroup');
  const customViscosityInput = document.getElementById('customViscosity');

  const oilBrandSelect = document.getElementById('oilBrandSelect');
  const customOilBrandGroup = document.getElementById('customOilBrandGroup');
  const customOilBrandInput = document.getElementById('customOilBrand');

  viscositySelect.addEventListener('change', () => {
    if (viscositySelect.value === 'OTRO') {
      customViscosityGroup.style.display = 'flex';
      customViscosityInput.required = true;
      customViscosityInput.focus();
    } else {
      customViscosityGroup.style.display = 'none';
      customViscosityInput.required = false;
    }
  });

  oilBrandSelect.addEventListener('change', () => {
    if (oilBrandSelect.value === 'OTRO') {
      customOilBrandGroup.style.display = 'flex';
      customOilBrandInput.required = true;
      customOilBrandInput.focus();
    } else {
      customOilBrandGroup.style.display = 'none';
      customOilBrandInput.required = false;
    }
  });
}

// Vehicle Type switch (Carro / Moto)
function initVehicleTypeSelection() {
  const typeCards = document.querySelectorAll('.type-card');
  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      typeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      populateBrands();
    });
  });
}

// Service Selection visual cards
function initServiceSelection() {
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      serviceCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });
}

// Set Minimum Date to Today
function initDateConstraints() {
  const dateInput = document.getElementById('appointmentDate');
  if (!dateInput) return;
  
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1;
  let dd = today.getDate();

  if (mm < 10) mm = '0' + mm;
  if (dd < 10) dd = '0' + dd;

  const minDate = `${yyyy}-${mm}-${dd}`;
  dateInput.min = minDate;
  dateInput.value = minDate;
}

// Generate Time Slots strictly every 40 minutes (9:20 AM to 6:00 PM)
function generate40MinTimeSlots() {
  const container = document.getElementById('timeSlotsContainer');
  if (!container) return;

  // Turnos continuos de 40 minutos entre 9:20 AM y 6:00 PM:
  // 09:20 AM, 10:00 AM, 10:40 AM, 11:20 AM, 12:00 PM, 12:40 PM,
  // 01:20 PM, 02:00 PM, 02:40 PM, 03:20 PM, 04:00 PM, 04:40 PM, 05:20 PM (finaliza 6:00 PM)
  const times = [
    "09:20 AM", "10:00 AM", "10:40 AM", "11:20 AM",
    "12:00 PM", "12:40 PM", "01:20 PM", "02:00 PM",
    "02:40 PM", "03:20 PM", "04:00 PM", "04:40 PM",
    "05:20 PM"
  ];

  container.innerHTML = '';
  times.forEach((timeStr, idx) => {
    const isChecked = idx === 0 ? 'checked' : '';
    const label = document.createElement('label');
    label.className = 'slot-pill';
    label.innerHTML = `
      <input type="radio" name="timeSlot" value="${timeStr}" ${isChecked}>
      <span>${timeStr}</span>
    `;
    container.appendChild(label);
  });
}

// Wizard Step Navigation
function goToStep(step) {
  if (step > currentStep) {
    if (!validateCurrentStep(currentStep)) {
      return;
    }
  }

  if (step === 4) {
    updateSummary();
  }

  document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
  const targetStepEl = document.getElementById(`step${step}`);
  if (targetStepEl) {
    targetStepEl.classList.add('active');
  }

  updateStepperUI(step);
  currentStep = step;
  window.scrollTo({ top: 80, behavior: 'smooth' });
}

function updateStepperUI(activeStep) {
  const stepItems = document.querySelectorAll('.step-item');
  const stepLines = document.querySelectorAll('.step-line');

  stepItems.forEach((item, index) => {
    const stepNum = index + 1;
    item.classList.remove('active', 'completed');
    if (stepNum === activeStep) {
      item.classList.add('active');
    } else if (stepNum < activeStep) {
      item.classList.add('completed');
    }
  });

  stepLines.forEach((line, index) => {
    if (index + 1 < activeStep) {
      line.classList.add('completed');
    } else {
      line.classList.remove('completed');
    }
  });
}

function validateCurrentStep(step) {
  if (step === 1) {
    const brandSelect = document.getElementById('brandSelect');
    const modelSelect = document.getElementById('modelSelect');
    const yearSelect = document.getElementById('yearSelect');
    const customBrandInput = document.getElementById('customBrand');
    const customModelInput = document.getElementById('customModel');

    if (!brandSelect.value) {
      alert('Por favor selecciona la marca de tu vehículo.');
      brandSelect.focus();
      return false;
    }
    if (brandSelect.value === 'Otro' && !customBrandInput.value.trim()) {
      alert('Por favor escribe la marca de tu vehículo.');
      customBrandInput.focus();
      return false;
    }
    if (!modelSelect.value) {
      alert('Por favor selecciona la línea / modelo de tu vehículo.');
      modelSelect.focus();
      return false;
    }
    if (modelSelect.value === 'Otro' && !customModelInput.value.trim()) {
      alert('Por favor escribe el modelo de tu vehículo.');
      customModelInput.focus();
      return false;
    }
    if (!yearSelect.value) {
      alert('Por favor selecciona el año de tu vehículo.');
      yearSelect.focus();
      return false;
    }
  }

  if (step === 2) {
    const viscSelect = document.getElementById('oilViscositySelect');
    const customVisc = document.getElementById('customViscosity');
    const brandSelect = document.getElementById('oilBrandSelect');
    const customBrand = document.getElementById('customOilBrand');

    if (viscSelect.value === 'OTRO' && !customVisc.value.trim()) {
      alert('Por favor especifica el calibre / viscosidad de aceite deseado.');
      customVisc.focus();
      return false;
    }
    if (brandSelect.value === 'OTRO' && !customBrand.value.trim()) {
      alert('Por favor especifica la marca de aceite deseada.');
      customBrand.focus();
      return false;
    }
  }

  if (step === 3) {
    const date = document.getElementById('appointmentDate');
    if (!date.value) {
      alert('Por favor, selecciona una fecha para tu cita.');
      date.focus();
      return false;
    }
  }

  return true;
}

// Reflect inputs in Step 4 Summary
function updateSummary() {
  const vehicleType = document.querySelector('input[name="vehicleType"]:checked')?.value || 'Carro';
  
  const brandVal = document.getElementById('brandSelect').value;
  const brand = brandVal === 'Otro' ? document.getElementById('customBrand').value : brandVal;

  const modelVal = document.getElementById('modelSelect').value;
  const model = modelVal === 'Otro' ? document.getElementById('customModel').value : modelVal;

  const year = document.getElementById('yearSelect').value;
  const plateVal = document.getElementById('plate').value.trim();
  const plate = plateVal ? plateVal.toUpperCase() : 'Sin registrar';

  const service = document.querySelector('input[name="servicePackage"]:checked')?.value || '-';

  // Oil Details
  const viscVal = document.getElementById('oilViscositySelect').value;
  const viscosity = viscVal === 'OTRO' ? document.getElementById('customViscosity').value : viscVal;

  const oilBrandVal = document.getElementById('oilBrandSelect').value;
  const oilBrand = oilBrandVal === 'OTRO' ? document.getElementById('customOilBrand').value : oilBrandVal;

  const date = document.getElementById('appointmentDate')?.value || '';
  const time = document.querySelector('input[name="timeSlot"]:checked')?.value || '';
  const branch = document.getElementById('branch')?.value || '';

  // DOM update
  document.getElementById('summaryVehicleType').textContent = vehicleType;
  document.getElementById('summaryPlate').textContent = plate;
  document.getElementById('summaryVehicle').textContent = `${brand} ${model} (${year})`;
  document.getElementById('summaryService').textContent = service;
  document.getElementById('summaryOil').textContent = `${viscosity} - ${oilBrand}`;
  document.getElementById('summaryDateTime').textContent = `${date} | ${time} (${branch})`;
}

// Form Submission handling & Database LocalStorage Saving
function initFormSubmit() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim() || 'No suministrado';

    if (!fullName || !phone) {
      alert('Por favor ingresa tu nombre y teléfono para confirmar.');
      return;
    }

    const brandVal = document.getElementById('brandSelect').value;
    const brand = brandVal === 'Otro' ? document.getElementById('customBrand').value : brandVal;

    const modelVal = document.getElementById('modelSelect').value;
    const model = modelVal === 'Otro' ? document.getElementById('customModel').value : modelVal;

    const viscVal = document.getElementById('oilViscositySelect').value;
    const viscosity = viscVal === 'OTRO' ? document.getElementById('customViscosity').value : viscVal;

    const oilBrandVal = document.getElementById('oilBrandSelect').value;
    const oilBrand = oilBrandVal === 'OTRO' ? document.getElementById('customOilBrand').value : oilBrandVal;

    const appointment = {
      id: 'LP-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      client: fullName,
      phone: phone,
      email: email,
      vehicleType: document.querySelector('input[name="vehicleType"]:checked')?.value,
      brand: brand,
      model: model,
      year: document.getElementById('yearSelect').value,
      plate: document.getElementById('plate').value.trim().toUpperCase() || 'Sin registrar',
      mileage: document.getElementById('mileage').value.trim() || 'No especificado',
      service: document.querySelector('input[name="servicePackage"]:checked')?.value,
      oilViscosity: viscosity,
      oilBrand: oilBrand,
      observations: document.getElementById('observations').value.trim() || 'Ninguna',
      branch: document.getElementById('branch').value,
      date: document.getElementById('appointmentDate').value,
      time: document.querySelector('input[name="timeSlot"]:checked')?.value
    };

    // Save to Local Database (LocalStorage)
    saveAppointmentToStorage(appointment);

    // Trigger celebratory confetti effect
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff6b00', '#ff8c33', '#ffffff', '#10b981']
      });
    }

    // Trigger sweet toast
    if (typeof Swal === 'function') {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#0f131a',
        color: '#ffffff'
      });
      Toast.fire({
        icon: 'success',
        title: '¡Cita agendada con éxito!'
      });
    }

    renderSuccessScreen(appointment);
  });
}

function saveAppointmentToStorage(appointment) {
  try {
    const list = JSON.parse(localStorage.getItem('lubripoint_appointments') || '[]');
    list.unshift(appointment);
    localStorage.setItem('lubripoint_appointments', JSON.stringify(list));
    loadAppointmentsCount();
  } catch (err) {
    console.error('Error saving appointment:', err);
  }
}

function loadAppointmentsCount() {
  const list = JSON.parse(localStorage.getItem('lubripoint_appointments') || '[]');
  const btn = document.querySelector('.btn-admin-view');
  if (btn) {
    btn.innerHTML = `<i class="fa-solid fa-clipboard-list"></i> Panel Citas Taller (${list.length})`;
  }
}

function renderSuccessScreen(data) {
  document.getElementById('bookingForm').style.display = 'none';

  const ticket = document.getElementById('ticketDetails');
  ticket.innerHTML = `
    <div class="ticket-row">
      <span class="ticket-label">Turno / Código:</span>
      <span class="ticket-val" style="color: var(--primary); font-size: 1.1rem; font-weight: 800;">#${data.id}</span>
    </div>
    <div class="ticket-row">
      <span class="ticket-label">Cliente:</span>
      <span class="ticket-val">${data.client} (${data.phone})</span>
    </div>
    <div class="ticket-row">
      <span class="ticket-label">Vehículo:</span>
      <span class="ticket-val">${data.vehicleType} ${data.brand} ${data.model} - ${data.year}</span>
    </div>
    <div class="ticket-row">
      <span class="ticket-label">Placa:</span>
      <span class="ticket-val" style="color: var(--primary);">${data.plate}</span>
    </div>
    <div class="ticket-row">
      <span class="ticket-label">Servicio:</span>
      <span class="ticket-val">${data.service}</span>
    </div>
    <div class="ticket-row">
      <span class="ticket-label">Aceite Solicitado:</span>
      <span class="ticket-val" style="color: #38bdf8;">${data.oilViscosity} (${data.oilBrand})</span>
    </div>
    <div class="ticket-row">
      <span class="ticket-label">Fecha y Horario:</span>
      <span class="ticket-val" style="color: var(--accent-success);">${data.date} | ${data.time}</span>
    </div>
    <div class="ticket-row">
      <span class="ticket-label">Sede:</span>
      <span class="ticket-val">${data.branch}</span>
    </div>
    ${data.observations !== 'Ninguna' ? `
    <div class="ticket-row">
      <span class="ticket-label">Observaciones:</span>
      <span class="ticket-val" style="font-style: italic;">${data.observations}</span>
    </div>` : ''}
  `;

  // WhatsApp Message Formatter for Workshop
  const msg = 
`🔔 *NUEVA CITA AGENDADA - LUBRIPOINT* 🔔%0A` +
`*Código:* %23${data.id}%0A` +
`*Cliente:* ${encodeURIComponent(data.client)} (${encodeURIComponent(data.phone)})%0A` +
`*Vehículo:* ${encodeURIComponent(data.vehicleType)} ${encodeURIComponent(data.brand)} ${encodeURIComponent(data.model)} (${encodeURIComponent(data.year)})%0A` +
`*Placa:* ${encodeURIComponent(data.plate)}%0A` +
`*Servicio:* ${encodeURIComponent(data.service)}%0A` +
`*Aceite:* ${encodeURIComponent(data.oilViscosity)} - ${encodeURIComponent(data.oilBrand)}%0A` +
`*Fecha:* ${encodeURIComponent(data.date)} | ${encodeURIComponent(data.time)}%0A` +
`*Sede:* ${encodeURIComponent(data.branch)}%0A` +
`*Observaciones:* ${encodeURIComponent(data.observations)}`;

  const waBtn = document.getElementById('btnWhatsAppConfirm');
  waBtn.href = `https://api.whatsapp.com/send?text=${msg}`;

  const successScreen = document.getElementById('successScreen');
  successScreen.style.display = 'block';

  document.querySelectorAll('.step-item').forEach(item => item.classList.add('completed'));
  document.querySelectorAll('.step-line').forEach(line => line.classList.add('completed'));
}

function resetForm() {
  document.getElementById('bookingForm').reset();
  document.getElementById('bookingForm').style.display = 'block';
  document.getElementById('successScreen').style.display = 'none';
  populateBrands();
  goToStep(1);
}

// Workshop Admin View Modal
function toggleAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal.style.display === 'none' || !modal.style.display) {
    renderAdminTable();
    modal.style.display = 'flex';
  } else {
    modal.style.display = 'none';
  }
}

function renderAdminTable() {
  const list = JSON.parse(localStorage.getItem('lubripoint_appointments') || '[]');
  const tbody = document.getElementById('appointmentsTableBody');
  
  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-table-msg">
            <i class="fa-solid fa-calendar-xmark"></i>
            <p>No hay citas agendadas todavía.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(item => `
    <tr>
      <td><strong style="color: var(--primary);">#${item.id}</strong></td>
      <td><strong>${item.date}</strong><br><small style="color: var(--accent-success);">${item.time}</small></td>
      <td><strong>${item.client}</strong><br><small>${item.phone}</small></td>
      <td>${item.vehicleType} ${item.brand} ${item.model} (${item.year})</td>
      <td><span style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-weight:700;">${item.plate}</span></td>
      <td>${item.service}<br><small style="color: #38bdf8;">${item.oilViscosity} - ${item.oilBrand}</small></td>
      <td>
        <a href="https://api.whatsapp.com/send?phone=${encodeURIComponent(item.phone)}&text=Hola%20${encodeURIComponent(item.client)},%20te%20escribimos%20de%20Lubripoint%20para%20confirmar%20tu%20cita%20del%20${encodeURIComponent(item.date)}%20a%20las%20${encodeURIComponent(item.time)}" target="_blank" class="btn btn-whatsapp" style="padding: 0.35rem 0.65rem; font-size: 0.76rem;">
          <i class="fa-brands fa-whatsapp"></i> Chat
        </a>
      </td>
    </tr>
  `).join('');
}

function clearAllAppointments() {
  if (typeof Swal === 'function') {
    Swal.fire({
      title: '¿Vaciar registros de prueba?',
      text: 'Se eliminarán todas las citas almacenadas localmente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#30363d',
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar',
      background: '#0f131a',
      color: '#ffffff'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('lubripoint_appointments');
        renderAdminTable();
        loadAppointmentsCount();
        Swal.fire({
          title: '¡Registros vaciados!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#0f131a',
          color: '#ffffff'
        });
      }
    });
  } else {
    if (confirm('¿Deseas vaciar todas las citas de prueba registradas?')) {
      localStorage.removeItem('lubripoint_appointments');
      renderAdminTable();
      loadAppointmentsCount();
    }
  }
}

// Add interactive Ripple animation on buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn, .btn-admin-view');
  if (!btn) return;

  const circle = document.createElement('span');
  const diameter = Math.max(btn.clientWidth, btn.clientHeight);
  const radius = diameter / 2;

  const rect = btn.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - rect.left - radius}px`;
  circle.style.top = `${e.clientY - rect.top - radius}px`;
  circle.classList.add('ripple');

  const existingRipple = btn.querySelector('.ripple');
  if (existingRipple) {
    existingRipple.remove();
  }

  btn.appendChild(circle);
  setTimeout(() => circle.remove(), 600);
});

// ========================================================
// LEGAL COMPLIANCE: COOKIE BANNER & HABEAS DATA MODALS
// ========================================================
function checkCookieConsent() {
  const consent = localStorage.getItem('lubripoint_cookies_accepted');
  const banner = document.getElementById('cookieBanner');
  if (!consent && banner) {
    setTimeout(() => {
      banner.style.display = 'block';
    }, 600);
  }
}

function acceptCookies() {
  localStorage.setItem('lubripoint_cookies_accepted', 'true');
  const banner = document.getElementById('cookieBanner');
  if (banner) {
    banner.style.display = 'none';
  }
}

const LEGAL_DOCS = {
  privacy: {
    title: '<i class="fa-solid fa-user-shield"></i> Política de Privacidad & Tratamiento de Datos Personales',
    subtitle: 'Cumplimiento con la Ley 1581 de 2012 y Decreto 1377 de 2013 (Habeas Data)',
    content: `
      <h4>1. Responsable del Tratamiento</h4>
      <p><strong>LUBRIPOINT S.A.S.</strong>, establecimiento de comercio dedicado a servicios de mantenimiento y lubricación automotriz, garantiza la reserva y confidencialidad de la información suministrada por sus clientes.</p>
      
      <h4>2. Finalidad de la Recolección de Datos</h4>
      <p>Los datos solicitados en este formulario (Nombre, Teléfono, Correo, Datos del Vehículo y Placa) son recolectados con las siguientes finalidades legítimas:</p>
      <ul>
        <li><strong>Gestión de Turnos y Citas:</strong> Reservar la bahía de servicio y alistar el lubricante y filtros correspondientes.</li>
        <li><strong>Contacto Operativo:</strong> Notificar el estado de la cita, avisar cuando el vehículo esté listo o gestionar imprevistos en taller.</li>
        <li><strong>Historial Técnico:</strong> Registrar el historial de lubricación para recomendar la viscosidad y frecuencia idónea según fabricante.</li>
        <li><strong>Comunicaciones Comerciales (Opcional):</strong> Remitir avisos preventivos de próximo kilometraje y ofertas exclusivas, únicamente cuando el usuario lo autorice.</li>
      </ul>

      <div class="legal-highlight-box">
        <strong>Compromiso de No Cesión:</strong> Lubripoint <u>nunca</u> vende, comercializa ni transfiere tus datos personales a empresas de terceros ni plataformas publicitarias ajenas.
      </div>

      <h4>3. Derechos del Titular (Habeas Data)</h4>
      <p>De acuerdo con la legislación vigente, todo usuario tiene derecho a:</p>
      <ul>
        <li>Conocer, actualizar y rectificar sus datos personales.</li>
        <li>Solicitar prueba de la autorización otorgada.</li>
        <li>Ser informado sobre el uso que se le ha dado a sus datos.</li>
        <li>Revocar la autorización o solicitar la supresión de sus datos de nuestras bases cuando no exista un deber legal de permanencia.</li>
      </ul>
      <p>Para ejercer estos derechos, el titular puede contactar directamente a la administración de Lubripoint a través de WhatsApp o en cualquiera de nuestras sedes.</p>
    `
  },
  terms: {
    title: '<i class="fa-solid fa-file-contract"></i> Términos y Condiciones del Servicio',
    subtitle: 'Condiciones generales de agendamiento y atención en taller',
    content: `
      <h4>1. Naturaleza de la Cita</h4>
      <p>El agendamiento web reserva un turno de atención preferencial en la bahía de servicio de Lubripoint durante el bloque horario seleccionado (40 minutos promedio).</p>

      <h4>2. Tiempo de Espera y Tolerancia</h4>
      <p>Agradecemos presentarse <strong>5 a 10 minutos antes</strong> de la hora acordada. En caso de retrasos superiores a 15 minutos, el taller podrá reasignar el turno al orden de llegada para no afectar la agenda de los demás clientes.</p>

      <h4>3. Diagnóstico y Repuestos</h4>
      <ul>
        <li>Los aceites y filtros suministrados por Lubripoint cumplen con estándares de calidad API, ACEA e ILSAC certificados por fabricantes.</li>
        <li>Si durante la inspección técnica se detecta alguna fuga preexistente, desgaste severo o anomalía ajena al servicio contratado, el técnico informará al cliente antes de proceder.</li>
      </ul>

      <div class="legal-highlight-box">
        <strong>Inspección de Seguridad:</strong> Lubripoint no se hace responsable por objetos de alto valor dejados dentro del habitáculo del vehículo no declarados al momento del ingreso.
      </div>
    `
  },
  cookies: {
    title: '<i class="fa-solid fa-cookie-bite"></i> Política de Cookies & Almacenamiento Local',
    subtitle: 'Transparencia sobre el uso de tecnologías de almacenamiento en tu dispositivo',
    content: `
      <h4>1. ¿Qué información almacenamos?</h4>
      <p>Este sitio web <strong>no utiliza cookies invasivas de rastreo de terceros</strong> para perfilamiento publicitario masivo ni venta de datos.</p>
      
      <h4>2. Almacenamiento Técnico Esencial (LocalStorage)</h4>
      <p>Hacemos uso de tecnologías de almacenamiento seguro del navegador (LocalStorage) para:</p>
      <ul>
        <li><strong>Persistencia de la Reserva:</strong> Recordar temporalmente los datos del vehículo y fecha mientras completas los 4 pasos del formulario.</li>
        <li><strong>Registro de Cita:</strong> Almacenar el comprobante de cita en tu dispositivo para que puedas consultarlo al llegar al taller.</li>
        <li><strong>Preferencia de Consentimiento:</strong> Guardar tu confirmación de lectura de este aviso para no mostrártelo repetidamente.</li>
      </ul>

      <div class="legal-highlight-box">
        Puedes borrar o deshabilitar estas cookies o datos de sesión en cualquier momento desde la configuración de privacidad de tu navegador.
      </div>
    `
  }
};

function openLegalModal(docType) {
  const doc = LEGAL_DOCS[docType] || LEGAL_DOCS.privacy;
  const modal = document.getElementById('legalModal');
  const title = document.getElementById('legalModalTitle');
  const subtitle = document.getElementById('legalModalSubtitle');
  const body = document.getElementById('legalModalBody');

  if (modal && title && body) {
    title.innerHTML = doc.title;
    if (subtitle) subtitle.textContent = doc.subtitle;
    body.innerHTML = doc.content;
    modal.style.display = 'flex';
  }
}

function closeLegalModal() {
  const modal = document.getElementById('legalModal');
  if (modal) modal.style.display = 'none';
}

