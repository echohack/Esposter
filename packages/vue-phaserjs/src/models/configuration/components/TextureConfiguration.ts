import type { BaseTextureConfiguration } from "@/models/configuration/components/BaseTextureConfiguration";
import type { ExcludeFunctionProperties } from "@esposter/shared";
import type { GameObjects } from "phaser";
import type { Except } from "type-fest";

export type TextureConfiguration = ExcludeFunctionProperties<
  BaseTextureConfiguration & Except<GameObjects.Components.Texture, keyof BaseTextureConfiguration>
>;
