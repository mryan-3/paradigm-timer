import "./style.css";
import { TimerEngine } from "./timer";
import type { TimerSnapshot } from "./timer";
import { renderPlayIcon, renderPauseIcon, renderResetIcon } from "./icons";

const app = document.querySelector<HTMLDivElement>("#app");
const timer = new TimerEngine("focus-25");

if (app) {
  app.innerHTML = `
    <header style="text-align: center;">
      <h1 style="font-family: var(--font-serif); font-size: 1.5rem; letter-spacing: -0.02em;">ParadigmTimer</h1>
      <p id="timer-status" style="font-size: 0.85rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.25rem;">Focus Session</p>
    </header>
    <main style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem;">
      <div id="time-display" style="font-family: var(--font-serif); font-size: 4.5rem; font-weight: 500; font-variant-numeric: tabular-nums; letter-spacing: -0.04em;">25:00</div>
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <button id="btn-toggle" style="padding: 0.75rem 1.25rem; border-radius: var(--radius-full); background: var(--ink-primary); color: var(--bg-paper); display: flex; align-items: center; gap: 0.5rem; font-weight: 500; box-shadow: var(--shadow-button);">
          <span id="btn-toggle-icon">${renderPlayIcon(18)}</span>
          <span id="btn-toggle-text">Begin</span>
        </button>
        <button id="btn-reset" style="padding: 0.75rem; border-radius: var(--radius-full); background: var(--surface-card); color: var(--ink-secondary); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-button);">
          ${renderResetIcon(18)}
        </button>
      </div>
    </main>
    <footer style="display: flex; gap: 0.5rem;">
      <button id="preset-25" style="padding: 0.4rem 0.85rem; border-radius: var(--radius-full); font-size: 0.8rem; background: var(--surface-card); color: var(--ink-secondary);">25m Focus</button>
      <button id="preset-50" style="padding: 0.4rem 0.85rem; border-radius: var(--radius-full); font-size: 0.8rem; background: var(--surface-card); color: var(--ink-secondary);">50m Deep</button>
      <button id="preset-5" style="padding: 0.4rem 0.85rem; border-radius: var(--radius-full); font-size: 0.8rem; background: var(--surface-card); color: var(--ink-secondary);">5m Rest</button>
    </footer>
  `;

  const timeDisplay = document.querySelector<HTMLDivElement>("#time-display")!;
  const timerStatus = document.querySelector<HTMLParagraphElement>("#timer-status")!;
  const btnToggle = document.querySelector<HTMLButtonElement>("#btn-toggle")!;
  const btnToggleIcon = document.querySelector<HTMLSpanElement>("#btn-toggle-icon")!;
  const btnToggleText = document.querySelector<HTMLSpanElement>("#btn-toggle-text")!;
  const btnReset = document.querySelector<HTMLButtonElement>("#btn-reset")!;

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

  btnToggle.addEventListener("click", () => {
    const snap = timer.getSnapshot();
    if (snap.status === "running") timer.pause();
    else timer.start();
  });

  btnReset.addEventListener("click", () => timer.reset());

  document.querySelector("#preset-25")?.addEventListener("click", () => timer.setMode("focus-25"));
  document.querySelector("#preset-50")?.addEventListener("click", () => timer.setMode("focus-50"));
  document.querySelector("#preset-5")?.addEventListener("click", () => timer.setMode("break-5"));
}
