import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import { UIScene } from "./scenes/UIScene";
import { gameConfig } from "./config";

export default function GearGame() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      ...gameConfig,
      scene: [GameScene, UIScene],
      parent: "game-container",
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      id="game-container"
      className="aspect-video w-full rounded-lg overflow-hidden"
    />
  );
}
