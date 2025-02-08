import Phaser from "phaser";
import { Gear } from "../components/Gear";
import { Inventory } from "../components/Inventory";
import { GearConfig, LevelConfig } from "@shared/schema";
import { GEAR_SIZES } from "../config";
import { addScore, incrementLevel } from "@/lib/store";
import { Guide } from "../components/Guide";
import { PhantomGear } from "../components/PhantomGear";

function isMobileBrowser() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

export function isGameScene(s: Phaser.Scene): s is GameScene {
  return s instanceof GameScene;
}

export class GameScene extends Phaser.Scene {
  private gears: Gear[] = [];
  private inventory!: Inventory;
  private selectedGear: Gear | null = null;
  private startGear: Gear | null = null;
  private endGear: Gear | null = null;
  private winCheckTimer: Phaser.Time.TimerEvent | null = null;
  private verticalGuide: Guide | null = null;
  private phantomGear: PhantomGear | null = null;
  private gearCounterText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "GameScene" });
  }

  sceneSize() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    return { width, height };
  }
  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.verticalGuide = new Guide(this);
    this.phantomGear = new PhantomGear(this);

    // randomize the gear sizes while still making the level slightly possible

    const numGears = Math.ceil(1.5 * (width / GEAR_SIZES[1]));

    // Generate default level
    const defaultConfig: LevelConfig = {
      gears: [
        {
          x: GEAR_SIZES[2] / 2,
          y: (3 * height) / 5,
          radius: GEAR_SIZES[2],
          isFixed: true,
        }, // Fixed gear on left side
        {
          x: width - GEAR_SIZES[2] / 2,
          y: height / 5,
          radius: GEAR_SIZES[2],
          isFixed: true,
        }, // Fixed gear on right side
      ] as GearConfig[],
      inventory: Array.from({ length: numGears }, (_, i) => ({
        x: 0,
        y: 0,
        radius:
          GEAR_SIZES[Math.floor(Math.random() * GEAR_SIZES.length)] *
          (0.9 + Math.random() * 0.2),
      })),
    };

    this.initLevel(defaultConfig);

    // Setup drag events
    this.input.on(Phaser.Input.Events.DRAG_START, this.onDragStart, this);
    this.input.on(Phaser.Input.Events.DRAG, this.onDrag, this);
    this.input.on(Phaser.Input.Events.DRAG_END, this.onDragEnd, this);
    // mouse/pointer movements
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
    this.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);

    // Start win condition check timer
    if (this.winCheckTimer) {
      this.winCheckTimer.destroy();
    }
    this.winCheckTimer = this.time.addEvent({
      delay: 500,
      callback: this.checkWinCondition,
      callbackScope: this,
      loop: true,
    });

    // Set start and end gears
    this.startGear = this.gears[0];
    this.endGear = this.gears[1];

    this.gearCounterText = this.add.text(
      10,
      10,
      `Gears Remaining: ${this.inventory.size()}`,
      {
        fontSize: "20px",
        color: "#ffffff",
      }
    );
  }

  /*************  ✨ Codeium Command ⭐  *************/
  /**
   * Phaser callback for when a pointer is pressed down.
   * @param {Phaser.Input.Pointer} pointer The pointer that was pressed down.
   */
  /******  17316d33-fc13-49c9-a05b-19dfd55a26ea  *******/ private placeNewGear({
    x,
    y,
  }: {
    x: number;
    y: number;
  }) {
    const newGearConfig = this.inventory.removeFirstGear();
    if (!newGearConfig) return;
    const { width, height } = this.sceneSize();
    if (x <= 0 || x >= width || y <= 0 || y >= height) {
      return;
    }
    const newGear = new Gear(this, {
      x,
      y: newGearConfig.radius + 10,
      radius: newGearConfig.radius,
    });
    this.gears.push(newGear);
  }

  onPointerDown({ x, y }: Phaser.Input.Pointer) {
    if (this.verticalGuide) {
      this.verticalGuide.x = x;
      if (isMobileBrowser()) {
        this.verticalGuide.showLine();
      } else {
        this.verticalGuide.hideLine();
      }
    }

    if (this.inventory.isEmpty()) return;
    if (isMobileBrowser()) return;
    this.placeNewGear({ x, y });
  }
  calculateFinalPosition(x: number, radius: number): number {
    let finalY = 0;
    this.gears.forEach((gear) => {
      const distance = Math.abs(gear.x - x);
      if (distance <= gear.radius + radius) {
        const angle = Math.acos(distance / (gear.radius + radius));
        const verticalOffset =
          gear.y - Math.sin(angle) * (gear.radius + radius);
        finalY = Math.max(finalY, verticalOffset);
      }
    });
    return finalY;
  }

  onPointerMove({ x, y }: Phaser.Input.Pointer) {
    if (this.verticalGuide) {
      this.verticalGuide.x = x;
    }
    const nextGearConfig = this.inventory.peekFirstGear();
    if (!nextGearConfig) {
      // this.phantomGear?.hide();
      return;
    }
    // this.phantomGear?.show();
    if (this.phantomGear) {
      const finalY = this.calculateFinalPosition(x, nextGearConfig.radius);
      this.phantomGear.y = finalY;
      this.phantomGear.x = x;
      this.phantomGear.updateRadius(nextGearConfig.radius);
    }
  }
  onPointerUp({ x, y }: Phaser.Input.Pointer) {
    if (this.verticalGuide) {
      this.verticalGuide.x = x;
      if (isMobileBrowser()) {
        this.verticalGuide.hideLine();
      } else {
        this.verticalGuide.showLine();
      }
    }
    if (!isMobileBrowser()) return;
    this.placeNewGear({ x, y });
  }

  initLevel(levelConfig: LevelConfig) {
    // Clear existing gears
    this.gears.forEach((gear) => gear.destroy());
    this.gears = [];

    // Initialize inventory with provided gears
    this.inventory = new Inventory(levelConfig.inventory || []);

    // Create fixed gears
    levelConfig.gears.forEach((gearConfig) => {
      const newGear = new Gear(this, gearConfig);
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
      this.scene.start("UIScene", { style: "levelComplete" });
    }
  }

  checkGearConnection(gear: Gear, target: Gear, visited: Set<Gear>): boolean {
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

  areGearsConnected(gear1: Gear, gear2: Gear): boolean {
    const dx = gear1.x - gear2.x;
    const dy = gear1.y - gear2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= gear1.radius + gear2.radius + 5;
  }

  removeGear(gear: Gear) {
    // this.gears.filter((g) => !gear.isEqual(g));
  }

  update() {
    this.gears.forEach((gear) => {
      gear.update();
      if (gear.body && gear.body.velocity) {
        this.matter.body.setVelocity(gear.body, {
          x: 0,
          y: gear.body.velocity.y,
        }); // Restrict movement to vertical
        this.gears.forEach((otherGear) => {
          if (gear !== otherGear && otherGear.isFixed && !otherGear.gone) {
            const distance = Phaser.Math.Distance.Between(
              gear.x,
              gear.y,
              otherGear.x,
              otherGear.y
            );
            if (distance <= gear.radius + otherGear.radius && gear.body) {
              this.matter.body.setStatic(gear.body, true);
              gear.isFixed = true;
            }
          }
        });
      }
    });
    this.verticalGuide?.update();
    this.updateGearCounter();
  }

  updateGearCounter() {
    this.gearCounterText.setText(`Gears Remaining: ${this.inventory.size()}`);
  }
}
