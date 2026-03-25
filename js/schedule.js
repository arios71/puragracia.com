// js/schedule.js

const scheduleContainer = document.getElementById("scheduleContainer");

async function loadAndRenderSchedule() {
  try {
    const res = await fetch('/data/schedule.json');
    const data = await res.json();

    renderScheduleCards(data);
  } catch (err) {
    console.error("Error cargando schedule:", err);
  }
}

function renderScheduleCards(data) {
  const days = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

  // Map de nombres visibles → keys del JSON
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
    const programs = data[key] || [];

    // BLOQUE DEL DÍA
    const dayBlock = document.createElement("div");
    dayBlock.classList.add("day-block");

    const title = document.createElement("h3");
    title.textContent = dayName;
    dayBlock.appendChild(title);

    // CONTENEDOR DE CARDS
    const cardsContainer = document.createElement("div");
    cardsContainer.classList.add("cards-container");

    if (programs.length === 0) {
      const empty = document.createElement("div");
      empty.classList.add("schedule-card", "empty-card");
      empty.textContent = "Sin programación";
      cardsContainer.appendChild(empty);
    } else {
      programs.forEach(program => {
        const card = document.createElement("div");
        card.classList.add("schedule-card");

        card.innerHTML = `
          <div class="card-title">${program.name}</div>
          <div class="card-time">${program.start} - ${program.end}</div>
        `;

        cardsContainer.appendChild(card);
      });
    }

    dayBlock.appendChild(cardsContainer);
    scheduleContainer.appendChild(dayBlock);
  }
}

// INIT
loadAndRenderSchedule();
