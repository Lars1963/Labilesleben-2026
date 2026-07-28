document.addEventListener("DOMContentLoaded", function () {
  const button = document.querySelector(".nav-toggle");
  const navigation = document.querySelector(".main-nav");

  if (!button || !navigation) return;

  button.addEventListener("click", function () {
    const isOpen = navigation.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
});
