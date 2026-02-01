function Footer() {
  return (
    <footer className="h-8 bg-slate-100 border-t border-slate-200 flex items-center justify-between px-4 text-xs text-slate-500">
      <div className="flex items-center gap-4">
        <span>Click vào vùng trống để thêm đỉnh, click 2 đỉnh để nối cạnh</span>
      </div>
      <div className="flex items-center gap-4">
        <span>Cây khung tối thiểu</span>
      </div>
    </footer>
  );
}

export default Footer;
