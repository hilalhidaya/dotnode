
// Elimine el sticky en el responsive de móviles por fines estéticos

window.onscroll = function () { stickyNavbar() };

function stickyNavbar() {
  var navbar = document.getElementById("navbar");
  if (window.scrollY >= 400) {
    navbar.classList.add("sticky");
  } else {
    navbar.classList.remove("sticky");
  }
}

// ANIMACION CON SCROLL 

document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
          }
      });
  });

  animatedElements.forEach(element => observer.observe(element));
});


// Validación de datos de contacto
document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const nombre = document.getElementById('nombre').value;
  const apellidos = document.getElementById('apellidos').value;
  const telefono = document.getElementById('telefono').value;
  const email = document.getElementById('email').value;
  const aceptoCondiciones = document.getElementById('acepto_condiciones').checked;

  // Validación
  if (!/^[a-zA-Z]{1,15}$/.test(nombre)) alert('Nombre inválido');
  else if (!/^[a-zA-Z\s]{1,40}$/.test(apellidos)) alert('Apellidos inválidos');
  else if (!/^\d{9}$/.test(telefono)) alert('Teléfono inválido');
  else if (!/^\S+@\S+\.\S+$/.test(email)) alert('Email inválido');
  else if (!aceptoCondiciones) alert('Debes aceptar las condiciones');
  else alert('Formulario enviado');
});

// Cálculo de presupuesto
const servicioCards = document.querySelectorAll('.presupuesto_card');
const extras = document.querySelectorAll('.extra');
const totalElement = document.getElementById('total');
const plazoInput = document.getElementById('plazo');

let total = 0;

servicioCards.forEach(card => {
card.addEventListener('click', () => {
  total = parseFloat(card.dataset.price);
  actualizarPresupuesto();
});
});

extras.forEach(extra => {
extra.addEventListener('change', () => {
  actualizarPresupuesto();
});
});

plazoInput.addEventListener('input', () => {
actualizarPresupuesto();
});

function actualizarPresupuesto() {
let extrasTotal = 0;
extras.forEach(extra => {
  if (extra.checked) {
    extrasTotal += parseFloat(extra.dataset.price);
  }
});

const plazo = parseInt(plazoInput.value);
let descuento = 0;
if (plazo >= 14) descuento = total * 0.10;  // Descuento del 10% si es más de 14 días

totalElement.textContent = total + extrasTotal - descuento;
}

// Select all option elements
const options = document.querySelectorAll('.presupuesto_card');

// Loop through the options and add event listeners
options.forEach(option => {
    option.addEventListener('click', function() {
        // Remove 'checked' class from all options
        options.forEach(opt => opt.classList.remove('checked'));

        // Add 'checked' class to the clicked option
        this.classList.add('checked');
    });
});
