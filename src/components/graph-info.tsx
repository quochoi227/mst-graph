import { useGraphStore } from "../store/useGraphStore";
import { Plus, Trash2, Save, FolderOpen } from "lucide-react";
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
  const { cy } = useGraphStore();
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
    <div className="flex-1 p-4 border-l border-border overflow-auto">
      {/* Bảng nhập đỉnh và cạnh */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Nhập đỉnh và cạnh</h2>
          <p className="text-sm text-gray-500 mt-1">Thêm các đỉnh và cạnh cho đồ thị</p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSaveGraph}
              className="button-secondary"
            >
              <Save size={18} />
              Save
            </button>

            <button
              onClick={handleLoadGraph}
              className="button-secondary"
            >
              <FolderOpen size={18} />
              Open
            </button>
          </div>
        </div>
        
        <div className="p-2">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                {edges.map((edge) => (
                  <tr key={edge.id}>
                    <td className="p-0.5">
                      <input
                        type="text"
                        value={edge.source}
                        onChange={(e) => handleInputChange(edge.id, 'source', e.target.value)}
                        placeholder="Đỉnh 1"
                        className="input text-xs px-2 py-1"
                      />
                    </td>
                    <td className="p-0.5">
                      <input
                        type="text"
                        value={edge.target}
                        onChange={(e) => handleInputChange(edge.id, 'target', e.target.value)}
                        placeholder="Đỉnh 2"
                        className="input text-xs px-2 py-1"
                      />
                    </td>
                    <td className="p-0.5">
                      <input
                        type="text"
                        value={edge.weight}
                        onChange={(e) => handleInputChange(edge.id, 'weight', e.target.value)}
                        placeholder="W"
                        className="input text-xs px-2 py-1 w-14"
                      />
                    </td>
                    <td className="p-0.5 w-8">
                      <button
                        onClick={() => removeEdgeRow(edge.id)}
                        disabled={edges.length === 1}
                        className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Xóa hàng"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex gap-3">
            <button
              onClick={addEdgeRow}
              className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              <Plus size={18} />
              Add
            </button>
            
            <button
              onClick={handleUpdateGraph}
              className="button-primary"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GraphInfo