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

function renderSchedule(data) {
  const days = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

  // Mapeo de nombres visibles → keys del JSON
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

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {

    const dayName = days[dayIndex];
    const key = keyMap[dayName];

    // 🔥 aquí está el cambio clave
    const programs = data[key] || [];

    const dayBlock = document.createElement("div");
    dayBlock.classList.add("day-block");

    const title = document.createElement("h3");
    title.textContent = dayName;

    dayBlock.appendChild(title);

    if (programs.length === 0) {
      const empty = document.createElement("div");
      empty.classList.add("schedule-item");
      empty.textContent = "Sin programación";
      dayBlock.appendChild(empty);
    } else {
      programs.forEach(program => {
        const item = document.createElement("div");
        item.classList.add("schedule-item");

        item.innerHTML = `
          <strong>${program.name}</strong><br>
          ${program.start} - ${program.end}
        `;

        dayBlock.appendChild(item);
      });
    }

    scheduleContainer.appendChild(dayBlock);
  }
}

loadAndRenderSchedule();
