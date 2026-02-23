// Navegación del menú
const menuLinks = document.querySelectorAll('nav a[data-section]');

menuLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();

    const target = link.getAttribute('data-section');

    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));

    // Mostrar sección seleccionada
    const section = document.getElementById(target);
    if(section) section.classList.add('active');

    // Marcar link activo
    menuLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// Activar por defecto la sección "inicio" y link activo al cargar
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('inicio').classList.add('active');
  const firstLink = document.querySelector('nav a[data-section="inicio"]');
  if(firstLink) firstLink.classList.add('active');
});