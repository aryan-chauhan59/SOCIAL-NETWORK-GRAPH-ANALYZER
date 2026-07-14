export interface GraphData {
  users: string[];
  graph: Record<string, string[]>;
}

export interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  label: string;
}

export interface Edge {
  source: string;
  target: string;
}

export interface AlgorithmStep {
  step: number;
  curr_node: string | null;
  queue?: string[];
  visited?: string[];
  parent?: Record<string, string>;
  current_community?: string[];
  recursion_depth?: number;
  message: string;
}

export interface CentralityRanking {
  username: string;
  degree: number;
  centrality: number;
}

export interface TerminalLine {
  text: string;
  type: "input" | "output" | "system";
}
