export interface JugState {
  a: number;
  b: number;
}

export interface SolutionStep extends JugState {
  action: string;
  description: string;
}

export interface SolverParams {
  capA: number;
  capB: number;
  goal: number;
}
