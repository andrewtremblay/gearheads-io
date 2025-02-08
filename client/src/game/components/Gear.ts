import Phaser from 'phaser';
import { GearConfig } from '@shared/schema';
import { GEAR_COLORS } from '../config';

export class Gear extends Phaser.GameObjects.Container {
  body: MatterJS.BodyType;
  sprite: Phaser.GameObjects.Graphics;
  radius: number;
  isFixed: boolean;

  constructor(scene: Phaser.Scene, config: GearConfig) {
    super(scene, config.x, config.y);

    this.radius = config.radius;
    this.isFixed = config.isFixed || false;

    // Create visual representation
    this.sprite = this.createGearSprite();
    this.add(this.sprite);

    // Create physics body
    const circle = scene.matter.bodies.circle(0, 0, this.radius, {
      friction: 0.7,
      restitution: 0.3,
      density: this.isFixed ? 0.001 : 0.1,
      isStatic: this.isFixed,
      label: 'gear',
    });

    this.body = scene.matter.body.create({
      parts: [circle],
      position: { x: config.x, y: config.y }
    });

    // Make the gear interactive for dragging
    this.setSize(this.radius * 2, this.radius * 2);
    this.setInteractive();
    scene.input.setDraggable(this);

    // Add the body to the world
    scene.matter.world.add(this.body);
    scene.add.existing(this);
  }

  private createGearSprite(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    const teeth = Math.floor(this.radius / 5);
    const toothSize = this.radius * 0.2;

    graphics.lineStyle(2, this.isFixed ? GEAR_COLORS.FIXED : GEAR_COLORS.PLACED);
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
    if (this.body) {
      this.x = this.body.position.x;
      this.y = this.body.position.y;
      this.rotation = this.body.angle;
    }
  }

  destroy() {
    if (this.body) {
      this.scene.matter.world.remove(this.body);
    }
    super.destroy();
  }
}