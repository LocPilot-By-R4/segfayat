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
    compareBeforeImage: $("#compare-before-image"),
    compareAfterImage: $("#compare-after-image"),
    compareBeforeSelect: $("#compare-before-select"),
    compareAfterSelect: $("#compare-after-select"),
    compareBeforeLabel: $("#compare-before-label"),
    compareAfterLabel: $("#compare-after-label"),
    compareSwap: $("#compare-swap"),
    evolutionStrip: $("#evolution-strip"),
    evolutionModeButton: $("#mode-evolution-button"),
    compareModeButton: $("#mode-compare-button"),
    evolutionPlayerPanel: $("#evolution-player-panel"),
    comparePanel: $("#evolution-compare-panel"),
    evolutionImageA: $("#evolution-image-a"),
    evolutionImageB: $("#evolution-image-b"),
    evolutionCurrentDate: $("#evolution-current-date"),
    evolutionCounter: $("#evolution-counter"),
    evolutionPlay: $("#evolution-play"),
    evolutionPlayIcon: $(".evolution-play-icon"),
    evolutionPlayLabel: $(".evolution-play-label"),
    evolutionPrev: $("#evolution-prev"),
    evolutionNext: $("#evolution-next"),
    evolutionRange: $("#evolution-range"),
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
    if (!els.compare || !els.evolutionStrip) return;

    let evolution = [];
    let currentIndex = 0;
    let autoplayTimer = null;
    let activeLayer = "a";
    let frameRequestToken = 0;
    let currentMode = "evolution";
    const autoplayDelay = 900;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const formatShortDate = dateString => {
      const date = new Date(`${dateString}T12:00:00`);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(date);
    };

    const byId = id => evolution.find(item => item.id === id);

    const stopAutoplay = () => {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
      els.evolutionPlay?.classList.remove("playing");
      if (els.evolutionPlayIcon) els.evolutionPlayIcon.textContent = "▶";
      if (els.evolutionPlayLabel) els.evolutionPlayLabel.textContent = "Voir l’évolution";
      els.evolutionPlay?.setAttribute("aria-label", "Lire l’évolution");
    };

    const updateThumbs = index => {
      const active = evolution[index];
      if (!active) return;
      $$(".evolution-thumb", els.evolutionStrip).forEach(button => {
        const selected = button.dataset.evolutionId === active.id;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-current", selected ? "true" : "false");
      });
    };

    const showEvolutionFrame = (index, { animate = true } = {}) => {
      if (!evolution.length) return;
      currentIndex = Math.max(0, Math.min(evolution.length - 1, Number(index)));
      const item = evolution[currentIndex];
      const requestToken = ++frameRequestToken;
      const outgoing = activeLayer === "a" ? els.evolutionImageA : els.evolutionImageB;
      const incoming = activeLayer === "a" ? els.evolutionImageB : els.evolutionImageA;

      const commit = () => {
        if (requestToken !== frameRequestToken) return;
        incoming.alt = item.alt;
        incoming.setAttribute("aria-hidden", "false");

        if (!reduceMotion && animate) {
          requestAnimationFrame(() => {
            incoming.classList.add("active");
            outgoing.classList.remove("active");
          });
        } else {
          incoming.classList.add("active");
          outgoing.classList.remove("active");
        }

        outgoing.setAttribute("aria-hidden", "true");
        activeLayer = activeLayer === "a" ? "b" : "a";
      };

      if (incoming.getAttribute("src") === item.src && incoming.complete) {
        commit();
      } else {
        incoming.onload = () => {
          incoming.onload = null;
          commit();
        };
        incoming.src = item.src;
      }

      els.evolutionCurrentDate.textContent = formatShortDate(item.date);
      els.evolutionCounter.textContent = `${currentIndex + 1} / ${evolution.length}`;
      els.evolutionRange.value = String(currentIndex);
      els.evolutionRange.setAttribute(
        "aria-valuetext",
        `${formatShortDate(item.date)}, relevé ${currentIndex + 1} sur ${evolution.length}`
      );
      updateThumbs(currentIndex);

      const nextItem = evolution[currentIndex + 1];
      if (nextItem) {
        const preload = new Image();
        preload.src = nextItem.src;
      }
    };

    const startAutoplay = () => {
      if (!evolution.length || currentMode !== "evolution") return;
      if (currentIndex >= evolution.length - 1) {
        showEvolutionFrame(0, { animate: false });
      }
      stopAutoplay();
      els.evolutionPlay?.classList.add("playing");
      if (els.evolutionPlayIcon) els.evolutionPlayIcon.textContent = "Ⅱ";
      if (els.evolutionPlayLabel) els.evolutionPlayLabel.textContent = "Pause";
      els.evolutionPlay?.setAttribute("aria-label", "Mettre l’évolution en pause");

      autoplayTimer = window.setInterval(() => {
        if (currentIndex >= evolution.length - 1) {
          stopAutoplay();
          return;
        }
        showEvolutionFrame(currentIndex + 1);
      }, autoplayDelay);
    };

    const setMode = mode => {
      currentMode = mode === "compare" ? "compare" : "evolution";
      const evolutionActive = currentMode === "evolution";

      els.evolutionModeButton.classList.toggle("active", evolutionActive);
      els.compareModeButton.classList.toggle("active", !evolutionActive);
      els.evolutionModeButton.setAttribute("aria-selected", String(evolutionActive));
      els.compareModeButton.setAttribute("aria-selected", String(!evolutionActive));

      els.evolutionPlayerPanel.hidden = !evolutionActive;
      els.comparePanel.hidden = evolutionActive;
      els.evolutionPlayerPanel.classList.toggle("active", evolutionActive);
      els.comparePanel.classList.toggle("active", !evolutionActive);

      if (!evolutionActive) {
        stopAutoplay();
        requestAnimationFrame(() => setCompare(els.compareRange.value));
      }
    };

    const setCompare = value => {
      const percent = Math.max(0, Math.min(100, Number(value)));
      els.compareWrap.style.width = `${100 - percent}%`;
      els.compareDivider.style.left = `${percent}%`;

      const compareWidth = els.compare.getBoundingClientRect().width;
      if (els.compareAfterImage) els.compareAfterImage.style.width = `${compareWidth}px`;
    };

    const updateCompareImages = () => {
      const before = byId(els.compareBeforeSelect.value);
      const after = byId(els.compareAfterSelect.value);
      if (!before || !after) return;

      els.compareBeforeImage.src = before.src;
      els.compareBeforeImage.alt = before.alt;
      els.compareAfterImage.src = after.src;
      els.compareAfterImage.alt = after.alt;
      els.compareBeforeLabel.textContent = formatShortDate(before.date);
      els.compareAfterLabel.textContent = formatShortDate(after.date);

      els.compare.setAttribute(
        "aria-label",
        `Comparaison du chantier entre le ${formatShortDate(before.date)} et le ${formatShortDate(after.date)}`
      );

      requestAnimationFrame(() => setCompare(els.compareRange.value));
    };

    const populateSelect = (select, selectedId) => {
      select.innerHTML = "";
      evolution.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = formatShortDate(item.date);
        option.selected = item.id === selectedId;
        select.appendChild(option);
      });
    };

    const renderEvolutionStrip = () => {
      els.evolutionStrip.innerHTML = "";
      evolution.forEach((item, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "evolution-thumb";
        button.dataset.evolutionId = item.id;
        button.setAttribute("aria-label", `Afficher le relevé du ${formatShortDate(item.date)}`);
        button.innerHTML = `
          <img src="${item.thumb}" alt="" loading="lazy">
          <span>${formatShortDate(item.date)}</span>
        `;
        button.addEventListener("click", () => {
          stopAutoplay();

          if (currentMode === "evolution") {
            showEvolutionFrame(index);
          } else {
            els.compareAfterSelect.value = item.id;
            updateCompareImages();
          }
        });
        els.evolutionStrip.appendChild(button);
      });
    };

    els.evolutionModeButton?.addEventListener("click", () => setMode("evolution"));
    els.compareModeButton?.addEventListener("click", () => setMode("compare"));

    els.evolutionPlay?.addEventListener("click", () => {
      if (autoplayTimer) stopAutoplay();
      else startAutoplay();
    });

    els.evolutionPrev?.addEventListener("click", () => {
      stopAutoplay();
      showEvolutionFrame(Math.max(0, currentIndex - 1));
    });

    els.evolutionNext?.addEventListener("click", () => {
      stopAutoplay();
      showEvolutionFrame(Math.min(evolution.length - 1, currentIndex + 1));
    });

    els.evolutionRange?.addEventListener("input", event => {
      stopAutoplay();
      showEvolutionFrame(Number(event.target.value), { animate: false });
    });

    els.compareRange.addEventListener("input", event => setCompare(event.target.value));
    window.addEventListener("resize", () => {
      if (!els.comparePanel.hidden) setCompare(els.compareRange.value);
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAutoplay();
    });

    fetch("data/evolution.json?v=21", { cache: "no-store" })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(data => {
        evolution = Array.isArray(data.photos) ? data.photos : [];
        if (evolution.length < 2) throw new Error("Pas assez de vues pour la comparaison.");

        els.evolutionRange.max = String(evolution.length - 1);
        populateSelect(els.compareBeforeSelect, evolution[0].id);
        populateSelect(els.compareAfterSelect, evolution[evolution.length - 1].id);
        renderEvolutionStrip();

        els.compareBeforeSelect.addEventListener("change", updateCompareImages);
        els.compareAfterSelect.addEventListener("change", updateCompareImages);
        els.compareSwap.addEventListener("click", () => {
          const before = els.compareBeforeSelect.value;
          els.compareBeforeSelect.value = els.compareAfterSelect.value;
          els.compareAfterSelect.value = before;
          updateCompareImages();
        });

        showEvolutionFrame(0, { animate: false });
        updateCompareImages();
        setMode("evolution");

      })
      .catch(error => {
        console.error("Impossible de charger l’évolution du chantier :", error);
        stopAutoplay();
        setCompare(els.compareRange.value);
      });
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
