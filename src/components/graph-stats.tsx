import { useGraphStore } from "../store/useGraphStore";
import { CircleDot, GitBranch, Weight, Network } from "lucide-react";
import { useEffect, useState } from "react";

interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  totalWeight: number;
  componentCount: number;
}

function GraphStatsPanel() {
  const { cy } = useGraphStore();
  const [stats, setStats] = useState<GraphStats>({
    nodeCount: 0,
    edgeCount: 0,
    totalWeight: 0,
    componentCount: 0,
  });

  useEffect(() => {
    if (!cy) return;

    const updateStats = () => {
      const nodes = cy.nodes();
      const edges = cy.edges();
      
      // Tính tổng trọng số
      let totalWeight = 0;
      edges.forEach((edge) => {
        totalWeight += edge.data("weight") || 0;
      });

      // Đếm số thành phần liên thông
      const componentCount = cy.elements().components().length;

      setStats({
        nodeCount: nodes.length,
        edgeCount: edges.length,
        totalWeight,
        componentCount
      });
    };

    updateStats();

    // Lắng nghe sự thay đổi của đồ thị
    cy.on("add remove", updateStats);

    return () => {
      cy.off("add remove", updateStats);
    };
  }, [cy]);

  const statItems = [
    {
      label: "Đỉnh",
      value: stats.nodeCount,
      icon: CircleDot,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "Cạnh",
      value: stats.edgeCount,
      icon: GitBranch,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      label: "Tổng W",
      value: stats.totalWeight,
      icon: Weight,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    // {
    //   label: "Số thành phần liên thông",
    //   value: stats.componentCount,
    //   icon: Network,
    //   color: stats.componentCount === 1 ? "text-emerald-500" : "text-red-500",
    //   bgColor: stats.componentCount === 1 ? "bg-emerald-50" : "bg-red-50",
    // },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border-b border-slate-200">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-slate-100"
        >
          <div className={`p-1.5 rounded-md ${item.bgColor}`}>
            <item.icon size={16} className={item.color} />
          </div>
          <div>
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className={`text-sm font-semibold ${item.color}`}>{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GraphStatsPanel;
