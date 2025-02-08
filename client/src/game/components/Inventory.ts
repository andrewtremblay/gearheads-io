import { GearConfig } from '@shared/schema';

export class Inventory {
  private gears: GearConfig[];
  
  constructor(initialGears: GearConfig[]) {
    this.gears = [...initialGears];
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

  addGear(gear: GearConfig) {
    this.gears.push(gear);
  }

  isEmpty(): boolean {
    return this.gears.length === 0;
  }
}
