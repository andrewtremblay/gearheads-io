import Phaser from "phaser";
import { GearConfig } from "@shared/schema";
import { GEAR_COLORS } from "../config";
import { isGameScene } from "../scenes/GameScene";

const uid = function () {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export class Gear extends Phaser.GameObjects.Container {
  id: string;
  body: MatterJS.BodyType | null;
  sprite: Phaser.GameObjects.Graphics;
  radius: number;
  isFixed: boolean;
  gone?: boolean;

  isEqual(g: Gear): boolean {
    return this.id === g.id;
  }

  constructor(scene: Phaser.Scene, config: GearConfig) {
    super(scene, config.x, config.y);
    this.id = uid();
    this.radius = config.radius;
    this.isFixed = config.isFixed || false;

    // Create visual representation
    this.sprite = this.createGearSprite();
    this.add(this.sprite);

    // Create physics body
    const circle = scene.matter.bodies.circle(config.x, config.y, this.radius, {
      friction: 0.7,
      restitution: 0.3,
      density: this.isFixed ? 0.001 : 0.1,
      isStatic: this.isFixed,
      label: "gear",
    });

    this.body = scene.matter.body.create({
      parts: [circle],
      position: { x: config.x, y: config.y },
      isStatic: this.isFixed,
    });

    // Make the gear interactive for dragging
    this.setSize(this.radius * 2, this.radius * 2);
    this.setInteractive();
    if (!this.isFixed) {
      scene.input.setDraggable(this);
    }

    // Add the body to the world
    scene.matter.world.add(this.body);
    scene.add.existing(this);
  }

  private createGearSprite(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    const teeth = Math.floor(this.radius / 5);
    const toothSize = this.radius * 0.2;

    graphics.lineStyle(
      2,
      this.isFixed ? GEAR_COLORS.FIXED : GEAR_COLORS.PLACED
    );
    graphics.beginPath();

    // Draw gear teeth
    for (let i = 0; i < teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      const innerX = Math.cos(angle) * this.radius;
      const innerY = Math.sin(angle) * this.radius;
      const outerX = Math.cos(angle) * (this.radius + toothSize);
      const outerY = Math.sin(angle) * (this.radius + toothSize);

      graphics.moveTo(innerX, innerY);
      graphics.lineTo(outerX, outerY);
    }

    // Draw gear body
    graphics.strokeCircle(0, 0, this.radius);
    graphics.closePath();

    return graphics;
  }

  update() {
    if (this.body && !this.isFixed) {
      this.x = this.body.position.x;
      this.y = this.body.position.y;
      this.rotation = this.body.angle;
      if (isGameScene(this.scene)) {
        const { width, height } = this.scene.sceneSize();
        if (
          this.y - this.radius < 0 ||
          this.y + this.radius > height ||
          this.x - this.radius < 0 ||
          this.x + this.radius > width
        ) {
          this.gone = true;
          this.isFixed = true;
          this.destroy();
        }
      }
    }
  }

  destroy() {
    if (this.body) {
      this.scene.matter.world.remove(this.body);
      this.body = null; // Prevent further access
    }
    if (isGameScene(this.scene)) {
      this.scene.removeGear(this);
    }
    super.destroy();
  }
}
