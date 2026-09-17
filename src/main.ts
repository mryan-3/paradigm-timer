import "./style.css";
import {
  renderPlayIcon,
  renderPauseIcon,
  renderResetIcon,
  renderSoundOnIcon,
  renderFocusIcon,
  renderCoffeeIcon,
} from "./icons";

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = `
    <header class="app-header">
      <h1 style="font-family: var(--font-serif); font-size: 1.5rem; letter-spacing: -0.02em;">ParadigmTimer</h1>
    </header>
    <main style="display: flex; gap: 1rem; align-items: center; color: var(--ink-secondary);">
      <span>${renderFocusIcon(24)}</span>
      <span>${renderCoffeeIcon(24)}</span>
      <span>${renderPlayIcon(24)}</span>
      <span>${renderPauseIcon(24)}</span>
      <span>${renderResetIcon(24)}</span>
      <span>${renderSoundOnIcon(24)}</span>
    </main>
  `;
}
