// =========================
// SCHEDULE ENGINE v2.2 (ID SYSTEM FIXED)
// =========================

const scheduleContainer = document.getElementById("scheduleContainer");

let currentLiveCard = null;
let lastFocusedCard = null;

let userHasInteracted = false;
let initialAutoScrollDone = false;

/* =========================
   PROGRAMS MAP (NEW)
========================= */

let programsMap = {};

async function loadPrograms() {
  try {
    const res = await fetch('/data/programs.json');
    const data = await res.json();

    programsMap = {};

    data.programs.forEach(p => {
      programsMap[p.id] = p;
    });

  } catch (err) {
    console.error("Error cargando programs:", err);
  }
}

/* =========================
   HELPERS
========================= */

function normalizeDay(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

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

/* =========================
   NEXT PROGRAM DETECTOR
========================= */

function getNextProgramCard() {
  const todayKey = normalizeDay(getTodayName());
  const now = getCurrentMinutes();

  let nextCard = null;
  let minDiff = Infinity;

  document.querySelectorAll(".day-block").forEach(block => {
    const title = block.querySelector(".day-title");
    if (!title) return;

    const dayName = normalizeDay(title.textContent);

    if (dayName !== todayKey) return;

    block.querySelectorAll(".schedule-card").forEach(card => {
      const timeText = card.querySelector(".card-time")?.textContent;
      if (!timeText) return;

      const [start] = timeText.split(" - ");
      const startMin = timeToMinutes(start);

      const diff = startMin - now;

      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        nextCard = card;
      }
    });
  });

  return nextCard;
}

function scrollToTodayBlock() {
  const todayKey = normalizeDay(getTodayName());

  document.querySelectorAll(".day-block").forEach(block => {
    const title = block.querySelector(".day-title");
    if (!title) return;

    const dayName = normalizeDay(title.textContent);

    if (dayName === todayKey) {
      block.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
}
/* =========================
   LIVE DETECTOR
========================= */

function updateLiveStatus() {
  const todayKey = normalizeDay(getTodayName());
  const nowMinutes = getCurrentMinutes();

  currentLiveCard = null;

  document.querySelectorAll(".day-block").forEach(block => {
    const title = block.querySelector(".day-title");
    if (!title) return;

    const dayName = normalizeDay(title.textContent);

    if (dayName !== todayKey) return;

    block.querySelectorAll(".schedule-card").forEach(card => {

      const timeText = card.querySelector(".card-time")?.textContent;
      if (!timeText) return;

      const clean = timeText.replace(/\s+/g, " ").trim();
      const [start, end] = clean.split("-").map(t => t.trim());

      if (!start || !end) return;

      const startMin = timeToMinutes(start);
      const endMin = timeToMinutes(end);

      if (nowMinutes >= startMin && nowMinutes < endMin) {
        card.classList.add("live-now", "radio-active");
        currentLiveCard = card;

// limpiar otros activos
document.querySelectorAll(".radio-active").forEach(c => {
  if (c !== card) c.classList.remove("radio-active");
});
         
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
}

/* =========================
   SCROLL ENGINE
========================= */

function focusCard(card) {
  if (!card) return;

  const rect = card.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  const offsetTop =
    rect.top + scrollTop - window.innerHeight / 2 + rect.height / 2;

  window.scrollTo({
    top: offsetTop,
    behavior: "smooth"
  });

  const row = card.closest(".day-row");

  if (row) {
    const cardOffset = card.offsetLeft;
    const cardWidth = card.offsetWidth;
    const rowWidth = row.scrollWidth;
    const rowVisibleWidth = row.clientWidth;

    const scrollLeft = Math.min(
      Math.max(cardOffset - rowVisibleWidth / 2 + cardWidth / 2, 0),
      rowWidth - rowVisibleWidth
    );

    row.scrollTo({
      left: scrollLeft,
      behavior: "smooth"
    });
  }
}

/* =========================
   FOCUS ENGINE
========================= */

function runFocusEngine(force = false) {
  let targetCard = null;

  if (currentLiveCard) {
    targetCard = currentLiveCard;
  } else {
    targetCard = getNextProgramCard();
  }

  if (!targetCard) return;

  // 🚫 evitar molestar al usuario
  if (!force && userHasInteracted) return;

  if (!force && targetCard === lastFocusedCard) return;

  // 📍 primero asegurar día visible
  if (!initialAutoScrollDone) {
  setTimeout(() => {
    scrollToTodayBlock();
  }, 100);
  initialAutoScrollDone = true;
}

  // 🎯 luego centrar card
  focusCard(targetCard);

  lastFocusedCard = targetCard;
}

/* =========================
   RENDER
========================= */

async function loadAndRenderSchedule() {
  try {
    const res = await fetch('/data/schedule.json');
    const data = await res.json();

    renderSchedule(data);

    setTimeout(() => {
      updateLiveStatus();
      runFocusEngine(true);
    }, 600);

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
      empty.classList.add("schedule-card", "empty-card");
      empty.textContent = "Sin programación";
      row.appendChild(empty);
    } else {
      programs.forEach(program => {
        const card = document.createElement("div");
        card.classList.add("schedule-card");

        const programInfo = programsMap[program.id];

        card.innerHTML = `
  <div class="card-time">${program.start} - ${program.end}</div>

  <div class="card-title">
    ${programInfo?.name || program.id}
  </div>
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

  const programInfo = programsMap[program.id];

  body.innerHTML = `
  <h2>${programInfo?.name || program.id}</h2>

  <p><strong>${program.start} - ${program.end}</strong></p>

  <p>${programInfo?.description || ""}</p>
`;

  modal.classList.add("show");
}

/* =========================
   INIT
========================= */

createModal();

async function init() {
  await loadPrograms();
  await loadAndRenderSchedule();
}

init();

["scroll", "touchstart", "wheel"].forEach(evt => {
  window.addEventListener(evt, () => {
    userHasInteracted = true;
  }, { passive: true });
});

setInterval(() => {
  updateLiveStatus();
  runFocusEngine(false);
}, 30000);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    updateLiveStatus();
    runFocusEngine(false);
  }
});
