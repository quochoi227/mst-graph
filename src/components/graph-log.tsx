import { SquareTerminal, Trash2 } from "lucide-react"
import { useGraphStore } from "../store/useGraphStore"
import { useEffect, useRef, useState } from "react"

const VIEWS = {
  LOG_STRING: "LOG_STRING",
  KRUSKAL_TABLE: "KRUSKAL_TABLE",
  PRIM_TABLE: "PRIM_TABLE",
}

function GraphLog() {
  const { cy, sourceNode, log, resetLog, kruskalSteps, resetKruskalSteps, primSteps, resetPrimSteps } = useGraphStore()
  const logRef = useRef<HTMLDivElement>(null)
  const kruskalLogRef = useRef<HTMLDivElement>(null)
  const primLogRef = useRef<HTMLDivElement>(null)
  const [currentView, setCurrentView] = useState(VIEWS.LOG_STRING)

  const nodesLabels = cy?.nodes().map(node => node.id()) || []

  const handleReset = () => {
    resetLog();
    resetKruskalSteps();
    resetPrimSteps();
  }

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [log.length])

  useEffect(() => {
    kruskalLogRef.current?.scrollTo({
      top: kruskalLogRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [kruskalSteps.length])

  useEffect(() => {
    primLogRef.current?.scrollTo({
      top: primLogRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [primSteps.length])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-1 border-b border-slate-200 bg-slate-50/60">
        {/* View Switcher */}
        <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setCurrentView(VIEWS.LOG_STRING)}
            className={`rounded-md px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${currentView === VIEWS.LOG_STRING
              ? "bg-emerald-500 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"}`}
          >
            Log
          </button>
          <button
            onClick={() => setCurrentView(VIEWS.KRUSKAL_TABLE)}
            className={`rounded-md px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${currentView === VIEWS.KRUSKAL_TABLE
              ? "bg-emerald-500 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"}`}
          >
            Kruskal Steps
          </button>
          <button
            onClick={() => setCurrentView(VIEWS.PRIM_TABLE)}
            className={`rounded-md px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${currentView === VIEWS.PRIM_TABLE
              ? "bg-emerald-500 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"}`}
          >
            Prim Steps
          </button>
        </div>
        <button
          onClick={handleReset}
          className="text-slate-600 p-1 hover:text-red-400 rounded transition-colors"
          title="Xóa log"
        >
          <Trash2 size={14} />
        </button>
      </div>
        
      {currentView === VIEWS.LOG_STRING && (
        <div ref={logRef} className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-0.5">
          {log.length === 0 ? (
            <div className="text-slate-700 text-center py-4">
              Chưa có log. Hãy chạy thuật toán để xem kết quả.
            </div>
          ) : (
            log.map((entry, index) => (
              <div key={index} className="text-slate-700 leading-relaxed">
                <span className="text-slate-600 mr-2">{String(index + 1).padStart(2, '0')}.</span>
                {entry}
              </div>
            ))
          )}
          {log.length > 0 && (
            <div className="animate-pulse text-emerald-400 font-bold mt-1">▌</div>
          )}
        </div>
      )}
      {currentView === VIEWS.KRUSKAL_TABLE && (
        <div ref={kruskalLogRef} className="p-3 overflow-y-auto">
          {/* KRUSKAL_TABLE */}
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="px-2 py-1">Nguồn</th>
                <th className="px-2 py-1">Đích</th>
                <th className="px-2 py-1">Trọng số</th>
                <th className="px-2 py-1">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {kruskalSteps && kruskalSteps.length > 0 ? (
                kruskalSteps.map((step, index) => (
                  <tr key={index} className="border-b border-slate-200">
                    <td className="px-2 py-1">{step.source}</td>
                    <td className="px-2 py-1">{step.target}</td>
                    <td className="px-2 py-1">{step.weight}</td>
                    <td className="px-2 py-1">
                      {step.action === "add" ? (
                        <span className="text-green-500 font-bold">Thêm</span>
                      ) : (
                        <span className="text-red-500 font-bold">Bỏ qua</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-slate-700 text-center py-4">
                    Chưa có bước nào. Hãy chạy thuật toán Kruskal để xem kết quả.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {currentView === VIEWS.PRIM_TABLE && (
        <div ref={primLogRef} className="p-3 overflow-y-auto">
          {/* PRIM_TABLE */}
          {/* Dòng 1: "Bước", n đỉnh trên đồ thị, "công việc" */}
          {/* Dòng 2: "KT", pi[i]=oo (n lần, khởi tạo pi của mỗi đỉnh là vô cùng, đỉnh bắt đầu có pi là 0), "Khởi tạo" */}
          {/* Dòng 3,4,...: 1,2,..., đánh dấu * tại pi nhỏ nhất ở mỗi bước, cập nhật lại pi nếu nhỏ hơn pi hiện tại, nếu pi lớn hơn pi hiện tại thì hiển thị đoạn text nêu rõ, ở cột "công việc" thì hiển thị: chọn u = ?, pi[u] = ?, cập nhật a,b,c,... */}

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="px-2 py-1">Bước</th>
                {nodesLabels.map((label, index) => (
                  <th key={index} className="px-2 py-1">{label}</th>
                ))}
                <th className="px-2 py-1">Công việc</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="px-2 py-1">KT</td>
                {nodesLabels.map((label, index) => {
                  if (label === sourceNode?.id()) {
                    return (
                      <td key={index} className="px-2 py-1">
                        pi[{label}]=<span className="text-slate-600">0</span>
                      </td>
                    )
                  } else {
                    return (
                      <td key={index} className="px-2 py-1">
                        pi[{label}]=<span className="text-slate-600">∞</span>
                      </td>
                    )
                  }
                })}
                <td className="px-2 py-1">Khởi tạo</td>
              </tr>
              {primSteps && primSteps.length > 0 ? (
                primSteps.map((step, index) => (
                  <tr key={index} className="border-b border-slate-200">
                    <td className="px-2 py-1">{index + 1}</td>
                    {nodesLabels.map((label, idx) => {
                      const piValue = step.pi[label]
                      const isSelected = label === step.selectedNode

                      return (
                        <td key={idx} className="px-2 py-1">
                          {isSelected ? <span className="text-green-500 font-bold">*</span>
                          : piValue === Infinity ? (
                            <span className="text-slate-600">
                              pi[{label}]=<span className="text-slate-600">∞</span>
                              <br />
                              p[{label}]={step.parent[label]}
                            </span>
                          ) : (
                            <span className={isSelected ? "text-green-500 font-bold" : "text-slate-600"}>
                              pi[{label}]={piValue}
                              <br />
                              p[{label}]={step.parent[label]}
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td className="px-2 py-1">
                      Chọn u = <span className="text-green-500 font-bold">{step.selectedNode}</span>, pi[u] = <span className="text-green-500 font-bold">{step.pi[step.selectedNode]}</span>
                      {step.updatedNodes && step.updatedNodes.length > 0 && (
                        <div className="mt-1">
                          Cập nhật:{" "}
                          {step.updatedNodes.map((node, idx) => (
                            <span key={idx} className="text-emerald-400">
                              {node}{idx < step.updatedNodes.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={nodesLabels.length + 2} className="text-slate-700 text-center py-4">
                    Chưa có bước nào. Hãy chạy thuật toán Prim để xem kết quả.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default GraphLog