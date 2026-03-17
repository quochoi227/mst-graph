import { create } from "zustand";
import type { GraphState } from "../types/graph";

export const useGraphStore = create<GraphState>((set) => ({
  cy: null,
  sourceNode: null,
  edgeInProgress: null,
  algorithm: "prim",
  log: [],
  kruskalSteps: [],
  primSteps: [],
  playing: false,
  // visited: new Set<string>(),
  currentStep: 0,

  setCy: (cy) => set({ cy }),
  setSourceNode: (node) => set({ sourceNode: node }),
  setEdgeInProgress: (edge) => set({ edgeInProgress: edge }),
  setAlgorithm: (algorithm) => set({ algorithm }),
  addLogEntry: (entry) =>
    set((state) => ({ log: [...state.log, entry] })),
  resetLog: () => set({ log: [] }),
  setPlaying: (playing) => set({ playing }),
  // addVisited: (nodeId) =>
  //   set((state) => {
  //     const newVisited = new Set(state.visited);
  //     newVisited.add(nodeId);
  //     return { visited: newVisited };
  //   }),
  // resetVisited: () => set({ visited: new Set<string>() }),
  setCurrentStep: (step) => set({ currentStep: step }),
  addKruskalStep: (step) =>
    set((state) => ({
      kruskalSteps: [...(state.kruskalSteps || []), step],
    })),
  addPrimStep: (step) =>
    set((state) => ({
      primSteps: [...(state.primSteps || []), step],
    })),
  resetKruskalSteps: () => set({ kruskalSteps: [] }),
  resetPrimSteps: () => set({ primSteps: [] }),
}));
