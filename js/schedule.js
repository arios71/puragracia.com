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

  scheduleContainer.innerHTML = "";

  Object.keys(data).forEach(dayIndex => {
    const dayName = days[dayIndex];
    const programs = data[dayIndex];

    const dayBlock = document.createElement("div");
    dayBlock.classList.add("day-block");

    const title = document.createElement("h3");
    title.textContent = dayName;

    dayBlock.appendChild(title);

    programs.forEach(program => {
      const item = document.createElement("div");
      item.classList.add("schedule-item");

      item.innerHTML = `
        <strong>${program.name}</strong><br>
        ${program.start} - ${program.end}
      `;

      dayBlock.appendChild(item);
    });

    scheduleContainer.appendChild(dayBlock);
  });
}

loadAndRenderSchedule();
