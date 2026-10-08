(() => {
  "use strict";

  const state = {
    reports: [],
    currentReport: null,
    archiveFilter: "all",
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
    archiveList: $("#archive-report-list"),
    archiveFilters: $("#archive-filters"),
    archivePrev: $("#archive-prev"),
    archiveNext: $("#archive-next"),
    archiveStatReports: $("#archive-stat-reports"),
    archiveStatPhotos: $("#archive-stat-photos"),
    archiveStatPeriod: $("#archive-stat-period"),
    reportDate: $("#reportage-date"),
    reportPhase: $("#reportage-phase"),
    reportTitle: $("#reportage-title"),
    reportDescription: $("#reportage-description"),
    reportPhotoCount: $("#reportage-photo-count"),
    reportCaption: $("#reportage-caption"),
    gallery: $("#reportage-gallery"),
    galleryDialog: $("#gallery-dialog"),
    dialogDate: $("#dialog-date"),
    dialogTitle: $("#dialog-title"),
    dialogGallery: $("#dialog-gallery"),
    openGallery: $("#open-gallery"),
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

  function monthKey(dateString) {
    return dateString.slice(0, 7);
  }

  function monthLabel(key) {
    const [year, month] = key.split("-").map(Number);
    const date = new Date(year, month - 1, 1, 12);
    return new Intl.DateTimeFormat("fr-FR", { month: "long" }).format(date);
  }

  function filteredReports() {
    if (state.archiveFilter === "all") return state.reports;
    return state.reports.filter(report => monthKey(report.date) === state.archiveFilter);
  }

  function renderArchiveStats() {
    if (!state.reports.length) return;

    const totalPhotos = state.reports.reduce(
      (sum, report) => sum + (report.photoCount || report.photos.length),
      0
    );
    const dates = state.reports.map(report => report.date).sort();
    const first = dates[0];
    const last = dates[dates.length - 1];

    els.archiveStatReports.textContent = state.reports.length;
    els.archiveStatPhotos.textContent = totalPhotos;
    els.archiveStatPeriod.textContent = `${formatDate(first)} → ${formatDate(last)}`;
  }

  function renderArchiveFilters() {
    const counts = new Map();
    state.reports.forEach(report => {
      const key = monthKey(report.date);
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const keys = [...counts.keys()].sort();
    els.archiveFilters.innerHTML = "";

    const addFilter = (key, label, count) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `archive-filter${state.archiveFilter === key ? " active" : ""}`;
      button.dataset.archiveFilter = key;
      button.innerHTML = `<span>${label}</span><small>${count}</small>`;
      button.addEventListener("click", () => {
        if (state.archiveFilter === key) return;
        state.archiveFilter = key;
        renderArchiveFilters();
        renderArchiveCards();

        const reports = filteredReports();
        if (reports.length) {
          selectReport(reports[0].id, { scrollCard: false, scrollFeature: false });
        }
      });
      els.archiveFilters.appendChild(button);
    };

    addFilter("all", "Tous", state.reports.length);
    keys.forEach(key => addFilter(key, monthLabel(key), counts.get(key)));
  }

  function archiveCard(report) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "archive-report-card";
    button.dataset.reportId = report.id;

    const cover = report.photos?.[0];
    const count = report.photoCount || report.photos.length;

    button.innerHTML = `
      <span class="archive-report-cover">
        ${cover ? `<img src="${cover.src}" alt="" loading="lazy">` : ""}
        <span class="archive-report-count">${count} photo${count > 1 ? "s" : ""}</span>
      </span>
      <span class="archive-report-body">
        <span class="archive-report-date">${formatDate(report.date)}</span>
        <strong>${report.phase}</strong>
        <span class="archive-report-open">Voir le reportage <span aria-hidden="true">→</span></span>
      </span>
    `;

    button.addEventListener("click", () => {
      selectReport(report.id, { scrollCard: true, scrollFeature: window.innerWidth < 760 });
    });
    return button;
  }

  function renderArchiveCards() {
    const reports = filteredReports();
    els.archiveList.innerHTML = "";
    reports.forEach(report => els.archiveList.appendChild(archiveCard(report)));

    if (!reports.length) {
      els.archiveList.innerHTML = `<p class="archive-empty">Aucun reportage pour cette période.</p>`;
    }
  }

  function renderReport(report) {
    state.currentReport = report;
    const count = report.photoCount || report.photos.length;

    els.reportDate.textContent = formatDate(report.date);
    els.reportPhase.textContent = report.phase;
    els.reportTitle.textContent = report.title;
    els.reportDescription.textContent = report.description;
    els.reportPhotoCount.textContent = count;
    els.reportCaption.textContent = `Aperçu de ${Math.min(5, count)} image${Math.min(5, count) > 1 ? "s" : ""} · reportage complet : ${count} photo${count > 1 ? "s" : ""}.`;
    els.openGallery.textContent = `Ouvrir les ${count} photo${count > 1 ? "s" : ""}`;

    els.gallery.innerHTML = "";
    const previewPhotos = report.photos.slice(0, 5);
    els.gallery.dataset.count = String(previewPhotos.length);

    previewPhotos.forEach((photo, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "photo-card archive-photo-card";
      button.setAttribute("aria-label", `Ouvrir le reportage, photo ${index + 1}`);
      button.innerHTML = `<img src="${photo.src}" alt="${photo.alt}" loading="${index === 0 ? "eager" : "lazy"}">`;

      if (index === previewPhotos.length - 1 && count > previewPhotos.length) {
        const remaining = count - previewPhotos.length;
        button.classList.add("has-more");
        button.insertAdjacentHTML(
          "beforeend",
          `<span class="archive-more-overlay"><strong>+${remaining}</strong><small>photos</small></span>`
        );
      }

      button.addEventListener("click", () => openPhotoViewer(report, index));
      const wrapper = document.createElement("div");
      wrapper.className = "selectable-photo";
      wrapper.append(button, selectionCheckbox(report, photo));
      els.gallery.appendChild(wrapper);
    });

    $$(".archive-report-card", els.archiveList).forEach(item => {
      const active = item.dataset.reportId === report.id;
      item.classList.toggle("active", active);
      item.setAttribute("aria-current", active ? "true" : "false");
    });

    updateArchiveNavButtons();
    refreshMediaSelection();
  }

  function selectReport(id, { scrollCard = false, scrollFeature = false } = {}) {
    const report = state.reports.find(item => item.id === id);
    if (!report) return;

    renderReport(report);

    if (scrollCard) {
      const activeCard = $(`.archive-report-card[data-report-id="${id}"]`, els.archiveList);
      activeCard?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }

    if (scrollFeature) {
      $(".archive-feature")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function updateArchiveNavButtons() {
    const reports = filteredReports();
    const index = reports.findIndex(report => report.id === state.currentReport?.id);

    els.archivePrev.disabled = index <= 0;
    els.archiveNext.disabled = index < 0 || index >= reports.length - 1;
  }

  function moveArchive(direction) {
    const reports = filteredReports();
    if (!reports.length) return;

    let index = reports.findIndex(report => report.id === state.currentReport?.id);
    if (index < 0) index = 0;
    const nextIndex = Math.max(0, Math.min(reports.length - 1, index + direction));
    if (nextIndex === index) return;

    selectReport(reports[nextIndex].id, { scrollCard: true, scrollFeature: false });
  }

  function setupArchiveNavigation() {
    els.archivePrev?.addEventListener("click", () => moveArchive(-1));
    els.archiveNext?.addEventListener("click", () => moveArchive(1));
  }

  // V25.2 — Panier de médias partagé entre archives, galerie et visionneuse.
  const mediaSelection = new Map();
  const mediaKey = (report, photo) => `${report.id}::${photo.src}`;
  const extraMedia = new Map();
  const allMedia = () => [...selectedEntries(), ...extraMedia.values()];
  const extraKey = item => `${item.type}::${item.src}`;
  function toggleExtra(item) { const k=extraKey(item); if(extraMedia.has(k)) extraMedia.delete(k); else extraMedia.set(k,item); refreshMediaSelection(); }
  function selectExtra(item) {extraMedia.set(extraKey(item),item); refreshMediaSelection();}
  window.segMedia = { toggleExtra, selectExtra, isSelected: item => extraMedia.has(extraKey(item)), refresh: () => refreshMediaSelection() };
  const safeName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "_");
  function selectedEntries(report = null) {
    return [...mediaSelection.values()].filter(entry => !report || entry.report.id === report.id);
  }
  function toggleMedia(report, photo) {
    const key = mediaKey(report, photo);
    if (mediaSelection.has(key)) mediaSelection.delete(key);
    else mediaSelection.set(key, { report, photo });
    refreshMediaSelection();
  }
  function selectReport(report = state.currentReport) {
    if (!report) return;
    report.photos.forEach(photo => mediaSelection.set(mediaKey(report, photo), { report, photo }));
    refreshMediaSelection();
  }
  function refreshMediaSelection() {
    const count = mediaSelection.size + extraMedia.size;
    const download = $("#download-selection");
    download.disabled = !count;
    download.textContent = `Télécharger la sélection (${count})`;
    $("#media-selection-status").textContent = `${count} média${count > 1 ? "s" : ""} sélectionné${count > 1 ? "s" : ""}`;
    $("#dialog-download-selection").disabled = !count;
    $$("[data-media-key]").forEach(box => {
      const checked = mediaSelection.has(box.dataset.mediaKey);
      box.checked = checked;
      box.setAttribute("aria-label", checked ? "Retirer de la sélection" : "Ajouter à la sélection");
    });
    if (viewerReport?.photos?.[viewerIndex]) {
      const checked = mediaSelection.has(mediaKey(viewerReport, viewerReport.photos[viewerIndex]));
      $("#photo-viewer-select").textContent = checked ? "✓ Sélectionnée" : "Sélectionner";
      $("#photo-viewer-select").setAttribute("aria-pressed", String(checked));
    }
  }
  function selectionCheckbox(report, photo) {
    const label = document.createElement("label");
    label.className = "media-checkbox";
    label.title = "Sélectionner cette photo";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.dataset.mediaKey = mediaKey(report, photo);
    input.checked = mediaSelection.has(input.dataset.mediaKey);
    input.setAttribute("aria-label", `Sélectionner ${photo.alt || "cette photo"}`);
    input.addEventListener("change", () => toggleMedia(report, photo));
    label.append(input, document.createTextNode("Sélectionner"));
    return label;
  }
  function setupMediaSelection() {
    $("#select-report").addEventListener("click", () => selectReport());
    $("#dialog-select-report").addEventListener("click", () => selectReport(galleryReport));
    $("#select-all-reports").addEventListener("click", () => {
      state.reports.forEach(report => selectReport(report));
      window.dispatchEvent(new Event("seg-select-all-media"));
    });
    $("#clear-selection").addEventListener("click", () => {mediaSelection.clear(); extraMedia.clear(); refreshMediaSelection();});
    $("#download-selection").addEventListener("click", () => downloadSelected());
    $("#dialog-download-selection").addEventListener("click", () => downloadSelected());
    $("#photo-viewer-select").addEventListener("click", () => {
      if (viewerReport) toggleMedia(viewerReport, viewerReport.photos[viewerIndex]);
    });
    $("#photo-viewer-download").addEventListener("click", () => {
      if (viewerReport) downloadSelected([{ report: viewerReport, photo: viewerReport.photos[viewerIndex] }]);
    });
  }
  let galleryReport = null;
  // ZIP sans bibliothèque externe : entrées STORE (pas de perte, pas de compression supplémentaire).
  const zipEncoder = new TextEncoder();
  const zipU16 = (view, offset, value) => view.setUint16(offset, value, true);
  const zipU32 = (view, offset, value) => view.setUint32(offset, value >>> 0, true);
  const crcTable = Array.from({length: 256}, (_, i) => {
    let c=i;
    for (let j=0;j<8;j++) c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);
    return c>>>0;
  });
  function crc32(bytes) {
    let crc=0xffffffff;
    for (const value of bytes) crc=crcTable[(crc^value)&255]^(crc>>>8);
    return (crc^0xffffffff)>>>0;
  }
  function zipFileName(entry) {
    if (!entry.report) return `${entry.type === "panorama" ? "360" : "videos"}/${safeName(entry.date || "sans-date")}/${safeName(decodeURIComponent(entry.src.split("/").pop().split("?")[0]))}`;
    const basename = decodeURIComponent(entry.photo.src.split("/").pop().split("?")[0]);
    return `photos/${safeName(entry.report.date)}/${safeName(basename)}`;
  }
  function buildZip(files) {
    const chunks=[], central=[];
    let offset=0;
    for (const file of files) {
      const name=zipEncoder.encode(file.name);
      const data=file.data;
      const crc=crc32(data);
      const head=new Uint8Array(30+name.length), hv=new DataView(head.buffer);
      zipU32(hv,0,0x04034b50); zipU16(hv,4,20); zipU16(hv,6,0x0800);
      zipU16(hv,8,0); zipU32(hv,14,crc); zipU32(hv,18,data.length);
      zipU32(hv,22,data.length); zipU16(hv,26,name.length); head.set(name,30);
      chunks.push(head,data);
      const cent=new Uint8Array(46+name.length), cv=new DataView(cent.buffer);
      zipU32(cv,0,0x02014b50); zipU16(cv,4,20); zipU16(cv,6,20);
      zipU16(cv,8,0x0800); zipU32(cv,16,crc); zipU32(cv,20,data.length);
      zipU32(cv,24,data.length); zipU16(cv,28,name.length); zipU32(cv,42,offset);
      cent.set(name,46); central.push(cent);
      offset+=head.length+data.length;
    }
    const centralSize=central.reduce((sum,part)=>sum+part.length,0);
    const end=new Uint8Array(22), ev=new DataView(end.buffer);
    zipU32(ev,0,0x06054b50); zipU16(ev,8,files.length);
    zipU16(ev,10,files.length); zipU32(ev,12,centralSize); zipU32(ev,16,offset);
    return new Blob([...chunks,...central,end], {type:"application/zip"});
  }
  function saveBlob(blob, name) {
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url; link.download=name; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  async function downloadSelected(entries = allMedia()) {
    if (!entries.length) return;
    const button=$("#download-selection"), status=$("#media-selection-status");
    button.disabled=true;
    const files=[];
    try {
      for (const [i, entry] of entries.entries()) {
        status.textContent=`Préparation ${i+1}/${entries.length}…`;
        const src = entry.photo?.src || entry.src;
        const response=await fetch(src);
        if (!response.ok) throw new Error(`Téléchargement impossible : ${src} (${response.status})`);
        files.push({name:zipFileName(entry),data:new Uint8Array(await response.arrayBuffer())});
      }
      if (files.length===1) {
        saveBlob(new Blob([files[0].data],{type:"application/octet-stream"}),files[0].name.split("/").pop());
      } else {
        saveBlob(buildZip(files),`SEG-FAYAT-selection-${new Date().toISOString().slice(0,10)}.zip`);
      }
      status.textContent=`${files.length} média${files.length>1?"s":""} préparé${files.length>1?"s":""} · téléchargement lancé`;
    } catch (error) {
      console.error(error);
      status.textContent="Échec du téléchargement : vérifiez votre connexion et réessayez.";
      alert(`Impossible de préparer les médias : ${error.message}`);
    } finally {
      button.disabled=!(mediaSelection.size+extraMedia.size);
    }
  }

  let viewerReport = null;
  let viewerIndex = 0;
  let viewerZoom = 1;
  let viewerTouchX = null;

  function showViewerPhoto(index) {
    if (!viewerReport?.photos?.length) return;
    viewerIndex = (index + viewerReport.photos.length) % viewerReport.photos.length;
    viewerZoom = 1;
    const photo = viewerReport.photos[viewerIndex];
    const image = $("#photo-viewer-image");
    image.src = photo.src;
    image.alt = photo.alt || `Photo ${viewerIndex + 1}`;
    image.style.transform = "scale(1)";
    $("#photo-viewer-count").textContent = `${viewerIndex + 1} / ${viewerReport.photos.length}`;
    $("#photo-viewer-date").textContent = `${formatDate(viewerReport.date)} · ${viewerReport.title}`;
    $("#photo-viewer-zoom").textContent = "Zoom +";
    refreshMediaSelection();
  }

  function openPhotoViewer(report, index = 0) {
    if (!report?.photos?.length) return;
    viewerReport = report;
    showViewerPhoto(index);
    const dialog = $("#photo-viewer");
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("dialog-open");
  }

  function setupPhotoViewer() {
    const dialog = $("#photo-viewer");
    const image = $("#photo-viewer-image");
    $("#photo-viewer-prev").addEventListener("click", () => showViewerPhoto(viewerIndex - 1));
    $("#photo-viewer-next").addEventListener("click", () => showViewerPhoto(viewerIndex + 1));
    $("#photo-viewer-zoom").addEventListener("click", () => {
      viewerZoom = viewerZoom === 1 ? 2 : 1;
      image.style.transform = `scale(${viewerZoom})`;
      $("#photo-viewer-zoom").textContent = viewerZoom === 1 ? "Zoom +" : "Zoom −";
    });
    image.addEventListener("dblclick", () => $("#photo-viewer-zoom").click());
    image.addEventListener("wheel", event => {
      if (!dialog.open) return;
      event.preventDefault();
      viewerZoom = Math.max(1, Math.min(4, viewerZoom + (event.deltaY < 0 ? .25 : -.25)));
      image.style.transform = `scale(${viewerZoom})`;
      $("#photo-viewer-zoom").textContent = viewerZoom === 1 ? "Zoom +" : "Zoom −";
    }, { passive: false });
    dialog.addEventListener("keydown", event => {
      if (event.key === "ArrowRight") { event.preventDefault(); showViewerPhoto(viewerIndex + 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); showViewerPhoto(viewerIndex - 1); }
    });
    image.addEventListener("touchstart", event => { viewerTouchX = event.touches[0]?.clientX ?? null; }, { passive: true });
    image.addEventListener("touchend", event => {
      if (viewerTouchX === null || viewerZoom !== 1) return;
      const distance = (event.changedTouches[0]?.clientX ?? viewerTouchX) - viewerTouchX;
      if (Math.abs(distance) > 55) showViewerPhoto(viewerIndex + (distance < 0 ? 1 : -1));
      viewerTouchX = null;
    }, { passive: true });
    dialog.addEventListener("close", () => {
      viewerReport = null;
      if (!els.galleryDialog.open) document.body.classList.remove("dialog-open");
    });
  }

  function openGallery(report = state.currentReport) {
    if (!report) return;
    galleryReport = report;
    els.dialogDate.textContent = formatDate(report.date);
    els.dialogTitle.textContent = report.title;
    els.dialogGallery.innerHTML = "";

    report.photos.forEach((photo, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dialog-gallery-item";
      button.setAttribute("aria-label", `Afficher la photo ${index + 1} en plein écran`);
      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.alt || `Photo ${index + 1}`;
      img.loading = "lazy";
      button.appendChild(img);
      button.addEventListener("click", () => openPhotoViewer(report, index));
      const wrapper = document.createElement("div");
      wrapper.className = "selectable-photo";
      wrapper.append(button, selectionCheckbox(report, photo));
      els.dialogGallery.appendChild(wrapper);
    });

    els.galleryDialog.showModal();
    document.body.classList.add("dialog-open");
  }

  function renderVideos(videos) {
    window.segMedia.selectAllVideos = () => videos.filter(v => v.src || v.url).forEach(v => selectExtra({type:"video",src:v.src||v.url,date:v.date}));
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
      if (video.src || video.url) {
        const choose=document.createElement("button"); choose.type="button"; choose.className="btn btn-outline"; choose.textContent="Sélectionner la vidéo";
        const entry={type:"video",src:video.src||video.url,date:video.date};
        choose.addEventListener("click",()=>{toggleExtra(entry);choose.textContent=window.segMedia.isSelected(entry)?"✓ Vidéo sélectionnée":"Sélectionner la vidéo";});
        els.videoGrid.appendChild(choose);
      }
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

    const fullscreenDialog = $("#evolution-fullscreen");
    const player = $("#evolution-player");
    const originalParent = player.parentNode;
    const originalNext = player.nextSibling;
    const fullscreenSlot = $("#evolution-fullscreen-slot");
    let closingFullscreen = false;
    const closeFullscreen = () => {
      stopAutoplay();
      if (player.parentNode === fullscreenSlot) originalParent.insertBefore(player, originalNext);
      if (fullscreenDialog.open && !closingFullscreen) {closingFullscreen=true;fullscreenDialog.close();closingFullscreen=false;}
    };
    fullscreenDialog.addEventListener("close", closeFullscreen);
    $("#evolution-close").addEventListener("click", closeFullscreen);
    fullscreenDialog.addEventListener("click", event => {if(event.target===fullscreenDialog)closeFullscreen();});
    const launchEvolution = () => {
      setMode("evolution");
      fullscreenSlot.appendChild(player);
      if (!fullscreenDialog.open) fullscreenDialog.showModal();
      showEvolutionFrame(0,{animate:false});
      startAutoplay();
    };
    els.evolutionModeButton?.addEventListener("click", launchEvolution);

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

    fetch("data/evolution.json?v=22", { cache: "no-store" })
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
    setupPhotoViewer();
    setupMediaSelection();
    window.addEventListener("seg-select-all-media", () => window.segMedia.selectAllVideos?.());
    setupBeforeAfter();
    setupNavigation();
    setupViewSwitch();

    try {
      const response = await fetch("data/chantier.json?v=25", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      state.reports = [...data.reports].sort((a, b) => b.date.localeCompare(a.date));
      renderArchiveStats();
      renderArchiveFilters();
      renderArchiveCards();
      setupArchiveNavigation();
      renderReport(state.reports[0]);
      renderVideos(data.videos);
      updateStats(data.project, state.reports, data.videos);

      els.openGallery.addEventListener("click", () => openGallery());
    } catch (error) {
      console.error("Impossible de charger les données du chantier :", error);
      els.reportTitle.textContent = "Données indisponibles";
      els.reportDescription.textContent =
        "Lancez le site via un serveur local ou GitHub Pages afin que les fichiers JSON puissent être chargés.";
    }
  }

  init();
})();
