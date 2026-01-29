import cytoscape from "cytoscape";
import { useGraphStore } from "../store/useGraphStore";

export const bfsTraversal = (cy: cytoscape.Core | null, sourceNode: string) => {
  if (!cy) return;
  const bfs = cy.elements().bfs({
    roots: `#${sourceNode}`,
    visit: () => {},
    directed: true,
  });

  let i = 0;
  const highlightNextEle = function () {
    if (i < bfs.path.length) {
      bfs.path[i].addClass("highlighted");

      i++;
      setTimeout(highlightNextEle, 1000);
    }
  };

  // kick off first highlight
  highlightNextEle();
};

export const dfsTraversal = (cy: cytoscape.Core | null, sourceNode: string) => {
  if (!cy) return;
  const dfs = cy.elements().dfs({
    roots: `#${sourceNode}`,
    visit: () => {},
    directed: true,
  });
  let i = 0;
  const highlightNextEle = function () {
    if (i < dfs.path.length) {
      dfs.path[i].addClass("highlighted");
      i++;
      setTimeout(highlightNextEle, 1000);
    }
  };

  // kick off first highlight
  highlightNextEle();
};

export const dijkstra = (cy: cytoscape.Core | null, sourceNode: string) => {
  if (!cy) return;
  const dijkstra = cy.elements().dijkstra({
    root: `#${sourceNode}`,
    weight: (edge) => {
      return edge.data("weight") || 1; // Mặc định trọng số là 1 nếu không có
    },
  });
  const targetNodeId = "c"; // Ví dụ đích là node C
  const path = dijkstra.pathTo(cy.$id(targetNodeId));
  const distance = dijkstra.distanceTo(cy.$id(targetNodeId));

  let i = 0;
  const highlightNextEle = function () {
    if (i < path.length) {
      path[i].addClass("highlighted");
      i++;
      setTimeout(highlightNextEle, 1000);
    } else {
      console.log(`Distance from A to ${targetNodeId}:`, distance);
    }
  };
  // kick off first highlight
  highlightNextEle();
};

export const printGraphData = (cy: cytoscape.Core | null) => {
  if (!cy) return;
  const elements = cy.elements().map((ele) => ele.data());
  console.log("Graph elements data:", elements);
};

export const reset = (cy: cytoscape.Core | null) => {
  if (!cy) return;
  cy.elements().removeClass(
    "highlighted edmonds-cycle edmonds-merged edmonds-hidden edmonds-selected-edge candidate-edge edmonds-final"
  );
  cy.$(":selected").unselect();
};

export const primMST = async (
  cy: cytoscape.Core | null,
  sourceNode: string,
  delayMs: number = 1000
): Promise<void> => {
  if (!cy) return;
  const { addLogEntry } = useGraphStore.getState();

  reset(cy);

  const nodes = cy.nodes();
  const visited = new Set<string>();
  const mstEdges: cytoscape.EdgeSingular[] = [];

  // Bắt đầu từ node nguồn
  visited.add(sourceNode);
  cy.$id(sourceNode).addClass("highlighted");
  
  addLogEntry("🚀 Bắt đầu thuật toán Prim");
  addLogEntry(`📍 Node khởi đầu: ${sourceNode}`);
  await delay(delayMs);

  while (visited.size < nodes.length) {
    let minEdge: cytoscape.EdgeSingular | null = null;
    let minWeight = Infinity;

    addLogEntry('So sánh các cạnh sau:')
    // Tìm cạnh có trọng số nhỏ nhất nối từ visited sang unvisited
    for (const nodeId of visited) {
      const node = cy.$id(nodeId);
      const connectedEdges = node.connectedEdges();

      for (let i = 0; i < connectedEdges.length; i++) {
        const source = connectedEdges[i].source().id();
        const target = connectedEdges[i].target().id();
        const otherNode = source === nodeId ? target : source;

        
        if (!visited.has(otherNode)) {
          addLogEntry(`  - Cạnh: ${source} - ${target} (weight: ${connectedEdges[i].data("weight") || 1})`);
          connectedEdges[i].addClass("candidate-edge");
          await delay(delayMs / 2);
          const weight = connectedEdges[i].data("weight") || 1;
          if (weight < minWeight) {
            minWeight = weight;
            minEdge = connectedEdges[i];
          }
        }
      }
    }

    await delay(delayMs / 2);

    // Xóa highlight candidate
    cy.edges(".candidate-edge").removeClass("candidate-edge");

    if (minEdge) {
      const selectedEdge = minEdge as cytoscape.EdgeSingular;
      const source = selectedEdge.source().id();
      const target = selectedEdge.target().id();
      const newNode = visited.has(source) ? target : source;

      visited.add(newNode);
      mstEdges.push(minEdge);

      addLogEntry(`🔍 Chọn cạnh nhỏ nhất: ${source} - ${target} (weight: ${minWeight})`);
      selectedEdge.addClass("highlighted");
      cy.$id(newNode).addClass("highlighted");

      addLogEntry(`  ✓ Thêm cạnh: ${source} - ${target} (weight: ${minWeight})`);
      await delay(delayMs);
    } else {
      addLogEntry("⚠️ Đồ thị không liên thông - không thể tìm MST hoàn chỉnh");
      break;
    }
  }

  // Xóa các edge không thuộc MST
  // cy.edges().forEach((edge) => {
  //   if (!mstEdges.includes(edge)) {
  //     edge.remove()
  //   }
  // });

  const totalWeight = mstEdges.reduce((sum, e) => sum + (e.data("weight") || 1), 0);
  addLogEntry(`\n✅ Hoàn thành! Tổng trọng số MST: ${totalWeight}`);
};

// ====================== Thuật toán Kruskal cho đồ thị vô hướng (bonus) ======================

/**
 * Thuật toán Kruskal - Tìm MST cho đồ thị vô hướng
 * @param cy - Cytoscape core instance
 * @param delayMs - Thời gian delay giữa các bước (ms)
 */
export const kruskalMST = async (
  cy: cytoscape.Core | null,
  delayMs: number = 1000
): Promise<void> => {
  const { addLogEntry } = useGraphStore.getState();
  if (!cy) return;

  reset(cy);

  // Union-Find data structure
  const parent = new Map<string, string>();
  const rank = new Map<string, number>();

  function find(x: string): string {
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x)!));
    }
    return parent.get(x)!;
  }

  function union(x: string, y: string): boolean {
    const rootX = find(x);
    const rootY = find(y);

    if (rootX === rootY) return false;

    const rankX = rank.get(rootX) || 0;
    const rankY = rank.get(rootY) || 0;

    if (rankX < rankY) {
      parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      parent.set(rootY, rootX);
    } else {
      parent.set(rootY, rootX);
      rank.set(rootX, rankX + 1);
    }
    return true;
  }

  // Khởi tạo Union-Find
  cy.nodes().forEach((node) => {
    parent.set(node.id(), node.id());
    rank.set(node.id(), 0);
  });

  // Sắp xếp edges theo weight
  const edges = cy.edges().toArray().sort((a, b) => {
    return (a.data("weight") || 1) - (b.data("weight") || 1);
  });

  addLogEntry("🚀 Bắt đầu thuật toán Kruskal");
  addLogEntry(`📊 Số cạnh: ${edges.length}`);

  const mstEdges: cytoscape.EdgeSingular[] = [];
  let totalWeight = 0;

  for (const edge of edges) {
    edge.addClass("candidate-edge");
    await delay(delayMs / 2);

    const source = edge.source().id();
    const target = edge.target().id();
    const weight = edge.data("weight") || 1;

    if (union(source, target)) {
      mstEdges.push(edge);
      totalWeight += weight;

      edge.removeClass("candidate-edge");
      edge.addClass("highlighted");
      edge.source().addClass("highlighted");
      edge.target().addClass("highlighted");

      addLogEntry(`  ✓ Thêm cạnh: ${source} - ${target} (weight: ${weight})`);
      await delay(delayMs);

      if (mstEdges.length === cy.nodes().length - 1) {
        break;
      }
    } else {
      edge.removeClass("candidate-edge");
      addLogEntry(`  ✗ Bỏ qua cạnh: ${source} - ${target} (tạo chu trình)`);
      await delay(delayMs / 3);
    }
  }

  addLogEntry(`\n✅ Hoàn thành! Tổng trọng số MST: ${totalWeight}`);
};

// ======================= Utility Functions ======================
// Hàm delay để minh họa các bước
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
