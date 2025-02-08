import { GearConfig } from "@shared/schema";

export class Inventory {
  private gears: GearConfig[];

  constructor(initialGears: GearConfig[]) {
    this.gears = [...initialGears];
  }

  size(): number {
    return this?.gears?.length || 0;
  }
  getGears(): GearConfig[] {
    return this.gears;
  }

  removeGear(index: number): GearConfig | undefined {
    if (index >= 0 && index < this.gears.length) {
      return this.gears.splice(index, 1)[0];
    }
    return undefined;
  }

  peekFirstGear(): GearConfig | null {
    return this.gears[0] || null; // Removes and returns the first item, or null if empty
  }

  removeFirstGear(): GearConfig | null {
    return this.gears.shift() || null; // Removes and returns the first item, or null if empty
  }

  addGear(gear: GearConfig) {
    this.gears.push(gear);
  }

  isEmpty(): boolean {
    return this.gears.length === 0;
  }
}
