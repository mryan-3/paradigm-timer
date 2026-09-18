import "./style.css";
import { TimerEngine } from "./timer";
import type { TimerSnapshot, TimerMode } from "./timer";
import { SoundSynthesizer } from "./audio";
import { CanvasRenderer, renderClockDial } from "./canvas";
import type { SceneId } from "./canvas";
import {
  renderPlayIcon,
  renderPauseIcon,
  renderResetIcon,
  renderSoundOnIcon,
  renderSoundOffIcon,
} from "./icons";

const app = document.querySelector<HTMLDivElement>("#app");
const timer = new TimerEngine("focus-25");
const sound = new SoundSynthesizer();

if (app) {
  const canvas = document.createElement("canvas");
  canvas.className = "canvas-backdrop";
  document.body.prepend(canvas);
  const renderer = new CanvasRenderer(canvas);

  app.innerHTML = `
    <header style="width: 100%; display: flex; justify-content: space-between; align-items: flex-start; z-index: 10;">
      <div id="clock-container" style="display: flex; flex-direction: column; align-items: flex-start; gap: 1rem;">
        <canvas id="clock-dial-canvas"></canvas>
        <div id="clock-info" style="display: none; flex-direction: column;">
          <span id="time-display" class="clock-digital-time">25:00</span>
          <span id="status-pill" class="clock-status-label" style="margin-top: 0.2rem;">Ready</span>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 1rem;">
        <div class="pill-group">
          <button id="preset-25" class="selector-pill active">25m Focus</button>
          <button id="preset-50" class="selector-pill">50m Deep</button>
          <button id="preset-5" class="selector-pill">5m Rest</button>
        </div>
        
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <button id="btn-toggle" class="btn-primary">
            <span id="btn-toggle-icon">${renderPlayIcon(16)}</span>
            <span id="btn-toggle-text">Begin</span>
          </button>
          <button id="btn-reset" class="btn-icon" title="Reset Session">
            ${renderResetIcon(16)}
          </button>
          <button id="btn-sound" class="btn-icon" title="Toggle Sound">
            ${renderSoundOnIcon(16)}
          </button>
        </div>
      </div>
    </header>

    <!-- Center is completely open for the hand-drawn artwork -->

    <footer id="bottom-deck" class="bottom-deck">
      <div class="pill-group">
        <button id="scene-lake" class="selector-pill">Lake & Boat</button>
        <button id="scene-botanical" class="selector-pill active">Botanical</button>
        <button id="scene-orrery" class="selector-pill">Orrery</button>
        <button id="scene-terrarium" class="selector-pill">Terrarium</button>
        <button id="scene-seasons" class="selector-pill">Cabin & Seasons</button>
      </div>
    </footer>
  `;

  const clockCanvas = document.querySelector<HTMLCanvasElement>("#clock-dial-canvas")!;
  const clockInfo = document.querySelector<HTMLDivElement>("#clock-info")!;
  const timeDisplay = document.querySelector<HTMLSpanElement>("#time-display")!;
  const statusPill = document.querySelector<HTMLSpanElement>("#status-pill")!;
  const btnToggle = document.querySelector<HTMLButtonElement>("#btn-toggle")!;
  const btnToggleIcon = document.querySelector<HTMLSpanElement>("#btn-toggle-icon")!;
  const btnToggleText = document.querySelector<HTMLSpanElement>("#btn-toggle-text")!;
  const btnReset = document.querySelector<HTMLButtonElement>("#btn-reset")!;
  const btnSound = document.querySelector<HTMLButtonElement>("#btn-sound")!;
  const bottomDeck = document.querySelector<HTMLElement>("#bottom-deck")!;

  let idleTimer: number | null = null;
  const resetIdleTimer = () => {
    bottomDeck.classList.remove("idle-dim");
    if (idleTimer) window.clearTimeout(idleTimer);
    if (timer.getSnapshot().status === "running") {
      idleTimer = window.setTimeout(() => bottomDeck.classList.add("idle-dim"), 3500);
    }
  };
  window.addEventListener("mousemove", resetIdleTimer);

  const updateUI = (snap: TimerSnapshot) => {
    timeDisplay.textContent = snap.formattedTime;
    const totalMinutes = Math.round(snap.totalSeconds / 60);

    // Update canvas scenery and top analog clock
    renderer.setProgress(snap.progress, snap.status === "running");
    renderClockDial(clockCanvas, snap.progress, totalMinutes, renderer.getPalette());

    const isBreak = snap.mode.includes("break");
    statusPill.textContent = snap.status === "running" ? (isBreak ? "Resting" : "Focusing") : snap.status === "paused" ? "Paused" : "Ready";

    if (snap.status === "running") {
      btnToggleIcon.innerHTML = renderPauseIcon(16);
      btnToggleText.textContent = "Pause";
      resetIdleTimer();
    } else {
      btnToggleIcon.innerHTML = renderPlayIcon(16);
      btnToggleText.textContent = snap.status === "paused" ? "Resume" : "Begin";
      bottomDeck.classList.remove("idle-dim");
    }
  };

  timer.onTick(updateUI);
  timer.onMilestone(() => sound.playChime("milestone"));
  timer.onComplete(() => {
    sound.stopAmbientFocus();
    sound.playChime("complete");
    bottomDeck.classList.remove("idle-dim");
  });

  btnToggle.addEventListener("click", () => {
    clockInfo.style.display = "flex"; // Show clock text when started
    const snap = timer.getSnapshot();
    if (snap.status === "running") {
      timer.pause();
      sound.stopAmbientFocus();
    } else {
      sound.playChime("start");
      sound.startAmbientFocus();
      timer.start();
    }
  });

  btnReset.addEventListener("click", () => {
    sound.stopAmbientFocus();
    timer.reset();
  });

  btnSound.addEventListener("click", () => {
    const isMuted = sound.toggleMute();
    btnSound.innerHTML = isMuted ? renderSoundOffIcon(16) : renderSoundOnIcon(16);
  });

  const sceneButtons: Record<SceneId, string> = {
    lake: "#scene-lake",
    botanical: "#scene-botanical",
    orrery: "#scene-orrery",
    terrarium: "#scene-terrarium",
    seasons: "#scene-seasons",
  };

  Object.entries(sceneButtons).forEach(([sceneId, selector]) => {
    const btn = document.querySelector<HTMLButtonElement>(selector);
    btn?.addEventListener("click", () => {
      Object.values(sceneButtons).forEach((s) => document.querySelector(s)?.classList.remove("active"));
      btn.classList.add("active");
      renderer.setScene(sceneId as SceneId);
    });
  });

  const setupPreset = (selector: string, mode: TimerMode) => {
    const btn = document.querySelector<HTMLButtonElement>(selector);
    btn?.addEventListener("click", () => {
      clockInfo.style.display = "flex"; // Show clock text when preset selected
      document.querySelectorAll("header .pill-group .selector-pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      sound.stopAmbientFocus();
      timer.setMode(mode);
    });
  };

  setupPreset("#preset-25", "focus-25");
  setupPreset("#preset-50", "focus-50");
  setupPreset("#preset-5", "break-5");
}
