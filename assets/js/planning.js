(() => {
  "use strict";

  const rail = document.getElementById("schedule-rail");
  const cards = document.getElementById("schedule-cards");
  if (!rail || !cards) return;

  function hasMedia(phase) {
    return Boolean(phase?.media?.photos || phase?.media?.panos);
  }

  function mediaHtml(media) {
    let html = "";
    if (media.photos) html += '<a href="#photos">▧ Voir le reportage photo</a>';
    if (media.panos) html += '<a href="#immersion">◎ Explorer le reportage 360°</a>';
    if (media.label) html += '<span>' + media.label + '</span>';
    return html;
  }

  function render(data) {
    rail.innerHTML = "";
    cards.innerHTML = "";

    const documentedPhases = data.phases.filter(hasMedia);

    documentedPhases.forEach((phase, index) => {
      const step = document.createElement("button");
      step.type = "button";
      step.className = "schedule-step";
      step.setAttribute("aria-label", "Voir les reportages de l’étape " + phase.label);
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
        '<div class="schedule-media">' + mediaHtml(phase.media) + '</div>';

      cards.appendChild(card);
    });

    if (!documentedPhases.length) {
      cards.innerHTML = '<div class="media-empty"><div><strong>Aucun reportage disponible</strong><span>Les étapes apparaîtront ici au fur et à mesure des nouveaux relevés.</span></div></div>';
    }
  }

  fetch("data/planning.json?v=18", { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(render)
    .catch(error => console.error("Étapes documentées indisponibles :", error));
})();
