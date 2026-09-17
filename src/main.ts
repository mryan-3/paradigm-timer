import "./style.css";
import { TimerEngine } from "./timer";
import type { TimerSnapshot } from "./timer";
import { SoundSynthesizer } from "./audio";
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
  app.innerHTML = `
    <header style="width: 100%; max-width: 480px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="font-family: var(--font-serif); font-size: 1.4rem; letter-spacing: -0.02em;">ParadigmTimer</h1>
        <p id="timer-status" style="font-size: 0.8rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.15rem;">Focus Session</p>
      </div>
      <button id="btn-sound" style="padding: 0.5rem; border-radius: var(--radius-full); background: var(--surface-card); color: var(--ink-secondary); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-button);" title="Toggle Sound">
        ${renderSoundOnIcon(18)}
      </button>
    </header>

    <main style="display: flex; flex-direction: column; align-items: center; gap: 1.75rem;">
      <div id="time-display" style="font-family: var(--font-serif); font-size: 5rem; font-weight: 500; font-variant-numeric: tabular-nums; letter-spacing: -0.04em; color: var(--ink-primary);">25:00</div>
      
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <button id="btn-toggle" style="padding: 0.85rem 1.5rem; border-radius: var(--radius-full); background: var(--ink-primary); color: var(--bg-paper); display: flex; align-items: center; gap: 0.6rem; font-weight: 500; box-shadow: var(--shadow-button);">
          <span id="btn-toggle-icon">${renderPlayIcon(18)}</span>
          <span id="btn-toggle-text">Begin</span>
        </button>
        <button id="btn-reset" style="padding: 0.85rem; border-radius: var(--radius-full); background: var(--surface-card); color: var(--ink-secondary); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-button);" title="Reset Session">
          ${renderResetIcon(18)}
        </button>
      </div>
    </main>

    <footer style="display: flex; gap: 0.5rem; background: var(--surface-card); padding: 0.35rem; border-radius: var(--radius-full); box-shadow: var(--shadow-card);">
      <button id="preset-25" style="padding: 0.45rem 1rem; border-radius: var(--radius-full); font-size: 0.82rem; font-weight: 500; color: var(--ink-primary); background: rgba(255,255,255,0.85);">25m Focus</button>
      <button id="preset-50" style="padding: 0.45rem 1rem; border-radius: var(--radius-full); font-size: 0.82rem; font-weight: 500; color: var(--ink-secondary);">50m Deep</button>
      <button id="preset-5" style="padding: 0.45rem 1rem; border-radius: var(--radius-full); font-size: 0.82rem; font-weight: 500; color: var(--ink-secondary);">5m Rest</button>
    </footer>
  `;

  const timeDisplay = document.querySelector<HTMLDivElement>("#time-display")!;
  const timerStatus = document.querySelector<HTMLParagraphElement>("#timer-status")!;
  const btnToggle = document.querySelector<HTMLButtonElement>("#btn-toggle")!;
  const btnToggleIcon = document.querySelector<HTMLSpanElement>("#btn-toggle-icon")!;
  const btnToggleText = document.querySelector<HTMLSpanElement>("#btn-toggle-text")!;
  const btnReset = document.querySelector<HTMLButtonElement>("#btn-reset")!;
  const btnSound = document.querySelector<HTMLButtonElement>("#btn-sound")!;

  const updateUI = (snap: TimerSnapshot) => {
    timeDisplay.textContent = snap.formattedTime;
    timerStatus.textContent = snap.status === "running" ? "In Focus" : snap.status === "paused" ? "Paused" : snap.mode.includes("break") ? "Rest Period" : "Ready";
    if (snap.status === "running") {
      btnToggleIcon.innerHTML = renderPauseIcon(18);
      btnToggleText.textContent = "Pause";
    } else {
      btnToggleIcon.innerHTML = renderPlayIcon(18);
      btnToggleText.textContent = snap.status === "paused" ? "Resume" : "Begin";
    }
  };

  timer.onTick(updateUI);

  timer.onMilestone(() => {
    sound.playChime("milestone");
  });

  timer.onComplete(() => {
    sound.stopAmbientFocus();
    sound.playChime("complete");
  });

  btnToggle.addEventListener("click", () => {
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
    btnSound.innerHTML = isMuted ? renderSoundOffIcon(18) : renderSoundOnIcon(18);
  });

  const setupPreset = (id: string, mode: "focus-25" | "focus-50" | "break-5") => {
    document.querySelector(id)?.addEventListener("click", () => {
      sound.stopAmbientFocus();
      timer.setMode(mode);
    });
  };

  setupPreset("#preset-25", "focus-25");
  setupPreset("#preset-50", "focus-50");
  setupPreset("#preset-5", "break-5");
}
