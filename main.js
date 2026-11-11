// Store links: fill these in at launch. While a link is empty the button shows "Próximamente".
const STORE_LINKS = {
  ios: "",
  android: "",
};

document.querySelectorAll("[data-store]").forEach((el) => {
  const url = STORE_LINKS[el.dataset.store];
  if (!url) return;
  el.href = url;
  el.removeAttribute("aria-disabled");
  const small = el.querySelector(".store-small");
  if (small) small.textContent = el.dataset.store === "ios" ? "Descárgala en" : "Disponible en";
});

document.getElementById("year").textContent = new Date().getFullYear();

// Mobile sticky CTA: visible once the hero buttons scroll away, hidden again at the final download block.
(function () {
  const bar = document.getElementById("sticky");
  const hero = document.getElementById("hero-stores");
  const final = document.getElementById("descargar");
  if (!bar || !hero || !final || !("IntersectionObserver" in window)) return;
  let heroVisible = true;
  let finalVisible = false;
  const update = () => {
    const show = !heroVisible && !finalVisible;
    bar.classList.toggle("show", show);
    bar.setAttribute("aria-hidden", String(!show));
    bar.querySelector("a").tabIndex = show ? 0 : -1;
  };
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }).observe(hero);
  new IntersectionObserver(([e]) => { finalVisible = e.isIntersecting; update(); }, { threshold: 0.15 }).observe(final);
})();


// Screens carousel: phones orbit on a horizontal ellipse; the front one is sharp, the others blur out behind.
(function () {
  const root = document.getElementById("carousel");
  if (!root) return;
  const stage = root.querySelector(".car-stage");
  const items = [...root.querySelectorAll(".car-item")];
  const caps = [...root.querySelectorAll(".car-cap")];
  const dots = [...root.querySelectorAll(".car-dot")];
  const n = items.length;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HOLD = 3200; // ms a phone stays in front
  const MOVE = 1100; // ms the ring takes to turn to the next one
  let phase = 0;
  let target = 0;
  let from = 0;
  let moveStart = 0;
  let last = performance.now();
  let hold = 0;
  let paused = false;
  let visible = true;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function layout() {
    const w = stage.clientWidth;
    const rx = Math.min(w * 0.32, 380);
    items.forEach((el, i) => {
      let d = i - phase;
      d = ((d % n) + n) % n;
      const theta = (d / n) * Math.PI * 2;
      const depth = (Math.cos(theta) + 1) / 2;
      const x = Math.sin(theta) * rx;
      const scale = 0.6 + 0.4 * depth;
      const blur = depth > 0.97 ? 0 : (1 - depth) * 7 + 1;
      el.style.transform = "translateX(calc(-50% + " + x.toFixed(1) + "px)) translateY(" + ((1 - depth) * -18).toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";
      el.style.filter = blur ? "blur(" + blur.toFixed(1) + "px)" : "none";
      el.style.opacity = (0.5 + 0.5 * depth).toFixed(2);
      el.style.zIndex = String(Math.round(depth * 100));
    });
    const front = ((Math.round(phase) % n) + n) % n;
    caps.forEach((c, i) => c.classList.toggle("on", i === front));
    dots.forEach((c, i) => c.classList.toggle("on", i === front));
  }

  function goTo(i) {
    const cur = Math.round(phase);
    let diff = (((i - cur) % n) + n) % n;
    if (diff > n / 2) diff -= n;
    if (diff === 0) return;
    from = phase;
    target = cur + diff;
    moveStart = performance.now();
    hold = 0;
  }

  function frame(now) {
    const dt = now - last;
    last = now;
    if (visible && !reduced) {
      if (phase !== target) {
        const t = Math.min(1, (now - moveStart) / MOVE);
        phase = from + (target - from) * ease(t);
        if (t >= 1) phase = target;
      } else if (!paused) {
        hold += dt;
        if (hold >= HOLD) goTo(Math.round(phase) + 1);
      }
    }
    layout();
    requestAnimationFrame(frame);
  }

  items.forEach((el, i) => el.addEventListener("click", () => goTo(i)));
  dots.forEach((d, i) => d.addEventListener("click", () => { goTo(i); paused = true; }));
  root.addEventListener("mouseenter", () => { paused = true; });
  root.addEventListener("mouseleave", () => { paused = false; hold = 0; });
  if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(root);
  window.addEventListener("resize", layout);
  layout();
  requestAnimationFrame(frame);
})();
