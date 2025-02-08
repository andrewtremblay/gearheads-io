import { appState, resetGame } from "@/lib/store";
import Phaser from "phaser";

export class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "UIScene" });
  }

  create(data: unknown) {
    const { level, score } = appState;

    // Create UI elements
    this.scoreText = this.add.text(16, 16, `Score: ${score}`, {
      fontSize: "24px",
      color: "#ffffff",
    });

    this.levelText = this.add.text(16, 48, `Level: ${level}`, {
      fontSize: "24px",
      color: "#ffffff",
    });

    // Listen for game events
    this.events.on("levelComplete", this.showLevelComplete, this);
    this.events.on("gameOver", this.showGameOver, this);

    if (
      typeof data === "object" &&
      data &&
      "style" in data &&
      data.style === "levelComplete"
    ) {
      this.showLevelComplete();
    } else {
      this.showGameOver();
    }
  }

  private showLevelComplete() {
    // "Next Level" button eventually
    this.showOverlay("Level Complete!", "", () => {
      // Show ad before next level
      if (typeof (window as any).adsbygoogle !== "undefined") {
        window.dispatchEvent(new CustomEvent("showAd"));
      }

      // Load next level
      this.scene.start("GameScene");
    });
  }

  private showGameOver() {
    this.showOverlay("Game Over!", "Try Again", () => {
      // Show ad before retry
      if ((window as any).adsbygoogle !== undefined) {
        window.dispatchEvent(new CustomEvent("showAd"));
      }

      // Reset game state
      resetGame();
      this.scene.start("GameScene");
    });
  }

  private showOverlay(
    message: string,
    buttonText: string,
    callback: () => void
  ) {
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

    const text = this.add
      .text(400, 250, message, {
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    if (buttonText) {
      const button = this.add
        .text(400, 350, buttonText, {
          fontSize: "32px",
          color: "#ffffff",
          backgroundColor: "#444444",
          padding: { x: 20, y: 10 },
        })
        .setOrigin(0.5)
        .setInteractive();

      button.on("pointerup", () => {
        callback();
        overlay.destroy();
        text.destroy();
        button.destroy();
      });
    }
  }

  update() {
    const { level, score } = appState;
    this.scoreText.setText(`Score: ${score}`);
    this.levelText.setText(`Level: ${level}`);
  }
}
