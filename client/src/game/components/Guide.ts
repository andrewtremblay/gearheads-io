import Phaser from "phaser";

export class Guide extends Phaser.GameObjects.Container {
  sprite: Phaser.GameObjects.Graphics;
  height: number;
  visible: boolean;
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.height = scene.cameras.main.height;
    this.sprite = this.createGuideSprite();
    this.visible = true;
    this.add(this.sprite);
    scene.add.existing(this);
  }

  private createGuideSprite(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.lineBetween(0, 0, 0, this.height);
    return graphics;
  }

  showLine() {
    this.sprite.alpha = 1;
  }

  hideLine() {
    this.sprite.alpha = 0;
  }

  destroy() {
    super.destroy();
  }
}
