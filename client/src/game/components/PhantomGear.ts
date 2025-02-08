import { GEAR_COLORS } from "../config";

export class PhantomGear extends Phaser.GameObjects.Container {
  radius: number;
  sprite: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    super(scene, -100, -100);
    this.radius = 50;
    this.sprite = this.createGearSprite();
    this.add(this.sprite);
    scene.add.existing(this);
  }

  updateRadius(newRadius: number) {
    this.radius = newRadius;
    this.sprite.clear();
    this.sprite = this.createGearSprite();
    this.add(this.sprite);
  }

  hide() {
    this.sprite.alpha = 0;
  }
  show() {
    this.sprite.alpha = 0.5;
  }

  private createGearSprite(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(2, GEAR_COLORS.PLACED, 0.5);
    graphics.strokeCircle(0, 0, this.radius);
    return graphics;
  }
}
