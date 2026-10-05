(() => {
  "use strict";

  const rail = document.getElementById("schedule-rail");
  const cards = document.getElementById("schedule-cards");
  const progressBar = document.getElementById("planning-progress-bar");
  const progressLabel = document.getElementById("planning-progress-label");
  if (!rail || !cards) return;

  const parseDate = value => new Date(value + "T12:00:00");
  const fmt = value => new Intl.DateTimeFormat("fr-FR", {day:"2-digit", month:"short", year:"numeric"}).format(parseDate(value));
  const now = new Date();

  function statusOf(phase) {
    const start = parseDate(phase.start);
    const end = parseDate(phase.end);
    if (now < start) return "upcoming";
    if (now > end) return "done";
    return "current";
  }

  function statusText(status) {
    if (status === "done") return "Terminé selon planning";
    if (status === "current") return "En cours selon planning";
    return "À venir selon planning";
  }

  function mediaHtml(media) {
    if (!media || (!media.photos && !media.panos)) return '<span>Aucun média rattaché</span>';
    let html = "";
    if (media.photos) html += '<a href="#photos">▧ Voir les photos</a>';
    if (media.panos) html += '<a href="#immersion">◎ Explorer en 360°</a>';
    if (media.label) html += '<span>' + media.label + '</span>';
    return html;
  }

  function render(data) {
    const start = parseDate(data.meta.start);
    const end = parseDate(data.meta.end);
    const pct = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
    if (progressBar) progressBar.style.width = pct.toFixed(1) + "%";
    if (progressLabel) progressLabel.textContent = pct <= 0 ? "À venir" : pct >= 100 ? "Planning achevé" : Math.round(pct) + " % du calendrier écoulé";

    rail.innerHTML = "";
    cards.innerHTML = "";

    data.phases.forEach((phase, index) => {
      const status = statusOf(phase);

      const step = document.createElement("button");
      step.type = "button";
      step.className = "schedule-step";
      step.dataset.status = status;
      step.setAttribute("aria-label", phase.label + ", " + statusText(status));
      step.innerHTML = '<span class="schedule-dot">' + String(index + 1).padStart(2,"0") + '</span><strong>' + phase.label + '</strong><small>' + fmt(phase.start) + '</small>';
      step.addEventListener("click", () => document.getElementById("phase-" + phase.id)?.scrollIntoView({behavior:"smooth", block:"center"}));
      rail.appendChild(step);

      const card = document.createElement("article");
      card.className = "schedule-card";
      card.id = "phase-" + phase.id;
      card.dataset.status = status;
      card.innerHTML =
        '<div class="schedule-card-top"><div><h4>' + phase.label + '</h4><span class="schedule-card-dates">' + fmt(phase.start) + ' → ' + fmt(phase.end) + '</span></div><span class="schedule-status">' + statusText(status) + '</span></div>' +
        '<ul class="schedule-ops">' + phase.operations.map(op => '<li>' + op + '</li>').join("") + '</ul>' +
        '<div class="schedule-media">' + mediaHtml(phase.media) + '</div>';
      cards.appendChild(card);
    });

    if (data.milestones?.length) {
      const milestone = data.milestones[0];
      const note = document.createElement("div");
      note.className = "planning-note";
      note.innerHTML = '<strong>Jalon</strong><span>' + fmt(milestone.date) + ' · ' + milestone.label + '</span>';
      cards.after(note);
    }
  }

  fetch("data/planning.json", {cache:"no-store"})
    .then(response => {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(render)
    .catch(error => console.error("Planning indisponible :", error));
})();
