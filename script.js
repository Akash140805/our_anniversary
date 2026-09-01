/* =========================================================
   Anniversary website interactions
   Easy-to-edit values:
   - MUSIC_PATH is in index.html
   - scene positions/sizes are CSS variables in style.css
   ========================================================= */

(() => {
  const scene = document.getElementById("scene");
  const intro = document.getElementById("intro");
  const envelopeButton = document.getElementById("envelope");
  const envelope = envelopeButton.querySelector(".envelope");
  const overlay = document.getElementById("letterOverlay");
  const closeLetter = document.getElementById("closeLetter");
  const music = document.getElementById("music");
  const musicControl = document.getElementById("musicControl");
  const musicState = musicControl.querySelector(".music-state");
  const anniversaryCelebration =
  document.getElementById("anniversaryCelebration");

  let musicPlaying = false;
  let fadeTimer = null;
  let firstInteractionHandled = false;

  // ---------------------------------------------------------
  // Intro
  // ---------------------------------------------------------
  function hideIntro() {
    if (!intro.classList.contains("is-hidden")) {
      intro.classList.add("is-hidden");
      intro.setAttribute("aria-hidden", "true");
    }
  }

  // ---------------------------------------------------------
  // Music
  // Browsers require a real user gesture before audible playback.
  // We start muted/at zero volume, then fade in after that gesture.
  // ---------------------------------------------------------
  function clearFade() {
    if (fadeTimer) {
      clearInterval(fadeTimer);
      fadeTimer = null;
    }
  }

  function fadeTo(target, duration = 3000, onDone = null) {
    clearFade();

    const start = music.volume;
    const difference = target - start;
    const steps = Math.max(1, Math.round(duration / 40));
    let step = 0;

    fadeTimer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      music.volume = Math.min(1, Math.max(0, start + difference * progress));

      if (progress >= 1) {
        clearFade();
        if (onDone) onDone();
      }
    }, 40);
  }

  async function startMusic() {
    if (musicPlaying) return;

    try {
      music.volume = 0;
      await music.play();
      musicPlaying = true;
      musicControl.setAttribute("aria-pressed", "true");
      musicControl.setAttribute("aria-label", "Pause music");
      musicState.textContent = "Music";
      fadeTo(0.20, 3000);
    } catch {
      // If the browser still rejects playback, the next real interaction
      // will try again. Nothing visually breaks.
      musicPlaying = false;
    }
  }

  function stopMusic() {
    if (!musicPlaying) return;

    fadeTo(0, 1500, () => {
      music.pause();
      musicPlaying = false;
      musicControl.setAttribute("aria-pressed", "false");
      musicControl.setAttribute("aria-label", "Play music");
    });
  }

  function handleFirstInteraction(event) {
    // Don't treat the music control itself as the "first scene" interaction;
    // its own click handler has explicit behavior.
    if (event.target.closest("#musicControl")) return;

    hideIntro();

    if (!firstInteractionHandled) {
      firstInteractionHandled = true;
      startMusic();
    }
  }

  scene.addEventListener("pointerdown", handleFirstInteraction, { passive: true });

  musicControl.addEventListener("click", (event) => {
    event.stopPropagation();
    hideIntro();

    if (musicPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  });

  // ---------------------------------------------------------
  // Letter
  // ---------------------------------------------------------
  function openLetter() {
    hideIntro();
    envelope.classList.add("is-opening");

    // Let the physical envelope animation start before the letter expands.
    window.setTimeout(() => {
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      window.setTimeout(() => closeLetter.focus(), 150);
    }, 450);
  }

  function closeTheLetter() {
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  window.setTimeout(() => {
    envelope.classList.remove("is-opening");
    envelopeButton.focus();

    // Start the anniversary celebration
    window.setTimeout(() => {
      anniversaryCelebration.classList.add("is-active");
      anniversaryCelebration.setAttribute("aria-hidden", "false");
    }, 500);

  }, 650);
}

  envelopeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    openLetter();
  });

  closeLetter.addEventListener("click", closeTheLetter);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target.classList.contains("letter-backdrop")) {
      closeTheLetter();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      closeTheLetter();
    }
  });

  // Prevent an accidental page-scroll gesture from ever becoming
  // navigation; the entire experience remains one fixed scene.
  window.addEventListener("wheel", (event) => {
    if (!overlay.classList.contains("is-open")) event.preventDefault();
  }, { passive: false });

  // The opened letter is intentionally the only independently scrollable area.
  window.addEventListener("touchmove", (event) => {
    if (!overlay.classList.contains("is-open")) event.preventDefault();
  }, { passive: false });

  // =========================================================
// BUTTERFLY MOVEMENT
// =========================================================
//
// Four independent butterflies.
//
// Butterfly 1 + 2:
// Stay around the girl/couple.
//
// Butterfly 3 + 4:
// Travel around the wider beach scene.
//
// They intentionally have different speeds and paths.
// =========================================================

const butterflies = [
  {
    element: document.querySelector(".butterfly-1"),

    // Area around the girl
    centerX: 0.69,
    centerY: 0.42,

    radiusX: 0.045,
    radiusY: 0.055,

    speed: 0.00042,
    phase: 0,

    rotation: 0
  },

  {
    element: document.querySelector(".butterfly-2"),

    // Slightly farther from the first butterfly
    centerX: 0.76,
    centerY: 0.40,

    radiusX: 0.055,
    radiusY: 0.045,

    speed: 0.00031,
    phase: 2.5,

    rotation: 0
  },

  {
    element: document.querySelector(".butterfly-3"),

    // Larger movement across the beach
    centerX: 0.40,
    centerY: 0.36,

    radiusX: 0.22,
    radiusY: 0.14,

    speed: 0.00015,
    phase: 1.2,

    rotation: 0
  },

  {
    element: document.querySelector(".butterfly-4"),

    // Different large path
    centerX: 0.70,
    centerY: 0.32,

    radiusX: 0.20,
    radiusY: 0.18,

    speed: 0.00011,
    phase: 4.5,

    rotation: 0
  }
];

function animateButterflies(time) {
  butterflies.forEach((butterfly, index) => {
    if (!butterfly.element) return;

    const t = time * butterfly.speed + butterfly.phase;

    let x;
    let y;

    if (index < 2) {
      /*
       * Near-girl butterflies.
       *
       * Small looping paths so they remain
       * close to the girl.
       */

      x =
        butterfly.centerX +
        Math.sin(t * 1.3) * butterfly.radiusX +
        Math.sin(t * 2.1) * butterfly.radiusX * 0.35;

      y =
        butterfly.centerY +
        Math.cos(t * 1.7) * butterfly.radiusY +
        Math.sin(t * 2.4) * butterfly.radiusY * 0.3;

    } else {
      /*
       * Wide-scene butterflies.
       *
       * Their paths are deliberately much larger.
       */

      x =
        butterfly.centerX +
        Math.sin(t) * butterfly.radiusX +
        Math.sin(t * 0.47) * butterfly.radiusX * 0.35;

      y =
        butterfly.centerY +
        Math.cos(t * 0.83) * butterfly.radiusY +
        Math.sin(t * 0.39) * butterfly.radiusY * 0.35;
    }

    /*
     * Convert normalized coordinates to pixels.
     */
    const px = x * window.innerWidth;
    const py = y * window.innerHeight;

    /*
     * Direction-based rotation makes the butterfly
     * appear to actually change direction.
     */
    const direction =
      Math.cos(t) * 8 +
      Math.sin(t * 1.7) * 5;

    butterfly.element.style.transform =
      `translate3d(${px}px, ${py}px, 0) rotate(${direction}deg)`;
  });

  requestAnimationFrame(animateButterflies);
}

requestAnimationFrame(animateButterflies);

// =========================================================
// CAT PLAY MOVEMENT
// =========================================================
//
// The cat moves gently around a small area instead of
// remaining in exactly the same pixel position.
//
// It pauses, looks/plays, then takes a few small steps.
// =========================================================

const cat = document.querySelector(".cat");

if (cat) {

  const catMovement = {
    startX: 20,
    startY: 61,

    // Maximum movement away from starting point.
    // Increase these if you want more movement.
    rangeX: 1.5,
    rangeY: 0.7,

    time: 0,
    lastTime: 0
  };

  function animateCat(timestamp) {

    if (!catMovement.lastTime) {
      catMovement.lastTime = timestamp;
    }

    const delta = timestamp - catMovement.lastTime;
    catMovement.lastTime = timestamp;

    catMovement.time += delta;

    /*
     * Slow continuous movement.
     *
     * Different sine speeds prevent the movement
     * from looking like a simple left-right animation.
     */
    const t = catMovement.time * 0.00055;

    const x =
      catMovement.startX +
      Math.sin(t) * catMovement.rangeX +
      Math.sin(t * 1.7) * 0.7;

    const y =
      catMovement.startY +
      Math.sin(t * 1.4) * catMovement.rangeY;

    /*
     * Slight rotation depending on direction.
     */
    const direction =
      Math.cos(t) * 3;

    cat.style.left = `${x}%`;
    cat.style.top = `${y}%`;

    cat.style.transform =
      `translate(-50%, -50%) rotate(${direction}deg)`;

    requestAnimationFrame(animateCat);
  }

  requestAnimationFrame(animateCat);
}
})();
