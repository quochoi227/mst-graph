import { useGraphStore } from "../store/useGraphStore";
import { Plus, Trash2, Save, FolderOpen, MoveRight } from "lucide-react";
import { useEffect, useState } from "react";
// Import các hàm từ Tauri Plugin
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";

interface EdgeInput {
  id: string;
  source: string;
  target: string;
  weight: string;
}

function GraphInfo() {
  const { cy, setSourceNode } = useGraphStore();
  const [edges, setEdges] = useState<EdgeInput[]>([
    { id: '1', source: '', target: '', weight: '' }
  ]);

  useEffect(() => {
    if (cy) {
      const elements = cy.elements().map(ele => {
        if (ele.isEdge()) {
          return {
            id: ele.id(),
            source: ele.source().data('label'),
            target: ele.target().data('label'),
            weight: ele.data('weight')?.toString() || ''
          };
        }
        return null;
      }).filter(ele => ele !== null)
      setEdges(elements as EdgeInput[]);
    }
  }, [cy])

  const addEdgeRow = () => {
    const newEdge: EdgeInput = {
      id: Date.now().toString(),
      source: '',
      target: '',
      weight: ''
    };
    setEdges([...edges, newEdge]);
  };

  const removeEdgeRow = (id: string) => {
    if (edges.length > 1) {
      setEdges(edges.filter(edge => edge.id !== id));
    }
  };

  const handleInputChange = (id: string, field: keyof EdgeInput, value: string) => {
    setEdges(edges.map(edge => 
      edge.id === id ? { ...edge, [field]: value } : edge
    ));
  };

  const handleUpdateGraph = () => {
    if (!cy) return;
    setSourceNode(null);

    // Xóa tất cả các phần tử hiện tại
    cy.elements().remove();

    // Tạo set các đỉnh duy nhất từ dữ liệu edges
    const nodeLabels = new Set<string>();
    edges.forEach(edge => {
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
          id: label.toLowerCase(), 
          label: label 
        },
        position: { x, y }
      });
    });

    // Thêm các cạnh vào đồ thị
    edges.forEach((edge, index) => {
      if (edge.source.trim() && edge.target.trim()) {
        const weight = parseFloat(edge.weight) || 0;
        cy.add({
          group: 'edges',
          data: {
            id: `edge-${index}-${Date.now()}`,
            source: edge.source.trim().toLowerCase(),
            target: edge.target.trim().toLowerCase(),
            label: edge.weight || '0',
            weight: weight
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
        cy.edges().forEach((edge, index) => {
          loadedEdges.push({
            id: `${index}-${Date.now()}`,
            source: edge.source().data('label') || '',
            target: edge.target().data('label') || '',
            weight: edge.data('weight')?.toString() || ''
          });
        });

        // Nếu không có cạnh nào, thêm một hàng trống
        if (loadedEdges.length === 0) {
          loadedEdges.push({ id: '1', source: '', target: '', weight: '' });
        }

        setEdges(loadedEdges);

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
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs rounded hover:bg-primary/90 transition-colors"
          >
            <Save size={14} />
            Lưu
          </button>
          <button
            onClick={handleLoadGraph}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-secondary text-white text-xs rounded hover:bg-secondary/90 transition-colors"
          >
            <FolderOpen size={14} />
            Mở
          </button>
        </div>
      </div>

      {/* Edge List */}
      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {edges.map((edge) => (
            <div key={edge.id} className="flex items-center gap-1 bg-white rounded border border-slate-200 p-1">
              <input
                type="text"
                value={edge.source}
                onChange={(e) => handleInputChange(edge.id, 'source', e.target.value)}
                placeholder="U"
                className="w-12 text-xs px-1.5 py-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-primary text-center"
              />
              <span className="text-slate-400 text-xs">
                <MoveRight />
              </span>
              <input
                type="text"
                value={edge.target}
                onChange={(e) => handleInputChange(edge.id, 'target', e.target.value)}
                placeholder="V"
                className="w-12 text-xs px-1.5 py-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-primary text-center"
              />
              <span className="text-slate-400 text-xs">:</span>
              <input
                type="number"
                value={edge.weight}
                onChange={(e) => handleInputChange(edge.id, 'weight', e.target.value)}
                placeholder="W"
                className="w-20 text-xs px-1.5 py-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-primary text-center"
              />
              <button
                onClick={() => removeEdgeRow(edge.id)}
                disabled={edges.length === 1}
                className="p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Xóa"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-2 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <button
            onClick={addEdgeRow}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded transition-colors"
          >
            <Plus size={14} />
            Thêm
          </button>
          <button
            onClick={handleUpdateGraph}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded transition-colors font-medium"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  )
}

export default GraphInfo