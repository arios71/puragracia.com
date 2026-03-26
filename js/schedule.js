// js/schedule.js

const scheduleContainer = document.getElementById("scheduleContainer");

async function loadAndRenderSchedule() {
  try {
    const res = await fetch('/data/schedule.json');
    const data = await res.json();

    renderSchedule(data);
  } catch (err) {
    console.error("Error cargando schedule:", err);
  }
}

function isLiveNow(start, end, dayIndex) {
  const now = new Date();

  if (now.getDay() !== dayIndex) return false;

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startTime = new Date();
  startTime.setHours(sh, sm, 0);

  const endTime = new Date();
  endTime.setHours(eh, em, 0);

  return now >= startTime && now <= endTime;
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

  days.forEach((dayName, index) => {
    const key = keyMap[dayName];
    const programs = data[key] || [];

    const dayBlock = document.createElement("div");
    dayBlock.classList.add("day-block");

    const title = document.createElement("div");
    title.classList.add("day-title");
    title.textContent = dayName;

    const row = document.createElement("div");
    row.classList.add("day-row");

    if (programs.length === 0) {
      const empty = document.createElement("div");
      empty.classList.add("schedule-card", "empty-card");
      empty.textContent = "Sin programación";
      row.appendChild(empty);
    } else {
      programs.forEach(program => {

        const isLive = isLiveNow(program.start, program.end, index);

        const card = document.createElement("div");
        card.classList.add("schedule-card");

        if (isLive) card.classList.add("live-now");

        card.innerHTML = `
          <div class="card-time">${program.start} - ${program.end}</div>
          <div class="card-title">${program.name}</div>
          ${isLive ? `<div class="live-badge">EN VIVO AHORA</div>` : ""}
        `;

        row.appendChild(card);
      });
    }

    dayBlock.appendChild(title);
    dayBlock.appendChild(row);

    scheduleContainer.appendChild(dayBlock);
  });
}

// INIT
loadAndRenderSchedule();
