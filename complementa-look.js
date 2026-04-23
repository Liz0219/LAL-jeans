/* =========================================================
   LAL Jeans — Complementa tu look
   Renderiza productos relacionados excluyendo el producto
   que se está visualizando en la página actual.
   ========================================================= */
(function () {
  "use strict";

  /**
   * Catálogo mock. En producción, reemplazar por fetch a tu API:
   *   fetch(`/api/products/related?excludeId=${currentId}`)
   *     .then(r => r.json()).then(renderProducts);
   */
  /** Placeholder SVG para el demo (sin dependencia de red) */
  const ph = (c1, c2, label) =>
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>
        <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/>
        </linearGradient></defs>
        <rect width='400' height='500' fill='url(#g)'/>
        <text x='50%' y='50%' font-family='Inter, sans-serif' font-size='26' font-weight='700'
              fill='rgba(255,255,255,0.9)' text-anchor='middle' dominant-baseline='middle'>${label}</text>
      </svg>`
    );

  const CATALOG = [
    { id: "jean-wide-01",    name: "Jean wide leg tiro alto",         price: 229900, image: ph("#4a5a7a", "#1e2a44", "wide leg"), category: "jeans" },
    { id: "cargo-verde-01",  name: "Cargo pant verde corazón lateral", price: 199900, image: ph("#6b7a3a", "#3a4618", "cargo"),    category: "pants" },
    { id: "glint-denim-01",  name: "Glint denim pant",                 price: 199900, image: ph("#2c2c2e", "#0e0e10", "glint"),    category: "jeans" },
    { id: "mom-jean-01",     name: "Mom jean vintage azul claro",      price: 189900, image: ph("#8aa6c8", "#4e6a8a", "mom jean"), category: "jeans" },
    { id: "skinny-negro-01", name: "Skinny jean negro tiro medio",     price: 179900, image: ph("#2a2a2e", "#0a0a0c", "skinny"),   category: "jeans" },
    { id: "short-denim-01",  name: "Short denim tiro alto",            price: 139900, image: ph("#7aa8d4", "#3c5a7a", "short"),    category: "shorts" },
    { id: "flare-blanco-01", name: "Flare jean blanco cintura alta",   price: 219900, image: ph("#e6e6e0", "#b4b4a8", "flare"),    category: "jeans" },
    { id: "top-crop-01",     name: "Top crop básico negro",            price:  89900, image: ph("#1a1a1c", "#000000", "top crop"), category: "tops" },
  ];

  const currencyCO = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  /* ---------- Templating ---------- */
  function productCard(p) {
    const li = document.createElement("li");
    li.className = "card";
    li.dataset.productId = p.id;
    li.innerHTML = `
      <div class="card__media">
        <button class="card__fav" type="button" aria-pressed="false" aria-label="Añadir a favoritos">
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
          </svg>
        </button>
        <img class="card__img" src="${p.image}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="card__body">
        <div>
          <h3 class="card__name">${p.name}</h3>
          <p class="card__price">${currencyCO.format(p.price)}</p>
        </div>
        <button class="card__cta" type="button" aria-pressed="false" data-action="add" data-product-id="${p.id}">
          + AGREGAR
        </button>
      </div>
    `;
    return li;
  }

  /* ---------- Lógica de filtrado dinámico ---------- */
  /**
   * Devuelve hasta `limit` productos, excluyendo el actual.
   * Prioriza la misma categoría y aleatoriza dentro del grupo para
   * que la sección se vea distinta en cada carga.
   */
  function pickRelated(current, catalog, limit = 8) {
    const others = catalog.filter((p) => p.id !== current?.id);
    const sameCat = current
      ? others.filter((p) => p.category === current.category)
      : [];
    const rest = others.filter((p) => !sameCat.includes(p));
    const pool = [...shuffle(sameCat), ...shuffle(rest)];
    return pool.slice(0, limit);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---------- Render ---------- */
  function render(track, products) {
    track.innerHTML = "";
    if (!products.length) {
      const empty = document.createElement("li");
      empty.className = "complementa__empty";
      empty.textContent = "Pronto tendremos más prendas para complementar tu look.";
      track.appendChild(empty);
      return;
    }
    const frag = document.createDocumentFragment();
    products.forEach((p) => frag.appendChild(productCard(p)));
    track.appendChild(frag);
  }

  /* ---------- Carrusel (flechas) ---------- */
  function wireCarousel(root) {
    const track = root.querySelector(".complementa__track");
    const prev  = root.querySelector(".complementa__nav--prev");
    const next  = root.querySelector(".complementa__nav--next");

    const scrollAmount = () => {
      const firstCard = track.querySelector(".card");
      if (!firstCard) return track.clientWidth;
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap || "20");
      return firstCard.getBoundingClientRect().width + gap;
    };

    const updateNav = () => {
      const maxScroll = track.scrollWidth - track.clientWidth - 1;
      prev.disabled = track.scrollLeft <= 0;
      next.disabled = track.scrollLeft >= maxScroll;
    };

    prev.addEventListener("click", () => {
      track.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    });
    next.addEventListener("click", () => {
      track.scrollBy({ left:  scrollAmount(), behavior: "smooth" });
    });
    track.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav);
    requestAnimationFrame(updateNav);
  }

  /* ---------- Interacciones de tarjeta ---------- */
  function wireCardActions(root) {
    root.addEventListener("click", (e) => {
      const fav = e.target.closest(".card__fav");
      if (fav) {
        const pressed = fav.getAttribute("aria-pressed") === "true";
        fav.setAttribute("aria-pressed", String(!pressed));
        return;
      }
      const cta = e.target.closest('[data-action="add"]');
      if (cta) {
        cta.setAttribute("aria-pressed", "true");
        cta.textContent = "✓ AGREGADO";
        cta.dispatchEvent(new CustomEvent("lal:add-to-cart", {
          bubbles: true,
          detail: { productId: cta.dataset.productId },
        }));
      }
    });
  }

  /* ---------- API pública ---------- */
  /**
   * @param {string} currentProductId  id del producto que se está viendo
   */
  function mountComplementaTuLook(currentProductId) {
    const root  = document.querySelector(".complementa");
    const track = root.querySelector(".complementa__track");
    if (!root || !track) return;

    root.dataset.currentProductId = currentProductId || "";
    const current = CATALOG.find((p) => p.id === currentProductId) || null;
    const related = pickRelated(current, CATALOG, 8);
    render(track, related);
    requestAnimationFrame(() => {
      track.scrollTo({ left: 0 });
      root.querySelector(".complementa__nav--prev").disabled = true;
      root.querySelector(".complementa__nav--next").disabled =
        track.scrollWidth <= track.clientWidth;
    });
  }

  /* ---------- Demo: selector para simular navegación de producto ---------- */
  function initDemo() {
    const select = document.getElementById("currentProductSelect");
    const title  = document.getElementById("currentProductTitle");
    const price  = document.getElementById("currentProductPrice");
    if (!select) return;

    CATALOG.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      select.appendChild(opt);
    });

    const setCurrent = (id) => {
      const p = CATALOG.find((x) => x.id === id);
      if (!p) return;
      title.textContent = p.name;
      price.textContent = currencyCO.format(p.price);
      mountComplementaTuLook(p.id);
    };

    select.value = CATALOG[0].id;
    setCurrent(CATALOG[0].id);
    select.addEventListener("change", (e) => setCurrent(e.target.value));
  }

  /* ---------- Bootstrap ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector(".complementa");
    if (!root) return;
    wireCarousel(root);
    wireCardActions(root);
    initDemo();
  });

  // Exponer por si se quiere llamar desde la página de producto real:
  // <script>window.LAL.mountComplementaTuLook('jean-wide-01')</script>
  window.LAL = Object.assign(window.LAL || {}, { mountComplementaTuLook });
})();
