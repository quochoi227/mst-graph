import { SquareTerminal, Trash2 } from "lucide-react"
import { useGraphStore } from "../store/useGraphStore"
import { useEffect, useRef } from "react"


function GraphLog() {
  const { log, resetLog } = useGraphStore()
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [log.length])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SquareTerminal size={16} className="text-emerald-400" />
          <span className="text-slate-600 text-xs font-mono font-bold uppercase tracking-wider">
            Execution Log
          </span>
        </div>
        <button
          onClick={resetLog}
          className="text-slate-600 p-1 hover:text-red-400 rounded transition-colors"
          title="Xóa log"
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      {/* Log Content */}
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
    </div>
  )
}

export default GraphLog