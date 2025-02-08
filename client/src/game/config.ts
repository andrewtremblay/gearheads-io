import Phaser from 'phaser';

export const gameConfig: Partial<Phaser.Types.Core.GameConfig> = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 1 },
      debug: true
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

export const GEAR_COLORS = {
  FIXED: 0xff0000,    // Red for fixed gears
  PLACED: 0x00ff00,   // Green for placed gears
  INVENTORY: 0xffff00 // Yellow for inventory gears
};

export const GEAR_SIZES = [20, 30, 40, 50];