import { SquareTerminal } from "lucide-react"
import { useGraphStore } from "../store/useGraphStore"
import { useEffect, useRef } from "react"


function GraphLog() {
  const { log } = useGraphStore()
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [log.length])

  return (
    <div className="pointer-events-none">
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden max-w-2xl mx-auto pointer-events-auto">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <SquareTerminal />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Execution Log
            </span>
          </div>
        </div>
        <div ref={logRef} className="p-3 h-48 overflow-y-auto font-mono text-xs space-y-1.5">
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