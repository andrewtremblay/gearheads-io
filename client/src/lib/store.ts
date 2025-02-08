import { proxy, useSnapshot } from "valtio";

interface GameState {
  level: number;
  score: number;
}

// Load initial state from localStorage
const loadInitialState = (): GameState => {
  const savedState = localStorage.getItem("gameState");
  if (savedState) {
    try {
      const { level, score } = JSON.parse(savedState);
      return { level, score };
    } catch (e) {
      console.error("Failed to parse saved game state:", e);
    }
  }
  return { level: 1, score: 0 };
};

export const appState = proxy<GameState>({
  ...loadInitialState(),
  level: 1,
  score: 0,
});

export const incrementLevel: () => void = () => {
  appState.level = appState.level + 1;
  localStorage.setItem("gameState", JSON.stringify(appState));
};
export const addScore: (points: number) => void = (points) => {
  appState.score = appState.score + points;
  localStorage.setItem("gameState", JSON.stringify(appState));
};
export const resetGame: () => void = () => {
  appState.level = 1;
  appState.score = 0;
  localStorage.setItem("gameState", JSON.stringify(appState));
};
