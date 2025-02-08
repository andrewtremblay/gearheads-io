import { z } from "zod";

export type GearConfig = {
  x: number;
  y: number;
  radius: number;
  isFixed?: boolean;
};

export type LevelConfig = {
  gears: GearConfig[];
  inventory: GearConfig[];
};

export const levelSchema = z.object({
  gears: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
      radius: z.number(),
      isFixed: z.boolean().optional(),
    })
  ),
  inventory: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
      radius: z.number(),
      isFixed: z.boolean().optional(),
    })
  ),
});

export type Level = z.infer<typeof levelSchema>;
