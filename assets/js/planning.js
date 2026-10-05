(() => {
  "use strict";

  const rail = document.getElementById("schedule-rail");
  const cards = document.getElementById("schedule-cards");
  if (!rail || !cards) return;

  function mediaHtml(media) {
    if (!media || (!media.photos && !media.panos)) {
      return '<span>Reportages à venir</span>';
    }

    let html = "";
    if (media.photos) html += '<a href="#photos">▧ Voir les photos</a>';
    if (media.panos) html += '<a href="#immersion">◎ Explorer en 360°</a>';
    if (media.label) html += '<span>' + media.label + '</span>';
    return html;
  }

  function render(data) {
    rail.innerHTML = "";
    cards.innerHTML = "";

    data.phases.forEach((phase, index) => {
      const step = document.createElement("button");
      step.type = "button";
      step.className = "schedule-step";
      step.setAttribute("aria-label", "Voir l’étape " + phase.label);
      step.innerHTML =
        '<span class="schedule-dot">' + String(index + 1).padStart(2, "0") + '</span>' +
        '<strong>' + phase.label + '</strong>';
      step.addEventListener("click", () => {
        document.getElementById("phase-" + phase.id)?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      });
      rail.appendChild(step);

      const card = document.createElement("article");
      card.className = "schedule-card";
      card.id = "phase-" + phase.id;

      const description = phase.description
        ? '<p class="schedule-description">' + phase.description + '</p>'
        : "";

      card.innerHTML =
        '<div class="schedule-card-top"><div><h4>' + phase.label + '</h4></div></div>' +
        description +
        '<ul class="schedule-ops">' +
          phase.operations.map(op => '<li>' + op + '</li>').join("") +
        '</ul>' +
        '<div class="schedule-media">' + mediaHtml(phase.media) + '</div>';

      cards.appendChild(card);
    });
  }

  fetch("data/planning.json?v=17", { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(render)
    .catch(error => console.error("Étapes du chantier indisponibles :", error));
})();
