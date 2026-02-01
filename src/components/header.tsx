import { GitGraph, Info, Github } from "lucide-react";

function Header() {
  return (
    <header className="h-14 bg-primary flex items-center justify-between px-6 shadow-md">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-lg">
          <GitGraph className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-wide">
            Giải thuật tìm cây khung nhỏ nhất
          </h1>
          <p className="text-white/70 text-xs">
            Trực quan hóa thuật toán đồ thị
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm">
          <Info size={18} />
          <span>Hướng dẫn</span>
        </button>
        <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm">
          <Github size={18} />
          <span>GitHub</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
