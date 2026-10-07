(() => {
  "use strict";

  const state = {
    reports: [],
    currentReport: null,
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);

  function syncVisualViewport() {
    const viewport = window.visualViewport;
    const height = viewport ? viewport.height : window.innerHeight;
    document.documentElement.style.setProperty("--visual-vh", `${height}px`);
  }

  syncVisualViewport();
  window.addEventListener("resize", syncVisualViewport, { passive: true });
  window.visualViewport?.addEventListener("resize", syncVisualViewport, { passive: true });
  window.addEventListener("orientationchange", syncVisualViewport, { passive: true });
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const els = {
    navToggle: $(".nav-toggle"),
    nav: $("#main-nav"),
    timeline: $("#timeline-list"),
    reportDate: $("#reportage-date"),
    reportTitle: $("#reportage-title"),
    reportDescription: $("#reportage-description"),
    gallery: $("#reportage-gallery"),
    galleryDialog: $("#gallery-dialog"),
    dialogDate: $("#dialog-date"),
    dialogTitle: $("#dialog-title"),
    dialogGallery: $("#dialog-gallery"),
    openGallery: $("#open-gallery"),
    showAll: $("#show-all-reportages"),
    videoGrid: $("#video-grid"),
    videoDialog: $("#video-dialog"),
    videoDialogTitle: $("#video-dialog-title"),
    videoDialogCopy: $("#video-dialog-copy"),
    compareRange: $("#compare-range"),
    compareWrap: $("#compare-after-wrap"),
    compareDivider: $("#compare-divider"),
    compare: $("#before-after"),
  };

  function formatDate(dateString) {
    const date = new Date(`${dateString}T12:00:00`);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function updateStats(project, reports, videos) {
    $("#stat-date").textContent = formatDate(project.lastUpdate);
    $("#stat-phase").textContent = "7 vues";
    $("#stat-photos").textContent = reports.reduce((sum, report) => sum + (report.photoCount || report.photos.length), 0);
    $("#stat-videos").textContent = videos.length;
  }

  function timelineItem(report, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `timeline-item${index === 0 ? " active" : ""}`;
    button.dataset.reportId = report.id;
    button.innerHTML = `
      <span aria-hidden="true"></span>
      <span>
        <span class="timeline-item-date">${formatDate(report.date)}</span>
        <strong class="timeline-item-title">${report.phase}</strong>
        <span class="timeline-meta">${report.photoCount || report.photos.length} photos · ${report.videoCount || 0} vidéo${(report.videoCount || 0) > 1 ? "s" : ""}</span>
      </span>
      <span class="timeline-arrow" aria-hidden="true">›</span>
    `;
    button.addEventListener("click", () => selectReport(report.id));
    return button;
  }

  function renderTimeline() {
    els.timeline.innerHTML = "";
    state.reports.forEach((report, index) => {
      els.timeline.appendChild(timelineItem(report, index));
    });
  }

  function renderReport(report) {
    state.currentReport = report;
    els.reportDate.textContent = `Reportage du ${formatDate(report.date)}`;
    els.reportTitle.textContent = report.title;
    els.reportDescription.textContent = report.description;

    els.gallery.innerHTML = "";
    const previewPhotos = report.photos.slice(0, 5);

    previewPhotos.forEach((photo, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "photo-card";
      button.setAttribute("aria-label", `Ouvrir la photo ${index + 1}`);
      button.innerHTML = `<img src="${photo.src}" alt="${photo.alt}" loading="lazy">`;
      button.addEventListener("click", () => openGallery(report));
      els.gallery.appendChild(button);
    });

    const remaining = Math.max(0, (report.photoCount || report.photos.length) - previewPhotos.length);
    if (remaining > 0) {
      const more = document.createElement("button");
      more.type = "button";
      more.className = "photo-card photo-more";
      more.innerHTML = `<span>+${remaining}<br><small>autres photos</small></span>`;
      more.addEventListener("click", () => openGallery(report));
      els.gallery.appendChild(more);
    }
  }

  function selectReport(id) {
    const report = state.reports.find(item => item.id === id);
    if (!report) return;

    renderReport(report);
    $$(".timeline-item").forEach(item => {
      item.classList.toggle("active", item.dataset.reportId === id);
    });

    if (window.innerWidth < 900) {
      $(".reportage-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function openGallery(report = state.currentReport) {
    if (!report) return;
    els.dialogDate.textContent = formatDate(report.date);
    els.dialogTitle.textContent = report.title;
    els.dialogGallery.innerHTML = "";

    report.photos.forEach(photo => {
      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.alt;
      img.loading = "lazy";
      els.dialogGallery.appendChild(img);
    });

    els.galleryDialog.showModal();
    document.body.classList.add("dialog-open");
  }

  function renderVideos(videos) {
    els.videoGrid.innerHTML = "";
    if (!videos.length) {
      els.videoGrid.innerHTML = `<div class="media-empty"><div><strong>Vidéos à venir</strong><span>Aucune vidéo n’était présente dans les archives médias actuellement intégrées.</span></div></div>`;
      return;
    }
    videos.forEach(video => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "video-card";
      button.innerHTML = `
        <span class="video-card-image">
          <img src="${video.thumbnail}" alt="" loading="lazy">
          <span class="video-play" aria-hidden="true">▶</span>
        </span>
        <span class="video-card-body">
          <strong>${video.title}</strong>
          <small><span>${formatDate(video.date)}</span><span>${video.duration}</span></small>
        </span>
      `;
      button.addEventListener("click", () => {
        els.videoDialogTitle.textContent = video.title;
        els.videoDialogCopy.textContent = video.note || "Ajoutez ici votre URL YouTube, Vimeo ou MP4.";
        els.videoDialog.showModal();
        document.body.classList.add("dialog-open");
      });
      els.videoGrid.appendChild(button);
    });
  }

  function setupDialogs() {
    $$("[data-dialog-close]").forEach(button => {
      button.addEventListener("click", () => {
        const dialog = button.closest("dialog");
        dialog.close();
      });
    });

    $$("dialog").forEach(dialog => {
      dialog.addEventListener("click", event => {
        const rect = dialog.getBoundingClientRect();
        const clickedOutside =
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom;
        if (clickedOutside) dialog.close();
      });

      dialog.addEventListener("close", () => {
        document.body.classList.remove("dialog-open");
      });
    });
  }

  function setupBeforeAfter() {
    const setCompare = value => {
      const percent = Math.max(0, Math.min(100, Number(value)));
      els.compareWrap.style.width = `${percent}%`;
      els.compareDivider.style.left = `${percent}%`;

      const compareWidth = els.compare.getBoundingClientRect().width;
      const afterImg = $(".compare-after", els.compare);
      if (afterImg) afterImg.style.width = `${compareWidth}px`;
    };

    els.compareRange.addEventListener("input", event => setCompare(event.target.value));
    window.addEventListener("resize", () => setCompare(els.compareRange.value));
    setCompare(els.compareRange.value);
  }

  function setupNavigation() {
    els.navToggle.addEventListener("click", () => {
      const open = els.nav.classList.toggle("open");
      els.navToggle.setAttribute("aria-expanded", String(open));
    });


    window.addEventListener("keydown", event => {
      if (event.key === "Escape" && els.nav.classList.contains("open")) {
        els.nav.classList.remove("open");
        els.navToggle.setAttribute("aria-expanded", "false");
        els.navToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1180 && els.nav.classList.contains("open")) {
        els.nav.classList.remove("open");
        els.navToggle.setAttribute("aria-expanded", "false");
      }
    });

    window.addEventListener("orientationchange", () => {
      els.nav.classList.remove("open");
      els.navToggle.setAttribute("aria-expanded", "false");
    });

    $$("#main-nav a").forEach(link => {
      link.addEventListener("click", () => {
        els.nav.classList.remove("open");
        els.navToggle.setAttribute("aria-expanded", "false");
      });
    });

    const sections = $$("main section[id]");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
    
    window.addEventListener("keydown", event => {
      if (event.key === "Escape" && els.nav.classList.contains("open")) {
        els.nav.classList.remove("open");
        els.navToggle.setAttribute("aria-expanded", "false");
        els.navToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1180 && els.nav.classList.contains("open")) {
        els.nav.classList.remove("open");
        els.navToggle.setAttribute("aria-expanded", "false");
      }
    });

    $$("#main-nav a").forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-35% 0px -60% 0px" });

    sections.forEach(section => observer.observe(section));
  }

  function setupViewSwitch() {
    $$(".view-switch button").forEach(button => {
      button.addEventListener("click", () => {
        $$(".view-switch button").forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        els.gallery.classList.toggle("mosaic", button.dataset.view === "mosaic");
        els.gallery.classList.toggle("grid", button.dataset.view === "grid");
      });
    });
  }

  async function init() {
    setupDialogs();
    setupBeforeAfter();
    setupNavigation();
    setupViewSwitch();

    try {
      const response = await fetch("data/chantier.json?v=6", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      state.reports = [...data.reports].sort((a, b) => b.date.localeCompare(a.date));
      renderTimeline();
      renderReport(state.reports[0]);
      renderVideos(data.videos);
      updateStats(data.project, state.reports, data.videos);

      els.openGallery.addEventListener("click", () => openGallery());
      els.showAll.addEventListener("click", () => {
        els.timeline.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } catch (error) {
      console.error("Impossible de charger les données du chantier :", error);
      els.reportTitle.textContent = "Données indisponibles";
      els.reportDescription.textContent =
        "Lancez le site via un serveur local ou GitHub Pages afin que les fichiers JSON puissent être chargés.";
    }
  }

  init();
})();
