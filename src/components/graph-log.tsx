import { SquareTerminal, X } from "lucide-react"
import { useGraphStore } from "../store/useGraphStore"


function GraphLog() {
  const { log, addLogEntry } = useGraphStore()

  const handleAddLog = () => {
    const timestamp = new Date().toLocaleTimeString()
    addLogEntry(`[${timestamp}] New log entry added.`)
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden max-w-2xl mx-auto pointer-events-auto">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <SquareTerminal />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Execution Log
            </span>
          </div>
          <button className="text-slate-400 hover:text-red-500 transition-colors">
            <X onClick={handleAddLog} />
          </button>
        </div>
        <div className="p-3 h-32 overflow-y-auto font-mono text-xs space-y-1.5">
          {log.map((entry, index) => (
            <div key={index} className="text-slate-700">
              {entry}
            </div>
          ))}
          {/* <div className="pl-4 border-l-2 border-slate-100 text-slate-600">
            <div className="py-0.5">Step 1: Enqueue Node A</div>
            <div className="py-0.5">
              Step 2: Dequeue Node A, Visit Neighbors [B, C]
            </div>
            <div className="text-amber-600 py-0.5">
              Step 3: Enqueue Node B, C
            </div>
          </div> */}
          <div className="animate-pulse text-secondary font-bold">_</div>
        </div>
      </div>
    </div>
  )
}

export default GraphLog