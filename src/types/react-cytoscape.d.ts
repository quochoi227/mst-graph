declare module "react-cytoscapejs" {
  import * as React from "react";
  import cytoscape from "cytoscape";

  export interface CytoscapeComponentProps {
    elements?: cytoscape.ElementDefinition[];
    style?: React.CSSProperties;
    stylesheet?: cytoscape.Stylesheet[];
    layout?: cytoscape.LayoutOptions;
    zoom?: number;
    pan?: { x: number; y: number };
    minZoom?: number;
    maxZoom?: number;
    cy?: (cy: cytoscape.Core) => void;
    className?: string;
  }

  const CytoscapeComponent: React.FC<CytoscapeComponentProps>;
  export default CytoscapeComponent;
}
