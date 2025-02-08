import Phaser from "phaser";
import { Gear } from "../components/Gear";
import { Inventory } from "../components/Inventory";
import { GearConfig, LevelConfig } from "@shared/schema";
import { GEAR_SIZES } from "../config";
import { addScore, incrementLevel } from "@/lib/store";

export class GameScene extends Phaser.Scene {
  private gears: Gear[] = [];
  private inventory!: Inventory;
  private selectedGear: Gear | null = null;
  private startGear: Gear | null = null;
  private endGear: Gear | null = null;
  private winCheckTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create physical walls
    const wallThickness = 60;

    // Ground
    this.matter.add.rectangle(width / 2, height, width, wallThickness, {
      isStatic: true,
      label: "ground",
    });

    // Left wall
    this.matter.add.rectangle(0, height / 2, wallThickness, height, {
      isStatic: true,
      label: "leftWall",
    });

    // Right wall
    this.matter.add.rectangle(width, height / 2, wallThickness, height, {
      isStatic: true,
      label: "rightWall",
    });

    // Generate default level
    const defaultConfig: LevelConfig = {
      gears: [
        { x: 100, y: height / 2, radius: GEAR_SIZES[2], isFixed: true }, // Fixed gear on left side
        { x: width - 100, y: height / 2, radius: GEAR_SIZES[2], isFixed: true }, // Fixed gear on right side
      ],
      inventory: [
        { x: 0, y: 0, radius: GEAR_SIZES[1] },
        { x: 0, y: 0, radius: GEAR_SIZES[1] },
        { x: 0, y: 0, radius: GEAR_SIZES[0] },
      ],
    };

    this.initLevel(defaultConfig);

    // Setup drag events
    this.input.on("dragstart", this.onDragStart, this);
    this.input.on("drag", this.onDrag, this);
    this.input.on("dragend", this.onDragEnd, this);

    // Start win condition check timer
    if (this.winCheckTimer) {
      this.winCheckTimer.destroy();
    }
    this.winCheckTimer = this.time.addEvent({
      delay: 1000,
      callback: this.checkWinCondition,
      callbackScope: this,
      loop: true,
    });

    // Set start and end gears
    this.startGear = this.gears[0];
    this.endGear = this.gears[1];
  }

  initLevel(levelConfig: LevelConfig) {
    // Clear existing gears
    this.gears.forEach((gear) => gear.destroy());
    this.gears = [];

    // Initialize inventory with provided gears
    this.inventory = new Inventory(levelConfig.inventory || []);

    // Create fixed gears
    levelConfig.gears.forEach((gear) => {
      const newGear = new Gear(this, gear);
      this.gears.push(newGear);
    });
  }

  private onDragStart(pointer: Phaser.Input.Pointer, gameObject: Gear) {
    if (gameObject.isFixed) return; // Don't allow dragging fixed gears

    this.selectedGear = gameObject;
    if (this.selectedGear.body) {
      this.selectedGear.body.isStatic = true;
    }
  }

  private onDrag(
    pointer: Phaser.Input.Pointer,
    gameObject: Gear,
    dragX: number,
    dragY: number
  ) {
    if (
      this.selectedGear &&
      this.selectedGear.body &&
      !this.selectedGear.isFixed
    ) {
      this.matter.body.setPosition(this.selectedGear.body, {
        x: dragX,
        y: dragY,
      });
    }
  }

  private onDragEnd(pointer: Phaser.Input.Pointer, gameObject: Gear) {
    if (this.selectedGear && !this.selectedGear.isFixed) {
      if (this.selectedGear.body) {
        this.selectedGear.body.isStatic = false;
      }

      // Check if the gear is connected to any other gear
      const isConnected = this.gears.some(
        (other) =>
          other !== gameObject && this.areGearsConnected(gameObject, other)
      );

      if (!isConnected) {
        // Remove the gear if it's not connected
        this.gears = this.gears.filter((g) => g !== gameObject);
        gameObject.destroy();

        // Check if we've run out of gears
        if (this.inventory.isEmpty() && this.gears.length <= 2) {
          this.scene.get("UIScene").events.emit("gameOver");
        }
      }

      this.selectedGear = null;
    }
  }

  private checkWinCondition() {
    if (!this.startGear || !this.endGear) return;

    const visited = new Set<Gear>();
    const isConnected = this.checkGearConnection(
      this.startGear,
      this.endGear,
      visited
    );

    if (isConnected) {
      if (this.winCheckTimer) {
        this.winCheckTimer.destroy();
      }

      incrementLevel();
      addScore(100);

      // Show victory UI
      this.scene.get("UIScene").events.emit("levelComplete");
    }
  }

  private checkGearConnection(
    gear: Gear,
    target: Gear,
    visited: Set<Gear>
  ): boolean {
    if (visited.has(gear)) return false;
    visited.add(gear);

    if (gear === target) return true;

    const connectedGears = this.gears.filter(
      (other) => other !== gear && this.areGearsConnected(gear, other)
    );

    return connectedGears.some((connected) =>
      this.checkGearConnection(connected, target, visited)
    );
  }

  private areGearsConnected(gear1: Gear, gear2: Gear): boolean {
    const dx = gear1.x - gear2.x;
    const dy = gear1.y - gear2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= gear1.radius + gear2.radius + 5;
  }

  update() {
    this.gears.forEach((gear) => gear.update());
  }
}
