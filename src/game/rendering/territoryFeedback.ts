import Phaser from "phaser";

import type { TerritoryPlacementPreview } from "../../engine/placementPreview";
import type { TerritoryResources } from "../../engine/resources";

export function formatResourceDelta(delta: TerritoryResources): string[] {
  const lines: string[] = [];

  addResourceLine(lines, "Nourriture", delta.food);

  addResourceLine(lines, "Énergie", delta.energy);

  addResourceLine(lines, "Nature", delta.nature);

  addResourceLine(lines, "Bonheur", delta.happiness);

  return lines;
}

export function formatPlacementPreview(
  preview: TerritoryPlacementPreview,
): string {
  const resourceSummary = formatResourceDelta(preview.resourceDelta).join(
    " · ",
  );

  const lines = [
    resourceSummary.length > 0
      ? `Aperçu : ${resourceSummary}`
      : "Aucune variation de ressource",
  ];

  if (preview.createdSynergies.length > 0) {
    lines.push(
      `Synergie : ${preview.createdSynergies
        .map((synergy) => synergy.label)
        .join(", ")}`,
    );
  }

  return lines.join("\n");
}

export function showResourceDeltaFeedback(
  scene: Phaser.Scene,
  centerX: number,
  centerY: number,
  delta: TerritoryResources,
): void {
  const lines = formatResourceDelta(delta);

  if (lines.length === 0) {
    return;
  }

  const feedbackText = scene.add
    .text(centerX, centerY - 42, lines.join("\n"), {
      color: "#245f35",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "15px",
      fontStyle: "bold",
      align: "center",
      stroke: "#fffdf7",
      strokeThickness: 4,
    })
    .setOrigin(0.5)
    .setDepth(50);

  scene.tweens.add({
    targets: feedbackText,
    y: feedbackText.y - 30,
    alpha: 0,
    duration: 1100,
    ease: "Cubic.easeOut",
    onComplete: () => {
      feedbackText.destroy();
    },
  });
}

export function showSynergyFeedback(
  scene: Phaser.Scene,
  centerX: number,
  centerY: number,
  synergyLabels: readonly string[],
  affectedGraphics: readonly Phaser.GameObjects.Graphics[],
): void {
  if (synergyLabels.length === 0) {
    return;
  }

  const feedbackText = scene.add
    .text(
      centerX,
      centerY - 78,
      synergyLabels.map((label) => `${label} !`).join("\n"),
      {
        color: "#765da8",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        align: "center",
        stroke: "#fffdf7",
        strokeThickness: 5,
      },
    )
    .setOrigin(0.5)
    .setDepth(60);

  for (const graphics of affectedGraphics) {
    scene.tweens.add({
      targets: graphics,
      alpha: 0.45,
      duration: 220,
      yoyo: true,
      repeat: 1,
    });
  }

  scene.tweens.add({
    targets: feedbackText,
    y: feedbackText.y - 28,
    alpha: 0,
    duration: 1400,
    ease: "Cubic.easeOut",
    onComplete: () => {
      feedbackText.destroy();
    },
  });
}

function addResourceLine(lines: string[], label: string, amount: number): void {
  if (amount === 0) {
    return;
  }

  const sign = amount > 0 ? "+" : "";

  lines.push(`${sign}${amount} ${label}`);
}
