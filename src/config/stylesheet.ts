export const cytoscapeStylesheet = [
  // Style cơ bản
  {
    selector: "node",
    style: {
      label: "data(label)",
      backgroundColor: "#fff",
      color: "#94a3b8",
      borderWidth: "2px",
      borderColor: "#e2e8f0",
      width: "40px",
      height: "40px",
      fontSize: "20px",
      textValign: "center",
      textHalign: "center",
    },
  },
  {
    selector: "edge",
    style: {
      label: "data(label)",
      color: "#94a3b8",
      fontSize: "16px",
      width: 2,
      curveStyle: "bezier",
      lineColor: "#cbd5e1",
      targetArrowColor: "#cbd5e1",
      arrowScale: 0.8,
    },
  },

  // --- MỚI: Style khi được Focus/Select (để biết cái gì sẽ bị xóa) ---
  {
    selector: "node:selected", // Node đang được chọn
    style: {
      borderWidth: "2px",
      color: "#94a3b8",
      borderColor: "#e2e8f0", // Viền đậm bao quanh
      // backgroundColor: "#2a9df4", // Đậm màu nền hơn chút
    },
  },
  {
    selector: "edge:selected", // Edge đang được chọn
    style: {
      lineColor: "#e74c3c", // Đổi màu dây thành đỏ khi chọn
      width: 2.5, // Dây to lên chút
    },
  },

  // Style logic nối dây (custom class)
  {
    selector: ".selected-source",
    style: {
      backgroundColor: "#fff",
      borderWidth: "2px",
      borderColor: "#fbbf24",
      color: "#fbbf24",
    },
  },

  // Style cho traversal
  {
    selector: ".highlighted",
    style: {
      backgroundColor: "#00afef",
      color: "#2e2e2e",
      lineColor: "#00afef",
      targetArrowColor: "#00afef",
      transitionProperty: "background-color, line-color, target-arrow-color",
      transitionDuration: "0.5s",
    },
  },

  // Candidate edge
  {
    selector: ".candidate-edge",
    style: {
      lineColor: "#fbbf24",
      targetArrowColor: "#fbbf24",
      width: 3,
      lineStyle: "dashed",
    }
  }
];
