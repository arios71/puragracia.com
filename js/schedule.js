const scheduleContainer = document.getElementById("scheduleContainer");

let currentLiveCard = null;
let lastLiveCard = null;

/* =========================
   HELPERS
========================= */

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function getTodayName() {
  const days = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"]; 
  return days[new Date().getDay()];
}

function normalizeDay(str) {
  return str.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
}

/* =========================
   LOAD + RENDER
========================= */

async function loadAndRenderSchedule() {
  try {
    const res = await fetch('/data/schedule.json');
    const data = await res.json();

    renderSchedule(data);

    setTimeout(() => {
      updateLiveStatus(true);
    }, 1000);

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

  scheduleContainer.innerHTML = "";

  days.forEach(dayName => {

    const key = keyMap[dayName];
    const programs = data[key] || [];

    const dayBlock = document.createElement("div");
    dayBlock.classList.add("day-block");

    const title = document.createElement("div");
    title.classList.add("day-title");
    title.textContent = dayName;

    dayBlock.appendChild(title);

    const row = document.createElement("div");
    row.classList.add("day-row");

    if (programs.length === 0) {
      const empty = document.createElement("div");
      empty.classList.add("schedule-card","empty-card");
      empty.textContent = "Sin programación";
      row.appendChild(empty);
    } else {

      programs.forEach(program => {

        const card = document.createElement("div");
        card.classList.add("schedule-card");

        card.innerHTML = `
          <div class="card-time">${program.start} - ${program.end}</div>
          <div class="card-title">${program.name}</div>
        `;

        card.addEventListener("click", () => openModal(program));

        row.appendChild(card);
      });
    }

    dayBlock.appendChild(row);
    scheduleContainer.appendChild(dayBlock);
  });
}

/* =========================
   AUTO-SCROLL PRO REAL
========================= */

function scrollToLiveCard() {
  if (!currentLiveCard) return;

  requestAnimationFrame(() => {

    // 🔽 SCROLL VERTICAL REAL (window)
    const rect = currentLiveCard.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    const offset = rect.top + scrollTop - (window.innerHeight / 2);

    window.scrollTo({
      top: offset,
      behavior: "smooth"
    });

    // 👉 SCROLL HORIZONTAL (row)
    const row = currentLiveCard.closest(".day-row");
    if (row) {

      const cardOffset = currentLiveCard.offsetLeft;
      const cardWidth = currentLiveCard.offsetWidth;
      const rowWidth = row.offsetWidth;

      row.scrollTo({
        left: cardOffset - (rowWidth / 2) + (cardWidth / 2),
        behavior: "smooth"
      });
    }

  });
}

/* =========================
   UPDATE LIVE (INTELIGENTE)
========================= */

function updateLiveStatus(forceScroll = false) {

  const todayKey = normalizeDay(getTodayName());
  console.log("Hoy:", todayKey); // ✅ depuración

  const nowMinutes = getCurrentMinutes();

  currentLiveCard = null;

  document.querySelectorAll(".day-block").forEach(block => {

    const title = block.querySelector(".day-title");
    const dayNameNormalized = normalizeDay(title.textContent);

    const cards = block.querySelectorAll(".schedule-card");

    cards.forEach(card => {

      card.classList.remove("live-now");

      const timeText = card.querySelector(".card-time")?.textContent;
      if (!timeText) return;

      const [start, end] = timeText.split(" - ");

      const startMin = timeToMinutes(start);
      const endMin = timeToMinutes(end);

      if (dayNameNormalized === todayKey && nowMinutes >= startMin && nowMinutes < endMin) {

        card.classList.add("live-now");

        currentLiveCard = card;

        console.log("LIVE DETECTED:", card.innerText); // ✅ depuración

        // badge
        if (!card.querySelector(".live-badge")) {
          const badge = document.createElement("div");
          badge.classList.add("live-badge");
          badge.textContent = "EN VIVO";
          card.appendChild(badge);
        }

      } else {
        const badge = card.querySelector(".live-badge");
        if (badge) badge.remove();
      }

    });

  });

  // 🔥 LOG si no hay ningún programa en vivo
  if (!currentLiveCard) {
    console.log("No hay programas en vivo en este momento.");
  }

  // 🔥 SOLO hacer scroll si:
  // 1. es la primera vez
  // 2. cambió el programa en vivo
  if (currentLiveCard && (forceScroll || currentLiveCard !== lastLiveCard)) {
    scrollToLiveCard();
    lastLiveCard = currentLiveCard;
  }
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
   SYNC NOWPLAYING
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

window.syncNowPlaying = syncNowPlaying;

/* =========================
   INIT
========================= */

createModal();
loadAndRenderSchedule();

// 🔄 actualizar cada 30s (NO 60s)
setInterval(() => {
  updateLiveStatus();
}, 30000);
