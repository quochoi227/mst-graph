import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { cytoscapeStylesheet } from "../config/stylesheet";
import Info from "./graph-info";
import GraphLog from "./graph-log";
import GraphStatsPanel from "./graph-stats";
import { useGraphStore } from "../store/useGraphStore";

export default function Graph() {
  const cyRef = useRef<cytoscape.Core>(null);
  const sourceNodeRef = useRef<cytoscape.NodeSingular | null>(null);
  const edgeRef = useRef<cytoscape.EdgeSingular | null>(null);
  const nodeRef = useRef<cytoscape.NodeSingular | null>(null);

  const { setCy, setSourceNode } = useGraphStore();

  const [popup, setPopup] = useState<{
    visible: boolean;
    x: number;
    y: number;
    modelPosition: cytoscape.Position | null;
    ele: "node" | "edge";
  }>({
    visible: false,
    x: 0,
    y: 0,
    modelPosition: null,
    ele: "node", // 'node' hoặc 'edge'
  });
  const [labelInput, setLabelInput] = useState("");

  const elements = useMemo(
    () => [
      { data: { id: "a", label: "A" }, position: { x: 200, y: 100 } },
      { data: { id: "b", label: "B" }, position: { x: 300, y: 100 } },
      { data: { id: "c", label: "C" }, position: { x: 400, y: 200 } },
      { data: { id: "d", label: "D" }, position: { x: 300, y: 300 } },
      { data: { id: "e", label: "E" }, position: { x: 200, y: 300 } },
      { data: { id: "f", label: "F" }, position: { x: 100, y: 200 } },
      { data: { id: "ab", source: "a", target: "b", label: "1", weight: 1 } },
      { data: { id: "ba", source: "b", target: "a", label: "4", weight: 4 } },
      { data: { id: "fa", source: "f", target: "a", label: "16", weight: 16 } },
      { data: { id: "ae", source: "a", target: "e", label: "10", weight: 10 } },
      { data: { id: "fe", source: "f", target: "e", label: "19", weight: 19 } },
      { data: { id: "fc", source: "f", target: "c", label: "15", weight: 15 } },
      { data: { id: "eb", source: "e", target: "b", label: "8", weight: 8 } },
      { data: { id: "ec", source: "e", target: "c", label: "2", weight: 2 } },
      { data: { id: "cd", source: "c", target: "d", label: "5", weight: 5 } },
      { data: { id: "de", source: "d", target: "e", label: "3", weight: 3 } },
      { data: { id: "cb", source: "c", target: "b", label: "6", weight: 6 } },
      { data: { id: "ca", source: "c", target: "a", label: "11", weight: 11 } },
    ],
    []
  );

  // --- MỚI: Xử lý sự kiện bàn phím để xóa ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Kiểm tra nếu đang nhập liệu trong ô Input thì KHÔNG xóa
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      // 2. Kiểm tra phím Delete hoặc Backspace
      const cy = cyRef.current;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (!cy) return;

        // Lấy các phần tử đang được chọn (selected)
        const selectedElements = cy.$(":selected");

        // Nếu có phần tử đang chọn -> Xóa
        if (selectedElements.length > 0) {
          // Logic phụ: Nếu node đang dùng để nối dây bị xóa thì phải reset biến nhớ
          if (
            sourceNodeRef.current &&
            selectedElements.contains(sourceNodeRef.current)
          ) {
            sourceNodeRef.current = null;
          }

          selectedElements.remove();
        }
      } else if (e.key === "Escape") {
        cy?.$(":selected").unselect();
        if (sourceNodeRef.current) {
          sourceNodeRef.current.removeClass("selected-source");
          setSourceNode(null);
          sourceNodeRef.current = null;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const onCyInit = useCallback(
    (cy: cytoscape.Core) => {
      if (cyRef.current === cy) return;
      cyRef.current = cy;
      setCy(cy);
      cy.center()
      cy.off("tap");
      cy.off("pan zoom");

      // 1. Xử lý click vào NODE
      cy.on("tap", "node", (event) => {
        // Dừng nổi bọt để tránh kích hoạt background click
        event.originalEvent.stopPropagation();
        setPopup((prev) => ({ ...prev, visible: false }));

        const node = event.target;

        // Logic nối dây (giữ nguyên)
        if (!sourceNodeRef.current) {
          sourceNodeRef.current = node;
          setSourceNode(node);
          // node.addClass("selected-source");
          return;
        }

        const source = sourceNodeRef.current;
        const target = node;

        if (source.id() === target.id()) {
          // Click lại vào chính nó để thay đổi label
          nodeRef.current = node;
          const nodePos = node.renderedPosition();
          setLabelInput(node.data("label") || "");
          setPopup({
            visible: true,
            x: nodePos.x,
            y: nodePos.y,
            modelPosition: node.position(),
            ele: "node",
          });

          // source.removeClass("selected-source");
          sourceNodeRef.current = null;
          setSourceNode(null);
          return;
        }

        const addedEdge = cy.add({
          group: "edges",
          data: {
            // id: `${source.id()}-${target.id()}`,
            id: `edge-${Date.now()}`,
            source: source.id(),
            target: target.id(),
            label: "",
            weight: 0,
          },
        });

        edgeRef.current = addedEdge;
        // Lấy tọa độ chính giữa của cạnh
        const midModel = addedEdge.midpoint(); // { x, y } trong toạ độ mô hình
        const midRendered = addedEdge.renderedMidpoint(); // { x, y } theo pixel trên màn hình

        // Ví dụ: đặt popup nhỏ ở giữa cạnh (rendered)
        setPopup({
          visible: true,
          x: midRendered.x,
          y: midRendered.y,
          modelPosition: midModel,
          ele: "edge",
        });

        source.removeClass("selected-source");
        sourceNodeRef.current = node;
        setSourceNode(node);
      });

      // 2. Xử lý click vào VÙNG TRỐNG
      cy.on("tap", (event) => {
        if (event.target === cy) {
          if (sourceNodeRef.current) {
            sourceNodeRef.current.removeClass("selected-source");
            sourceNodeRef.current = null;
          }
          setPopup({
            visible: true,
            x: event.renderedPosition.x,
            y: event.renderedPosition.y,
            modelPosition: event.position,
            ele: "node",
          });
          setLabelInput("");
        }
      });

      cy.on("tap", "edge", (event) => {
        event.originalEvent.stopPropagation();
        
        const edge = event.target;
        edgeRef.current = edge;
        
        // Lấy tọa độ giữa của edge
        const midRendered = edge.renderedMidpoint();
        const midModel = edge.midpoint();
        
        // Hiển thị popup để edit edge
        setLabelInput(edge.data("label") || "");
        setPopup({
          visible: true,
          x: midRendered.x,
          y: midRendered.y,
          modelPosition: midModel,
          ele: "edge",
        });
        
        // Reset source node nếu đang trong chế độ nối dây
        if (sourceNodeRef.current) {
          sourceNodeRef.current.removeClass("selected-source");
          sourceNodeRef.current = null;
          setSourceNode(null);
        }
      })

      cy.on("pan zoom", () => {
        setPopup((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      });
    },
    [setCy, setSourceNode]
  );

  useEffect(() => {
    return () => {
      setCy(null); // dọn dẹp khi unmount
    };
  }, [setCy]);

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && labelInput.trim() !== "") {
      const cy = cyRef.current;
      if (!cy) return;
      if (popup.ele === "node") {
        // Kiểm tra xem có phải đang edit node hay tạo node mới
        if (nodeRef.current) {
          // Edit existing node
          nodeRef.current.data("label", labelInput);
          nodeRef.current = null;
        } else {
          // Create new node
          const id = `node-${Date.now()}`;
          if (popup.modelPosition) {
            cy.add({
              group: "nodes",
              data: { id, label: labelInput },
              position: popup.modelPosition,
            });
          }
        }
      } else if (popup.ele === "edge") {
        if (edgeRef.current) {
          edgeRef.current.data("label", labelInput);
          edgeRef.current.data("weight", parseFloat(labelInput) || 0);
          edgeRef.current = null;
        }
      }
      setLabelInput("");
      setPopup({ ...popup, visible: false });
    } else if (e.key === "Escape") {
      setPopup({ ...popup, visible: false });
      nodeRef.current = null;
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <GraphStatsPanel />
        <div className="relative flex-1 bg-white border-b border-slate-200">
          <CytoscapeComponent
            elements={elements}
            cy={onCyInit}
            style={{ width: "100%", height: "100%" }}
            // layout={{
            //   name: "breadthfirst",
            //   // fit: true,
            // }}
            stylesheet={cytoscapeStylesheet}
          />

          {popup.visible && (
            <input
              autoFocus
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={handleKeyDownInput}
              onBlur={() => setPopup({ ...popup, visible: false })}
              type={popup.ele === "edge" ? "number" : "text"}
              placeholder={popup.ele === "node" ? "Node label" : "Edge weight"}
              style={{
                position: "absolute",
                left: popup.x,
                top: popup.y,
                zIndex: 10,
                transform: "translate(-50%, -50%)",
                padding: "5px",
                borderRadius: "4px",
                border: "1px solid #333",
                width: "100px",
                backgroundColor: "#fff"
              }}
            />
          )}
        </div>
        <div className="h-56">
          <GraphLog />
        </div>
      </div>
      <Info />
    </div>
  );
}
