// js/schedule.js

const scheduleContainer = document.getElementById("scheduleContainer");

let currentLiveCard = null;

/* =========================
   HELPERS
========================= */

// Convierte "14:30" → minutos
function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Obtiene hora actual en minutos
function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// Día actual en español
function getTodayName() {
  const days = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  return days[new Date().getDay()];
}

/* =========================
   RENDER
========================= */

async function loadAndRenderSchedule() {
  try {
    const res = await fetch('/data/schedule.json');
    const data = await res.json();

    renderSchedule(data);

  } catch (err) {
    console.error("Error cargando schedule:", err);
  }
}

function renderSchedule(data) {

  const days = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

  const keyMap = {
    "Domingo": "domingo",
    "Lunes": "lunes",
    "Martes": "martes",
    "Miércoles": "miércoles",
    "Jueves": "jueves",
    "Viernes": "viernes",
    "Sábado": "sábado"
  };

  const todayKey = getTodayName();
  const nowMinutes = getCurrentMinutes();

  scheduleContainer.innerHTML = "";

  days.forEach(dayName => {

    const key = keyMap[dayName];
    const programs = data[key] || [];

    // ===== DAY BLOCK =====
    const dayBlock = document.createElement("div");
    dayBlock.classList.add("day-block");

    // Título
    const title = document.createElement("div");
    title.classList.add("day-title");
    title.textContent = dayName;

    // Highlight día actual
    if (key === todayKey) {
      title.classList.add("today");
    }

    dayBlock.appendChild(title);

    // Row horizontal
    const row = document.createElement("div");
    row.classList.add("day-row");

    if (programs.length === 0) {
      const empty = document.createElement("div");
      empty.classList.add("schedule-card","empty-card");
      empty.textContent = "Sin programación";
      row.appendChild(empty);
    } else {

      programs.forEach(program => {

        const start = timeToMinutes(program.start);
        const end = timeToMinutes(program.end);

        const card = document.createElement("div");
        card.classList.add("schedule-card");

        // Detectar EN VIVO
        if (key === todayKey && nowMinutes >= start && nowMinutes < end) {
          card.classList.add("live-now");

          currentLiveCard = card;

          const badge = document.createElement("div");
          badge.classList.add("live-badge");
          badge.textContent = "EN VIVO";
          card.appendChild(badge);
        }

        card.innerHTML += `
          <div class="card-time">${program.start} - ${program.end}</div>
          <div class="card-title">${program.name}</div>
        `;

        // 🪟 MODAL
        card.addEventListener("click", () => openModal(program));

        row.appendChild(card);

      });
    }

    dayBlock.appendChild(row);
    scheduleContainer.appendChild(dayBlock);
  });

  // ⚡ AUTO-SCROLL
  setTimeout(() => {
    if (currentLiveCard) {
      currentLiveCard.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center"
      });
    }
  }, 400);
}

/* =========================
   MODAL
========================= */

function createModal() {

  const modal = document.createElement("div");
  modal.id = "scheduleModal";

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn">&times;</span>
      <div class="modal-body"></div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".close-btn").onclick = () => {
    modal.classList.remove("show");
  };

  modal.onclick = (e) => {
    if (e.target.id === "scheduleModal") {
      modal.classList.remove("show");
    }
  };
}

function openModal(program) {
  const modal = document.getElementById("scheduleModal");
  const body = modal.querySelector(".modal-body");

  body.innerHTML = `
    <h2>${program.name}</h2>
    <p>${program.start} - ${program.end}</p>
  `;

  modal.classList.add("show");
}

/* =========================
   SYNC CON NOWPLAYING
========================= */

function syncNowPlaying(title) {
  if (!title) return;

  const cards = document.querySelectorAll(".schedule-card");

  cards.forEach(card => {
    const text = card.innerText.toLowerCase();

    if (text.includes(title.toLowerCase())) {
      card.classList.add("playing-now");
    } else {
      card.classList.remove("playing-now");
    }
  });
}

// Hook global (lo usas desde nowplaying.js)
window.syncNowPlaying = syncNowPlaying;

/* =========================
   INIT
========================= */

createModal();
loadAndRenderSchedule();
