import { Viewer } from "@photo-sphere-viewer/core";
import { EquirectangularVideoAdapter } from "@photo-sphere-viewer/equirectangular-video-adapter";
import { VideoPlugin } from "@photo-sphere-viewer/video-plugin";

let viewer = null;
let media = null;
let generation = 0;

export function destroyVideo() {
  generation++;
  const oldViewer = viewer;
  const oldMedia = media;
  viewer = null;
  media = null;
  oldMedia?.pause();
  oldViewer?.destroy();
  if (oldMedia) {
    oldMedia.removeAttribute("src");
    oldMedia.load();
    oldMedia.remove();
  }
  document.querySelector("#video-viewer").replaceChildren();
}

export function mountVideo(video, onError) {
  destroyVideo();
  const token = generation;
  const container = document.querySelector("#video-viewer");
  const status = document.querySelector("#video-viewer-status");
  // Own the media element so closing the dialog releases playback and network use,
  // including when the user closes it before its metadata has loaded.
  media = document.createElement("video");
  media.crossOrigin = "anonymous";
  media.playsInline = true;
  media.muted = true;
  media.loop = true;
  media.preload = "auto";
  media.addEventListener("error", () => {
    if (token === generation) onError();
  });

  viewer = new Viewer({
    container,
    adapter: [EquirectangularVideoAdapter, { autoplay: false, muted: true }],
    panorama: { source: media },
    plugins: [VideoPlugin],
    navbar: ["videoPlay", "videoVolume", "videoTime", "zoomOut", "zoomIn", "fullscreen"],
    defaultYaw: 0,
    defaultPitch: "-10deg",
    defaultZoomLvl: 30,
    touchmoveTwoFingers: false,
    mousewheel: true,
    mousewheelCtrlKey: false,
    lang: {
      zoom: "Zoom",
      zoomOut: "Dézoomer",
      zoomIn: "Zoomer",
      fullscreen: "Plein écran",
      videoPlay: "Lecture / pause",
      videoVolume: "Volume",
      loadError: "Impossible de lire ce timelapse 360°",
      twoFingers: "Utilisez deux doigts pour explorer",
      ctrlZoom: "Utilisez Ctrl et la molette pour zoomer",
    },
  });
  viewer.addEventListener("ready", () => {
    if (token === generation) status.hidden = true;
  });
  viewer.addEventListener("panorama-error", () => {
    if (token === generation) onError();
  });
  // Start loading only once the viewer and its adapter have registered listeners.
  media.src = video.src;
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) media?.pause();
});
