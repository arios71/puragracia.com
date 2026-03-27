// Navegación del menú (BOTTOM NAV)

const menuLinks = document.querySelectorAll('.nav-item[data-section]');

menuLinks.forEach(link => {
  link.addEventListener('click', () => {

    const target = link.getAttribute('data-section');

    // ocultar secciones
    document.querySelectorAll('.section').forEach(sec => {
      sec.classList.remove('active');
    });

    // mostrar sección
    const section = document.getElementById(target);
    if (section) section.classList.add('active');

    // activar botón
    menuLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// estado inicial
document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('inicio').classList.add('active');

  const first = document.querySelector('.nav-item[data-section="inicio"]');
  if (first) first.classList.add('active');
});
