import {
  Pause,
  Play,
  RotateCcw,
  SkipForward,
} from "lucide-react";

import { cn } from "../lib/utils";
import { useGraphStore } from "../store/useGraphStore";
import { kruskalMST, primMST, reset, printGraphData } from "../lib/actions";

// Menu items.
const items = [
  {
    title: "Prim's MST",
    description: "MST for undirected graph",
    icon: Play,
    alg: "prim",
  },
  {
    title: "Kruskal's MST",
    description: "MST for undirected graph",
    icon: Play,
    alg: "kruskal",
  }
];

export function AppSidebar() {
  const { algorithm, setAlgorithm } = useGraphStore();

  const handlePlay = () => {
    const { cy, sourceNode } = useGraphStore.getState();
    if (cy && sourceNode && algorithm === "prim") {
      primMST(cy, sourceNode.id(), 800);
    } else if (cy && algorithm === "kruskal") {
      kruskalMST(cy, 800);
    }
  };

  const handleReset = () => {
    const { cy } = useGraphStore.getState();
    reset(cy);
  };

  const handleClick = () => {
    const { sourceNode, cy } = useGraphStore.getState();
    console.log("node label:", sourceNode?.data("label"));
    printGraphData(cy);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const speed = e.target.value;
    console.log("Speed changed to:", speed);
    // You can implement the logic to adjust the speed of the simulation here.
  }

  return (
    <div className="p-4 w-72 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
      {/* Algorithm Selection */}
      <div className="mb-4">
        <p className="uppercase text-xs font-bold text-slate-500 mb-2 tracking-wider">
          🔬 Thuật Toán
        </p>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.title}
              className={cn(
                "cursor-pointer flex items-center gap-3 p-2.5 rounded-lg border-2 transition-all duration-200",
                algorithm === item.alg
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100"
              )}
              onClick={() => setAlgorithm(item.alg)}
            >
              <div className={cn(
                "p-2 rounded-lg",
                algorithm === item.alg ? "bg-primary text-white" : "bg-white text-slate-500"
              )}>
                <item.icon size={18} />
              </div>
              <div>
                <p className={cn(
                  "text-sm font-semibold",
                  algorithm === item.alg ? "text-primary" : "text-slate-700"
                )}>{item.title}</p>
                <p className="text-xs text-slate-400">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Simulation Controls */}
      <div className="my-4">
        <p className="uppercase text-xs font-bold text-slate-500 mb-2 tracking-wider">
          ▶️ Điều Khiển
        </p>
        <div className="flex gap-2">
          <button
            className="flex-1 cursor-pointer flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 text-white rounded-lg transition-colors shadow-sm"
            onClick={handlePlay}
          >
            <Play size={18} />
            <span className="text-sm font-medium">Chạy</span>
          </button>
          <button
            className="cursor-pointer flex justify-center items-center bg-slate-200 hover:bg-slate-300 px-4 py-2.5 text-slate-700 rounded-lg transition-colors"
            onClick={handleReset}
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Pseudocode */}
      <div className="mt-4 flex-1 overflow-auto">
        <p className="uppercase text-xs font-bold text-slate-500 mb-2 tracking-wider">
          📝 Mã Giả
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-700">
          {algorithm === "prim" && (
            <div className="space-y-1">
              <div className="text-primary font-bold mb-2">Prim's Algorithm:</div>
              <div className="text-slate-600">1. Chọn đỉnh bắt đầu</div>
              <div className="text-slate-600">2. Khởi tạo MST = ∅</div>
              <div className="text-slate-600">3. <span className="text-blue-600 font-semibold">while</span> MST chưa đủ (V-1) cạnh:</div>
              <div className="pl-4 text-slate-600">a. Tìm cạnh nhỏ nhất nối</div>
              <div className="pl-7 text-slate-500">từ MST đến đỉnh chưa thăm</div>
              <div className="pl-4 text-slate-600">b. Thêm cạnh vào MST</div>
              <div className="pl-4 text-slate-600">c. Đánh dấu đỉnh đã thăm</div>
              <div className="text-slate-600">4. <span className="text-emerald-600 font-semibold">return</span> MST</div>
            </div>
          )}
          {algorithm === "kruskal" && (
            <div className="space-y-1">
              <div className="text-primary font-bold mb-2">Kruskal's Algorithm:</div>
              <div className="text-slate-600">1. Sắp xếp các cạnh theo trọng số</div>
              <div className="text-slate-600">2. Khởi tạo MST = ∅</div>
              <div className="text-slate-600">3. <span className="text-blue-600 font-semibold">for each</span> cạnh e:</div>
              <div className="pl-4 text-slate-600">a. <span className="text-blue-600 font-semibold">if</span> e không tạo chu trình:</div>
              <div className="pl-7 text-slate-500">- Thêm e vào MST</div>
              <div className="pl-7 text-slate-500">- Hợp nhất hai tập đỉnh</div>
              <div className="pl-4 text-slate-600">b. <span className="text-blue-600 font-semibold">if</span> MST có (V-1) cạnh:</div>
              <div className="pl-7 text-slate-500">- <span className="text-orange-600 font-semibold">break</span></div>
              <div className="text-slate-600">4. <span className="text-emerald-600 font-semibold">return</span> MST</div>
            </div>
          )}
          {!algorithm && (
            <div className="text-slate-400 text-center py-4">
              Chọn thuật toán để xem mã giả
            </div>
          )}
        </div>
      </div>
    </div>
  );
}