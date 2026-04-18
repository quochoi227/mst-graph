import cytoscape from "cytoscape";
import { useGraphStore } from "../store/useGraphStore";
import { getRandomColor } from "../lib/utils";

export const reset = (cy: cytoscape.Core | null) => {
  if (!cy) return;
  cy.elements().removeClass(
    "highlighted edge-highlighted candidate-edge"
  );
  // cy.$(":selected").unselect();
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
  addLogEntry(`  - Duyệt node: ${node.data("label")}`);
  visited.add(node.id());
  node.animate({
    style: { "background-color": color }
  }, {
    duration: 500,
    easing: "ease-in-out"
  });
  await delay(600);
  const neighborEdges = node.connectedEdges();
  for (let i = 0; i < neighborEdges.length; i++) {
    const edge = neighborEdges[i];
    const otherNode = edge.source().id() === node.id() ? edge.target() : edge.source();
    if (!visited.has(otherNode.id())) {
      edge.animate({
        style: { "line-color": color }
      }, {
        duration: 500,
        easing: "ease-in-out"
      });
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

// Tiến hành chỉnh sửa thuật toán Prim và Kruskal như sau:
// Mỗi lần play, backward, forward sẽ thực hiện reset thuật toán về trạng thái ban đầu và chạy lại từ đầu đến bước hiện tại.
// Nhưng những bước trước bước hiện tại sẽ không có delay, chỉ những bước từ bước hiện tại trở đi mới có delay để minh họa quá trình thực hiện thuật toán. Điều này giúp người dùng dễ dàng theo dõi và hiểu được quá trình thực hiện thuật toán mà không bị gián đoạn bởi các bước đã qua.

export const primMST = async (
  cy: cytoscape.Core | null,
  sourceNode: string,
  delayMs: number = 500,
  isPaused: boolean = false
): Promise<void> => {
  if (!cy) return;
  const { addLogEntry, currentStep, setCurrentStep, setPlaying, resetLog, addPrimStep, resetPrimSteps } = useGraphStore.getState();

  // Nếu đồ thị không liên thông, thì alert và dừng thuật toán
  const components = cy.elements().components();
  if (components.length > 1) {
    alert("Đồ thị không liên thông - không thể tìm MST hoàn chỉnh");
    setPlaying(false);
    return;
  }


  let step = 0;
  reset(cy);
  resetLog();
  resetPrimSteps();

  const nodes = cy.nodes();
  const visited = new Set<string>();
  const mstEdges: cytoscape.EdgeSingular[] = [];

  // Bắt đầu từ node nguồn
  visited.add(sourceNode);
  cy.$id(sourceNode).addClass("highlighted");
  
  addLogEntry("Bắt đầu thuật toán Prim");
  addLogEntry(`Node khởi đầu: ${sourceNode}`);

  if (step >= currentStep) {
    await delay(delayMs);
  }

  //-------------------------------
  let selectedNode = sourceNode;
  // Khởi tạo pi và parent cho tất cả các node
  const pi = nodes.reduce((acc, node) => {
    acc[node.id()] = node.id() === sourceNode ? 0 : Infinity;
    return acc;
  }, {} as Record<string, number>);

  const parent = nodes.reduce((acc, node) => {
    acc[node.id()] = "∞";
    return acc;
  }, {} as Record<string, string | null>);

  
  //-------------------------------

  while (visited.size < nodes.length) {
    const updatedNodes: Set<string> = new Set();
    
    // Kiểm tra nếu đang chơi thì chờ
    if (useGraphStore.getState().playing === false) {
      addLogEntry("Thuật toán bị tạm dừng.");
      setCurrentStep(step);
      break;
    }

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

          if (step >= currentStep) {
            await delay(delayMs / 2);
          }
          const weight = connectedEdges[i].data("weight") || 1;

          // Cập nhật pi và parent nếu tìm thấy cạnh nhỏ hơn
          if (weight < pi[otherNode]) {
            pi[otherNode] = weight;
            parent[otherNode] = nodeId;
            updatedNodes.add(otherNode);
          }

          if (weight < minWeight) {
            minWeight = weight;
            minEdge = connectedEdges[i];
          }
        }
      }
    }

    if (step >= currentStep) {
      await delay(delayMs / 2);
    }

    // Xóa highlight candidate
    cy.edges(".candidate-edge").removeClass("candidate-edge");

    if (minEdge) {
      const selectedEdge = minEdge as cytoscape.EdgeSingular;
      const source = selectedEdge.source().id();
      const target = selectedEdge.target().id();
      const newNode = visited.has(source) ? target : source;

      visited.add(newNode);
      mstEdges.push(minEdge);

      addPrimStep({
        selectedNode,
        pi: { ...pi },
        parent: { ...parent },
        updatedNodes: Array.from(updatedNodes),
        action: `Chọn cạnh ${source} - ${target} (weight: ${minWeight})`
      });
      selectedNode = newNode;

      addLogEntry(`Chọn cạnh nhỏ nhất: ${source} - ${target} (weight: ${minWeight})`);
      selectedEdge.addClass("highlighted");
      cy.$id(newNode).addClass("highlighted");
      
      addLogEntry(`  - Thêm cạnh: ${source} - ${target} (weight: ${minWeight})`);
      step += 1;
      if (step === currentStep && isPaused && step < nodes.length - 1) {
        addLogEntry(`Đang tạm dừng tại bước ${currentStep}...`);
        setPlaying(false);
        break;
      }
      if (step >= currentStep) {
        await delay(delayMs);
      }
    } else {
      addLogEntry("Đồ thị không liên thông - không thể tìm MST hoàn chỉnh");
      break;
    }


  }

  if (visited.size === nodes.length) {
    // setCurrentStep(0); // Reset bước đi sau khi hoàn thành
    const totalWeight = mstEdges.reduce((sum, e) => sum + (e.data("weight") || 1), 0);
    addLogEntry(`\nHoàn thành! Tổng trọng số MST: ${totalWeight}`);
    setPlaying(false);
    setCurrentStep(mstEdges.length) // Đặt bước hiện tại bằng số cạnh đã chọn để có thể forward/backward đúng
  }
};

export const kruskalMST = async (
  cy: cytoscape.Core | null,
  delayMs: number = 500,
  isPaused: boolean = false
): Promise<void> => {
  if (!cy) return;
  const { addLogEntry, currentStep, setCurrentStep, setPlaying, resetLog, addKruskalStep, resetKruskalSteps } = useGraphStore.getState();
  
  // Nếu đồ thị không liên thông, thì alert và dừng thuật toán
  const components = cy.elements().components();
  if (components.length > 1) {
    alert("Đồ thị không liên thông - không thể tìm MST hoàn chỉnh");
    setPlaying(false);
    return;
  }

  
  let step = 0;
  reset(cy);
  resetLog();
  resetKruskalSteps()

  const nodes = cy.nodes();

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
    
    // Kiểm tra nếu đang chơi thì chờ
    if (useGraphStore.getState().playing === false) {
      addLogEntry("Thuật toán bị tạm dừng.");
      setCurrentStep(step);
      break;
    }

    edge.addClass("candidate-edge");

    if (step >= currentStep) {
      await delay(delayMs / 2);
    }

    const source = edge.source().id();
    const target = edge.target().id();
    const weight = edge.data("weight") || 1;

    if (union(source, target)) {
      mstEdges.push(edge);
      totalWeight += weight;

      edge.removeClass("candidate-edge");
      edge.addClass("edge-highlighted");
      edge.source().addClass("highlighted");
      edge.target().addClass("highlighted");

      addLogEntry(`  - Thêm cạnh: ${source} - ${target} (weight: ${weight})`);
      addKruskalStep({ source, target, weight, action: "add" });
      step += 1;
      if (step === currentStep && isPaused && step < nodes.length - 1) {
        addLogEntry(`Đang tạm dừng tại bước ${currentStep}...`);
        setPlaying(false);
        break;
      }
      if (step >= currentStep) {
        await delay(delayMs);
      }
      if (mstEdges.length === cy.nodes().length - 1) {
        break;
      }
    } else {
      edge.removeClass("candidate-edge");
      addLogEntry(`  - Bỏ qua cạnh: ${source} - ${target} (tạo chu trình)`);
      addKruskalStep({ source, target, weight, action: "skip" });
      if (step >= currentStep) {
        await delay(delayMs / 3);
      }
    }
  }

  // Nếu đã duyệt đủ cạnh của thuật toán thì mới hiện thị tổng trọng số
  if (mstEdges.length === cy.nodes().length - 1) {
    addLogEntry(`\nHoàn thành! Tổng trọng số MST: ${totalWeight}`);
    setPlaying(false);
    // Reset visited để có thể chạy lại thuật toán mà không bị lỗi
    // setCurrentStep(0); // Reset bước đi sau khi hoàn thành
    setCurrentStep(mstEdges.length); // Đặt bước hiện tại bằng số cạnh đã chọn để có thể forward/backward đúng
  }
};

// ======================= Utility Functions ======================
// Hàm delay để minh họa các bước
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
