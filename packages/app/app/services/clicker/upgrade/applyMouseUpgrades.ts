import type { BuildingWithStats } from "#shared/models/clicker/data/building/BuildingWithStats";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

import { Target } from "#shared/models/clicker/data/Target";
import { applyUpgrades } from "@/services/clicker/upgrade/applyUpgrades";

export const applyMouseUpgrades = (
  basePower: number,
  boughtUpgrades: Upgrade[],
  boughtBuildings: BuildingWithStats[],
) =>
  applyUpgrades(
    basePower,
    ({ effects }) => effects.some(({ targets }) => targets.includes(Target.Mouse)),
    boughtUpgrades,
    boughtBuildings,
  );
