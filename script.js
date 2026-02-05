/* ============================================
   L&L JEANS – Landing Page Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- Floating Nav: show after scrolling past hero ---
  const floatingNav = document.getElementById('floatingNav');
  const hero = document.querySelector('.hero');

  function toggleNav() {
    if (!hero || !floatingNav) return;
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    if (window.scrollY > heroBottom - 200) {
      floatingNav.classList.add('visible');
    } else {
      floatingNav.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', toggleNav, { passive: true });
  toggleNav();

  // --- Active nav link based on scroll position ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.floating-nav a');

  function updateActiveLink() {
    var scrollPos = window.scrollY + window.innerHeight / 3;
    sections.forEach(function (section) {
      var top = section.offsetTop;
      var bottom = top + section.offsetHeight;
      var id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // --- Fade-in on scroll (Intersection Observer) ---
  var fadeTargets = document.querySelectorAll(
    '.ps-card, .feature-card, .audience-card, .step, .guarantee-item, .pricing-table-wrapper, .contact-form'
  );

  fadeTargets.forEach(function (el) {
    el.classList.add('fade-in');
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately
    fadeTargets.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // --- Form handling ---
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = {
        nombre: document.getElementById('nombre').value,
        pais: document.getElementById('pais').value,
        email: document.getElementById('email').value,
        whatsapp: document.getElementById('whatsapp').value,
        negocio: document.getElementById('negocio').value,
        cantidad: document.getElementById('cantidad').value,
        mensaje: document.getElementById('mensaje').value
      };

      // Build WhatsApp message
      var msg = 'Hola! Soy ' + data.nombre + ' de ' + data.pais + '.\n'
        + 'Tipo de negocio: ' + data.negocio + '\n'
        + 'Cantidad estimada: ' + data.cantidad + ' unidades\n'
        + 'Email: ' + data.email + '\n';
      if (data.mensaje) {
        msg += 'Mensaje: ' + data.mensaje + '\n';
      }
      msg += '\nQuiero solicitar informacion mayorista de L&L Jeans.';

      // Replace with your WhatsApp number
      var whatsappNumber = '573000000000';
      var whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(msg);

      // Show confirmation
      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn.textContent;
      btn.textContent = 'Redirigiendo a WhatsApp...';
      btn.disabled = true;

      setTimeout(function () {
        window.open(whatsappUrl, '_blank');
        btn.textContent = 'Enviado! Te contactaremos pronto';
        setTimeout(function () {
          btn.textContent = originalText;
          btn.disabled = false;
          form.reset();
        }, 3000);
      }, 500);
    });
  }

});
