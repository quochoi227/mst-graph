import { create } from "zustand";
import type { GraphState } from "../types/graph";

export const useGraphStore = create<GraphState>((set) => ({
  cy: null,
  sourceNode: null,
  edgeInProgress: null,
  algorithm: "prim",
  log: [],

  setCy: (cy) => set({ cy }),
  setSourceNode: (node) => set({ sourceNode: node }),
  setEdgeInProgress: (edge) => set({ edgeInProgress: edge }),
  setAlgorithm: (algorithm) => set({ algorithm }),
  addLogEntry: (entry) =>
    set((state) => ({ log: [...state.log, entry] })),
  resetLog: () => set({ log: [] }),
}));
