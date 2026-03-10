import cytoscape from "cytoscape";

export interface GraphState {
  cy: cytoscape.Core | null;
  sourceNode: cytoscape.NodeSingular | null;
  edgeInProgress: cytoscape.EdgeSingular | null;
  algorithm: string;
  log: string[];
  playing: boolean;
  // visited: Set<string>;
  currentStep: number; // Bước đi hiện tại

  setCy: (cy: cytoscape.Core | null) => void;
  setSourceNode: (node: cytoscape.NodeSingular | null) => void;
  setEdgeInProgress: (edge: cytoscape.EdgeSingular | null) => void;
  setAlgorithm: (algorithm: string) => void;
  addLogEntry: (entry: string) => void;
  resetLog: () => void;
  setPlaying: (playing: boolean) => void;
  // addVisited: (nodeId: string) => void;
  // resetVisited: () => void;
  setCurrentStep: (step: number) => void;
}
