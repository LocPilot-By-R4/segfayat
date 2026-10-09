import { Viewer } from "@photo-sphere-viewer/core";
import { DualFisheyeAdapter } from "@photo-sphere-viewer/dual-fisheye-adapter";

const $ = (selector, scope = document) => scope.querySelector(selector);

const state = {
  data: null,
  viewer: null,
  currentPlace: null,
};

function isPhone() {
  return window.matchMedia("(max-width: 600px)").matches;
}

function navbar() {
  return isPhone()
    ? ["fullscreen"]
    : ["zoomOut", "zoomIn", "fullscreen"];
}

function showError(show) {
  const shell = $("#viewer-shell");
  const fallback = $("#viewer-fallback");
  shell?.classList.toggle("has-error", show);
  if (fallback) fallback.hidden = !show;
}

function renderPlaces() {
  const list = $("#pano-place-list");
  list.innerHTML = "";

  state.data.places.forEach((place, index) => {
    const shot = place.shots[0];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `pano-choice${index === 0 ? " active" : ""}`;
    button.dataset.placeId = place.id;
    button.innerHTML = `
      <img class="thumb" src="${shot.thumbnail}" alt="" loading="lazy" decoding="async">
      <span>${place.label}</span>
    `;
    button.addEventListener("click", () => selectPlace(place.id));
    list.appendChild(button);
  });
}

function panoEntry(place=state.currentPlace) {return place ? {type:"panorama",src:place.shots[0].panorama,date:"2026-09-03"}:null;}
function updatePanoramaSelection() {const e=panoEntry(); const b=$("#pano-select-current");if(e && b)b.textContent=window.segMedia?.isSelected(e)?"✓ Panorama sélectionné":"Sélectionner ce panorama";}
async function selectPlace(placeId) {
  const place = state.data.places.find(item => item.id === placeId);
  if (!place || !state.viewer) return;

  state.currentPlace = place;
  const shot = place.shots[0];

  $("#viewer-place-label").textContent = place.label;
  updatePanoramaSelection();
  document.querySelectorAll(".pano-choice").forEach(button => {
    button.classList.toggle("active", button.dataset.placeId === placeId);
  });

  showError(false);

  try {
    await state.viewer.setPanorama(shot.panorama, {
      caption: `${place.label} · 3 septembre 2026`,
      transition: true,
      showLoader: true,
    });
  } catch (error) {
    console.error(error);
    showError(true);
  }
}

async function init() {
  try {
    const response = await fetch("data/panoramas.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();

    const first = state.data.places[0];
    state.currentPlace = first;

    state.viewer = new Viewer({
      container: $("#viewer"),
      panorama: first.shots[0].panorama,
      adapter: DualFisheyeAdapter,
      navbar: navbar(),
      touchmoveTwoFingers: false,
      mousewheel: false,
      mousewheelCtrlKey: false,
      defaultZoomLvl: 30,
    });

    renderPlaces();
    updatePanoramaSelection();
    window.addEventListener("seg-media-selection-change", updatePanoramaSelection);
    $("#pano-select-current")?.addEventListener("click",()=>{const e=panoEntry();if(e){window.segMedia?.toggleExtra(e);updatePanoramaSelection();}});
    $("#pano-select-all")?.addEventListener("click",()=>{state.data.places.forEach(place=>window.segMedia?.selectExtra(panoEntry(place)));updatePanoramaSelection();});
    $("#pano-download-current")?.addEventListener("click",()=>{const e=panoEntry();if(!e)return;const a=document.createElement("a");a.href=e.src;a.download=e.src.split("/").pop();document.body.appendChild(a);a.click();a.remove();});
    window.addEventListener("seg-select-all-media",()=>{state.data.places.forEach(place=>window.segMedia?.selectExtra(panoEntry(place)));updatePanoramaSelection();});

    state.viewer.addEventListener("panorama-error", () => showError(true));
    state.viewer.addEventListener("panorama-loaded", () => showError(false));

    $("#viewer-retry")?.addEventListener("click", () => {
      selectPlace(state.currentPlace.id);
    });
  } catch (error) {
    console.error("Initialisation 360° impossible :", error);
    showError(true);
  }
}

init();
