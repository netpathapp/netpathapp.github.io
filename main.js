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
