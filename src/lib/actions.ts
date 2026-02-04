import cytoscape from "cytoscape";
import { useGraphStore } from "../store/useGraphStore";
import { getRandomColor } from "../lib/utils"

export const reset = (cy: cytoscape.Core | null) => {
  if (!cy) return;
  cy.elements().removeClass(
    "highlighted edmonds-cycle edmonds-merged edmonds-hidden edmonds-selected-edge candidate-edge edmonds-final"
  );
  cy.$(":selected").unselect();
  // Reset styles to default
  cy.nodes().forEach((node) => {
    node.style({
      "background-color": "",
      "border-width": "",
      "border-color": "",
      "color": "",
    });
  });
  cy.edges().forEach((edge) => {
    edge.style({
      "line-color": "",
      "target-arrow-color": "",
      "width": "",
      "line-style": "",
    });
  });
};

const dfs = async (node: cytoscape.NodeSingular, color: string, visited: Set<string>, addLogEntry: (str: string) => void) => {
  addLogEntry(`  - Thăm node: ${node.data("label")}`);
  visited.add(node.id());
  node.style("background-color", color);
  await delay(800);
  const neighborEdges = node.connectedEdges();
  for (let i = 0; i < neighborEdges.length; i++) {
    const edge = neighborEdges[i];
    const otherNode = edge.source().id() === node.id() ? edge.target() : edge.source();
    if (!visited.has(otherNode.id())) {
      edge.style("line-color", color);
      visited.add(otherNode.id());
      await dfs(otherNode, color, visited, addLogEntry);
    }
  }
}

export const highlightComponents = async () => {
  const { cy, addLogEntry } = useGraphStore.getState();
  if (!cy) return;
  reset(cy);
  let components = 0
  const visited = new Set<string>();
  const nodes = cy.nodes();
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const color = getRandomColor();
    if (!visited.has(node.id())) {
      addLogEntry(`Thành phần liên thông thứ ${components + 1}:`);
      components += 1;
      await dfs(node, color, visited, addLogEntry);
    }
  }
  addLogEntry(`Tổng số thành phần liên thông: ${components}`);
}

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
  
  addLogEntry("Bắt đầu thuật toán Prim");
  addLogEntry(`Node khởi đầu: ${sourceNode}`);
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

      addLogEntry(`Chọn cạnh nhỏ nhất: ${source} - ${target} (weight: ${minWeight})`);
      selectedEdge.addClass("highlighted");
      cy.$id(newNode).addClass("highlighted");

      addLogEntry(`  ✓ Thêm cạnh: ${source} - ${target} (weight: ${minWeight})`);
      await delay(delayMs);
    } else {
      addLogEntry("Đồ thị không liên thông - không thể tìm MST hoàn chỉnh");
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
  addLogEntry(`\nHoàn thành! Tổng trọng số MST: ${totalWeight}`);
};

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

  addLogEntry("Bắt đầu thuật toán Kruskal");
  addLogEntry(`Số cạnh: ${edges.length}`);

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

  addLogEntry(`\nHoàn thành! Tổng trọng số MST: ${totalWeight}`);
};

// ======================= Utility Functions ======================
// Hàm delay để minh họa các bước
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
