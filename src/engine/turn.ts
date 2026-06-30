export interface TurnState {
  number: number;
  placementCompleted: boolean;
  improvementCompleted: boolean;
}

/**
 * Initialise la boucle au premier tour, avant tout placement.
 */
export function createInitialTurnState(): TurnState {
  return {
    number: 1,
    placementCompleted: false,
    improvementCompleted: false,
  };
}

/**
 * Marque le placement obligatoire du tour comme réalisé.
 */
export function markPlacementCompleted(state: TurnState): TurnState {
  if (state.placementCompleted) {
    return state;
  }

  return {
    ...state,
    placementCompleted: true,
  };
}

/**
 * Indique si le tour peut être validé par le joueur.
 */
export function canEndTurn(state: TurnState): boolean {
  return state.placementCompleted;
}

/**
 * Indique si le joueur se trouve sur le dernier tour du scénario.
 */
export function isFinalTurn(state: TurnState, maximumTurns: number): boolean {
  return state.number >= maximumTurns;
}

/**
 * Indique si la partie peut afficher son bilan.
 */
export function canCompleteScenario(
  state: TurnState,
  maximumTurns: number,
): boolean {
  return canEndTurn(state) && isFinalTurn(state, maximumTurns);
}

/**
 * Avance au tour suivant uniquement lorsque le placement est terminé.
 */
export function endTurn(state: TurnState): TurnState {
  if (!canEndTurn(state)) {
    return state;
  }

  return {
    number: state.number + 1,
    placementCompleted: false,
    improvementCompleted: false,
  };
}

export function markImprovementCompleted(state: TurnState): TurnState {
  if (!state.placementCompleted || state.improvementCompleted) {
    return state;
  }

  return {
    ...state,
    improvementCompleted: true,
  };
}
