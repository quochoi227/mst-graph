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
    if (cy && sourceNode) {
      if (algorithm === "prim") {
        primMST(cy, sourceNode.id(), 800);
      } else if (algorithm === "kruskal") {
        // Thuật toán Kruskal cho đồ thị vô hướng
        kruskalMST(cy, 800);
      }
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
    <div className="p-4 w-80 border-r border-border">
      <div className="mb-4">
        <p className="uppercase text-sm font-semibold text-muted-foreground mb-2">
          Thuật Toán
        </p>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.title}
              className={cn(
                "cursor-pointer flex items-center gap-3 p-1.5 rounded border border-border-dark bg-surface-dark hover:border-primary/50 transition-all text-text",
                algorithm === item.alg
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-text"
              )}
              onClick={() => setAlgorithm(item.alg)}
            >
              <item.icon />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <hr />
      <div className="mb-4 mt-2">
        <p className="uppercase text-sm font-semibold text-muted-foreground mb-2">
          Mô Phỏng
        </p>
        <div className="mb-4">
          <div className="flex gap-2">
            <button
              className="flex-1 cursor-pointer flex justify-center items-center bg-primary px-5 py-2 text-white rounded-xs"
              onClick={handlePlay}
            >
              <Play />
            </button>
            <button
              className="flex-1 cursor-pointer flex justify-center items-center bg-primary px-5 py-2 text-white rounded-xs"
              onClick={handleClick}
            >
              <Pause />
            </button>
            <button
              className="flex-1 cursor-pointer flex justify-center items-center bg-primary px-5 py-2 text-white rounded-xs"
            >
              <SkipForward />
            </button>
            <button
              className="flex-1 cursor-pointer flex justify-center items-center bg-primary px-5 py-2 text-white rounded-xs"
              onClick={handleReset}
            >
              <RotateCcw />
            </button>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Tốc độ</span>
            <span>1.5x</span>
          </div>
          <input type="range" className="w-full" onChange={handleSpeedChange} min={0.5} max={1.5} step={0.5} defaultValue={1} />
          <div className="flex justify-between mt-1 uppercase text-xs font-semibold text-muted-foreground">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>
      </div>
      <hr />
      <div className="mb-4 mt-2">
        <p className="uppercase text-sm font-semibold text-muted-foreground mb-2">
          Mã Giả
        </p>
        <div className="bg-surface-dark border border-border-dark rounded p-3 text-xs font-mono text-text">
          {algorithm === "prim" && (
            <div className="space-y-1">
              <div className="text-primary font-semibold mb-2">Prim's Algorithm:</div>
              <div>1. Chọn đỉnh bắt đầu</div>
              <div>2. Khởi tạo MST = ∅</div>
              <div>3. <span className="text-accent">while</span> MST chưa đủ (V-1) cạnh:</div>
              <div className="pl-4">a. Tìm cạnh nhỏ nhất nối</div>
              <div className="pl-7">từ MST đến đỉnh chưa thăm</div>
              <div className="pl-4">b. Thêm cạnh vào MST</div>
              <div className="pl-4">c. Đánh dấu đỉnh đã thăm</div>
              <div>4. Trả về MST</div>
            </div>
          )}
          {algorithm === "kruskal" && (
            <div className="space-y-1">
              <div className="text-primary font-semibold mb-2">Kruskal's Algorithm:</div>
              <div>1. Sắp xếp các cạnh theo trọng số</div>
              <div>2. Khởi tạo MST = ∅</div>
              <div>3. <span className="text-accent">for each</span> cạnh e trong danh sách:</div>
              <div className="pl-4">a. <span className="text-accent">if</span> e không tạo chu trình:</div>
              <div className="pl-7">- Thêm e vào MST</div>
              <div className="pl-7">- Hợp nhất hai tập đỉnh</div>
              <div className="pl-4">b. <span className="text-accent">if</span> MST có (V-1) cạnh:</div>
              <div className="pl-7">- <span className="text-accent">break</span></div>
              <div>4. Trả về MST</div>
            </div>
          )}
          {!algorithm && (
            <div className="text-muted-foreground text-center py-4">
              Chọn thuật toán để xem mã giả
            </div>
          )}
        </div>
      </div>
    </div>
  );
}