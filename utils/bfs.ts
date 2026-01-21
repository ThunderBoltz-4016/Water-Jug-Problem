import { SolutionStep, JugState } from '../types';

export const solveWaterJugBFS = (capA: number, capB: number, goal: number): SolutionStep[] | null => {
  // Queue for BFS: stores [currentAmountA, currentAmountB, path]
  const queue: [number, number, SolutionStep[]][] = [];
  
  // Set to track visited states "a,b"
  const visited = new Set<string>();

  // Initial State: (0, 0)
  const initialState: SolutionStep = { a: 0, b: 0, action: 'Start', description: 'Start with both jugs empty' };
  queue.push([0, 0, [initialState]]);
  visited.add(`0,0`);

  while (queue.length > 0) {
    const [currA, currB, path] = queue.shift()!;

    // Check if goal is reached (Jug A has exactly goal amount)
    // Note: The problem usually asks for *either* jug to have the goal, but the prompt specified Jug A.
    // However, usually we accept the goal in either to be robust, but strict adherence to prompt: "Jug A must contain exactly 2 Liters".
    if (currA === goal) {
      return path;
    }

    // Possible next states
    const nextStates: { a: number; b: number; action: string; description: string }[] = [];

    // 1. Fill Jug A
    nextStates.push({ a: capA, b: currB, action: 'Fill A', description: `Fill Jug A (${capA}L)` });

    // 2. Fill Jug B
    nextStates.push({ a: currA, b: capB, action: 'Fill B', description: `Fill Jug B (${capB}L)` });

    // 3. Empty Jug A
    nextStates.push({ a: 0, b: currB, action: 'Empty A', description: 'Empty Jug A' });

    // 4. Empty Jug B
    nextStates.push({ a: currA, b: 0, action: 'Empty B', description: 'Empty Jug B' });

    // 5. Pour Jug A -> Jug B
    // Amount to pour is min(currA, space in B)
    const pourAtoB = Math.min(currA, capB - currB);
    nextStates.push({ 
      a: currA - pourAtoB, 
      b: currB + pourAtoB, 
      action: 'Pour A -> B', 
      description: `Pour ${pourAtoB}L from A to B` 
    });

    // 6. Pour Jug B -> Jug A
    // Amount to pour is min(currB, space in A)
    const pourBtoA = Math.min(currB, capA - currA);
    nextStates.push({ 
      a: currA + pourBtoA, 
      b: currB - pourBtoA, 
      action: 'Pour B -> A', 
      description: `Pour ${pourBtoA}L from B to A` 
    });

    // Process next states
    for (const state of nextStates) {
      const stateKey = `${state.a},${state.b}`;
      if (!visited.has(stateKey)) {
        visited.add(stateKey);
        queue.push([state.a, state.b, [...path, state]]);
      }
    }
  }

  return null; // No solution found
};

export const PYTHON_SCRIPT = `from collections import deque

def solve_water_jug_bfs(cap_a, cap_b, goal):
    """
    Solves the Water Jug problem using Breadth-First Search.
    
    Args:
        cap_a (int): Capacity of Jug A
        cap_b (int): Capacity of Jug B
        goal (int): Target amount of water in Jug A
        
    Returns:
        list: A list of tuples (jug_a, jug_b, action) representing the path.
    """
    
    # Queue stores tuples of (current_a, current_b, path)
    # path is a list of steps taken to reach the state
    queue = deque([(0, 0, [])])
    
    # Set to track visited states to prevent infinite loops
    visited = set([(0, 0)])

    print(f"Starting BFS with Jug A={cap_a}L, Jug B={cap_b}L, Goal={goal}L in A\\n")

    while queue:
        curr_a, curr_b, path = queue.popleft()

        # Check if we reached the goal state (Jug A has goal amount)
        if curr_a == goal:
            # Add the final state to the path for display
            return path + [(curr_a, curr_b, "Goal Reached")]

        # Define all 6 possible transitions
        # Operator logic: (Next A, Next B, Description)
        moves = [
            (cap_a, curr_b, "Fill Jug A"),
            (curr_a, cap_b, "Fill Jug B"),
            (0, curr_b, "Empty Jug A"),
            (curr_a, 0, "Empty Jug B"),
            # Pour A -> B (Limit is empty space in B)
            (curr_a - min(curr_a, cap_b - curr_b), 
             curr_b + min(curr_a, cap_b - curr_b), 
             "Pour Jug A -> Jug B"),
            # Pour B -> A (Limit is empty space in A)
            (curr_a + min(curr_b, cap_a - curr_a), 
             curr_b - min(curr_b, cap_a - curr_a), 
             "Pour Jug B -> Jug A")
        ]

        for next_a, next_b, action in moves:
            if (next_a, next_b) not in visited:
                visited.add((next_a, next_b))
                # Append current step to path and enqueue new state
                new_path = path + [(curr_a, curr_b, action)]
                queue.append((next_a, next_b, new_path))

    return None

# --- Main Execution ---
if __name__ == "__main__":
    # Problem Parameters
    JUG_A_CAP = 4
    JUG_B_CAP = 3
    GOAL_AMOUNT = 2

    # Run Algorithm
    solution_path = solve_water_jug_bfs(JUG_A_CAP, JUG_B_CAP, GOAL_AMOUNT)

    # Output Results
    if solution_path:
        print("Solution Found:")
        print(f"{'Step':<5} | {'Action':<25} | {'State (A, B)':<15}")
        print("-" * 50)
        # The path contains (state_before_action), we format to show the flow
        for i, (a, b, action) in enumerate(solution_path):
             # Logic to print detailed steps would go here
             # For this simple script, we print the transition recorded
             print(f"{i:<5} | {action:<25} | ({a}, {b})")
    else:
        print("No solution found.")
`;