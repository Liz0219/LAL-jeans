(function () {
  const video = document.getElementById("measurement-video");
  const playBtn = document.getElementById("measurement-play");

  if (!video || !playBtn) return;

  video.removeAttribute("controls");

  const showOverlay = () => playBtn.classList.remove("is-hidden");
  const hideOverlay = () => playBtn.classList.add("is-hidden");

  playBtn.addEventListener("click", () => {
    video.play();
    video.setAttribute("controls", "");
    hideOverlay();
  });

  video.addEventListener("play", hideOverlay);
  video.addEventListener("pause", showOverlay);
  video.addEventListener("ended", showOverlay);
})();
