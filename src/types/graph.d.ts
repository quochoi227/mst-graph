import cytoscape from "cytoscape";

type KruskalStep = {
  source: string;
  target: string;
  weight: number;
  action: "add" | "skip";
}

export type PrimStep = {
  // nodes: {
  //   explanation: string;
  //   hidden: boolean;
  // }[];
  updatedNodes: string[]; // Danh sách các node được cập nhật trong bước này
  selectedNode: string; // Node được chọn trong bước này
  pi: Record<string, number>; // Giá trị pi của tất cả các node tại bước này
  parent: Record<string, string | null>; // Giá trị parent của tất cả các node tại bước này
  action: string;
}

export interface GraphState {
  cy: cytoscape.Core | null;
  sourceNode: cytoscape.NodeSingular | null;
  edgeInProgress: cytoscape.EdgeSingular | null;
  algorithm: string;
  log: string[];
  playing: boolean;
  // visited: Set<string>;
  currentStep: number; // Bước đi hiện tại
  kruskalSteps: KruskalStep[]; // Thêm thuộc tính để lưu trữ các bước của thuật toán Kruskal
  primSteps: PrimStep[]; // Thêm thuộc tính để lưu trữ các bước của thuật toán Prim

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
  addKruskalStep: (step: KruskalStep) => void; // Thêm phương thức để thêm bước của thuật toán Kruskal
  addPrimStep: (step: PrimStep) => void; // Thêm phương thức để thêm bước của thuật toán Prim
  resetKruskalSteps: () => void; // Thêm phương thức để reset các bước của thuật toán Kruskal
  resetPrimSteps: () => void; // Thêm phương thức để reset các bước của thuật toán Prim
}
