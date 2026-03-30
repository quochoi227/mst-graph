import { useGraphStore } from "../store/useGraphStore";
import { Save, FolderOpen, ImageDown } from "lucide-react";
import { useEffect, useState } from "react";
// Import các hàm từ Tauri Plugin
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, readTextFile, writeFile } from "@tauri-apps/plugin-fs";

interface EdgeInput {
  source: string;
  target: string;
  weight: number;
}

interface ParseResult {
  edges: EdgeInput[];
  error: string | null;
}

const parseTextareaContent = (value: string): ParseResult => {
  if (value === "") {
    return { edges: [], error: null };
  }

  const lines = value.split(/\r?\n/);
  const parsedEdges: EdgeInput[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    const lineNumber = i + 1;

    if (rawLine.trim() === "") {
      return {
        edges: [],
        error: `Dòng ${lineNumber} không được để trống.`
      };
    }

    if (rawLine !== rawLine.trim() || /\s{2,}/.test(rawLine) || rawLine.includes("\t")) {
      return {
        edges: [],
        error: `Dòng ${lineNumber} có khoảng trắng không hợp lệ. Chỉ được dùng 1 dấu cách giữa các giá trị.`
      };
    }

    const parts = rawLine.split(" ");
    if (parts.length !== 3) {
      return {
        edges: [],
        error: `Dòng ${lineNumber} phải có dúng 3 giá trị: nguồn đích trọng_số.`
      };
    }

    const [source, target, weightText] = parts;
    const weight = Number(weightText);
    if (Number.isNaN(weight)) {
      return {
        edges: [],
        error: `Trọng số ở dòng ${lineNumber} phải là số.`
      };
    }

    parsedEdges.push({ source, target, weight });
  }

  return { edges: parsedEdges, error: null };
};

const toTextareaContent = (edges: EdgeInput[]): string => {
  return edges.map((edge) => `${edge.source} ${edge.target} ${edge.weight}`).join("\n");
};

function GraphInfo() {
  const { cy, setSourceNode } = useGraphStore();
  const [graphText, setGraphText] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i += 1) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  };

  useEffect(() => {
    if (cy) {
      const elements = cy.elements().map(ele => {
        if (ele.isEdge()) {
          return {
            source: ele.source().data('label'),
            target: ele.target().data('label'),
            weight: Number(ele.data('weight') ?? 0)
          };
        }
        return null;
      }).filter(ele => ele !== null);

      const parsed = elements as EdgeInput[];
      setGraphText(toTextareaContent(parsed));
      setValidationError(null);
    }
  }, [cy]);

  // Nếu trên đồ thị có bất kỳ điều gì thay đổi (thêm/sửa/xóa node hoặc edge) thì cập nhật lại bảng
  useEffect(() => {
    if (!cy) return;
    const updateEdgesFromGraph = () => {
      const elements = cy.elements().map(ele => {
        if (ele.isEdge()) {
          return {
            source: ele.source().data('label'),
            target: ele.target().data('label'),
            weight: Number(ele.data('weight') ?? 0)
          };
        }
        return null;
      }).filter(ele => ele !== null);

      const parsed = elements as EdgeInput[];
      setGraphText(toTextareaContent(parsed));
      setValidationError(null);
    };

    cy.on('add remove data', 'node, edge', updateEdgesFromGraph);
    return () => {
      cy.off('add remove data', 'node, edge', updateEdgesFromGraph);
    };
  }, [cy]);

  const handleTextareaChange = (value: string) => {
    setGraphText(value);
    const { error } = parseTextareaContent(value);
    setValidationError(error);
  };

  const handleUpdateGraph = () => {
    if (!cy) return;

    const { edges: parsedEdges, error } = parseTextareaContent(graphText);
    if (error) {
      setValidationError(error);
      alert(error);
      return;
    }

    setValidationError(null);
    setSourceNode(null);

    // Xóa tất cả các phần tử hiện tại
    cy.elements().remove();

    // Tạo set các đỉnh duy nhất từ dữ liệu edges
    const nodeLabels = new Set<string>();
    parsedEdges.forEach(edge => {
      if (edge.source.trim()) nodeLabels.add(edge.source.trim());
      if (edge.target.trim()) nodeLabels.add(edge.target.trim());
    });

    // Thêm các đỉnh vào đồ thị với vị trí tự động
    const nodeArray = Array.from(nodeLabels);
    const radius = 200;
    const centerX = 400;
    const centerY = 300;

    nodeArray.forEach((label, index) => {
      const angle = (2 * Math.PI * index) / nodeArray.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      cy.add({
        group: 'nodes',
        data: { 
          id: label, 
          label: label 
        },
        position: { x, y }
      });
    });

    // Thêm các cạnh vào đồ thị
    parsedEdges.forEach((edge, index) => {
      if (edge.source.trim() && edge.target.trim()) {
        cy.add({
          group: 'edges',
          data: {
            id: `edge-${index}-${Date.now()}`,
            source: edge.source.trim(),
            target: edge.target.trim(),
            label: String(edge.weight),
            weight: edge.weight
          }
        });
      }
    });

    // Fit view để hiển thị toàn bộ đồ thị
    // cy.fit();
    cy.center();
  };

  const handleSaveGraph = async () => {
    if (!cy) return;

    try {
      // Lấy dữ liệu JSON của đồ thị từ Cytoscape
      const graphData = cy.json();

      // Mở dialog để chọn nơi lưu file
      const filePath = await save({
        defaultPath: 'graph.json',
        filters: [{
          name: 'JSON',
          extensions: ['json']
        }]
      });

      if (filePath) {
        // Lưu dữ liệu JSON vào file
        await writeTextFile(filePath, JSON.stringify(graphData, null, 2));
        alert('Đã lưu đồ thị thành công!');
      }
    } catch (error) {
      console.error('Lỗi khi lưu đồ thị:', error);
      alert('Có lỗi xảy ra khi lưu đồ thị!');
    }
  };

  const handleSaveGraphImage = async () => {
    if (!cy) return;

    try {
      const filePath = await save({
        defaultPath: 'graph.png',
        filters: [{
          name: 'PNG',
          extensions: ['png']
        }]
      });

      if (filePath) {
        const dataUrl = cy.png({ full: true, bg: '#ffffff', scale: 2 });
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        const imageBytes = base64ToUint8Array(base64Data);

        await writeFile(filePath, imageBytes);
        alert('Đã lưu ảnh đồ thị thành công!');
      }
    } catch (error) {
      console.error('Lỗi khi lưu ảnh đồ thị:', error);
      alert('Có lỗi xảy ra khi lưu ảnh đồ thị!');
    }
  };

  const handleLoadGraph = async () => {
    if (!cy) return;

    try {
      // Mở dialog để chọn file cần load
      const filePath = await open({
        multiple: false,
        filters: [{
          name: 'JSON',
          extensions: ['json']
        }]
      });

      if (filePath) {
        // Đọc nội dung file JSON
        const fileContent = await readTextFile(filePath as string);
        const graphData = JSON.parse(fileContent);

        // Xóa đồ thị hiện tại
        cy.elements().remove();

        // Load dữ liệu vào Cytoscape
        cy.json(graphData);

        // Cập nhật state của bảng từ đồ thị vừa load
        const loadedEdges: EdgeInput[] = [];
        cy.edges().forEach((edge) => {
          loadedEdges.push({
            source: edge.source().data('label') || '',
            target: edge.target().data('label') || '',
            weight: Number(edge.data('weight') ?? 0)
          });
        });

        setGraphText(toTextareaContent(loadedEdges));
        setValidationError(null);

        // Fit view để hiển thị toàn bộ đồ thị
        cy.fit();
        cy.center();

        alert('Đã load đồ thị thành công!');
      }
    } catch (error) {
      console.error('Lỗi khi load đồ thị:', error);
      alert('Có lỗi xảy ra khi load đồ thị!');
    }
  };

  return (
    <div className="w-72 border-l border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 bg-white">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
          Dữ liệu đồ thị
        </h2>
        <div className="mt-2 flex gap-2">
          <button
            onClick={handleSaveGraph}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-primary text-white text-xs rounded hover:bg-primary/90 transition-colors"
          >
            <Save size={14} />
            Lưu
          </button>
          <button
            onClick={handleSaveGraphImage}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600 transition-colors"
          >
            <ImageDown size={14} />
            Lưu ảnh
          </button>
          <button
            onClick={handleLoadGraph}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-secondary text-white text-xs rounded hover:bg-secondary/90 transition-colors"
          >
            <FolderOpen size={14} />
            Mở
          </button>
        </div>
      </div>

      {/* Edge List */}
      <div className="flex-1 overflow-auto p-2 space-y-2">
        <textarea
          value={graphText}
          onChange={(e) => handleTextareaChange(e.target.value)}
          placeholder={"3 2 4\n4 5 6"}
          className="w-full min-h-52 resize-none text-xs px-2 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-primary font-mono"
        />
        <p className="text-[11px] text-slate-500">
          Mỗi dòng gồm 3 giá trị: nguồn đích trọng_số.
        </p>
        {validationError && (
          <p className="text-[11px] text-red-500">{validationError}</p>
        )}
      </div>

      {/* Actions */}
      <div className="p-2 border-t border-slate-200 bg-white">
        <button
          onClick={handleUpdateGraph}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded transition-colors font-medium"
        >
          Cập nhật
        </button>
      </div>
    </div>
  )
}

export default GraphInfo