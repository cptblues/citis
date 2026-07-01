export interface ImprovementPointSchedule {
  initialPoints: number;
  pointsPerGrant: number;
  pointsGrantedAtTurns: readonly number[];
}

export function createInitialImprovementPoints(
  schedule: ImprovementPointSchedule,
): number {
  return Math.max(0, schedule.initialPoints);
}

export function getImprovementPointsGrantedAtTurn(
  turnNumber: number,
  schedule: ImprovementPointSchedule,
): number {
  if (!schedule.pointsGrantedAtTurns.includes(turnNumber)) {
    return 0;
  }

  return Math.max(0, schedule.pointsPerGrant);
}

export function grantImprovementPointsForTurn(
  currentPoints: number,
  turnNumber: number,
  schedule: ImprovementPointSchedule,
): number {
  return (
    Math.max(0, currentPoints) +
    getImprovementPointsGrantedAtTurn(turnNumber, schedule)
  );
}

export function canSpendImprovementPoints(
  currentPoints: number,
  cost: number,
): boolean {
  return cost >= 0 && currentPoints >= cost;
}

export function spendImprovementPoints(
  currentPoints: number,
  cost: number,
): number {
  if (!canSpendImprovementPoints(currentPoints, cost)) {
    return currentPoints;
  }

  return currentPoints - cost;
}

export function getNextImprovementPointGrantTurn(
  currentTurnNumber: number,
  schedule: ImprovementPointSchedule,
): number | null {
  return (
    schedule.pointsGrantedAtTurns.find(
      (turnNumber) => turnNumber > currentTurnNumber,
    ) ?? null
  );
}
