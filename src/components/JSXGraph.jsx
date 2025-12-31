import { useEffect, useRef } from "react";

const JSXGraph = ({
  equationType,
  expr1,
  expr2 = null,
  range = [-10, 10],
  width = 300,
  height = 200,
}) => {
  const boardRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Cleanup old board
    if (boardRef.current) {
      JXG.JSXGraph.freeBoard(boardRef.current);
      boardRef.current = null;
    }

    const [min, max] = range;

    // Init board
    const board = JXG.JSXGraph.initBoard(containerRef.current, {
      boundingbox: [min, max, max, min],
      axis: true,
      showCopyright: false,
      showNavigation: false,
      pan: false,
      zoom: false,
    });

    boardRef.current = board;

    // ---------- FUNCTION GRAPH ----------
    if (equationType === "function") {
      const f = new Function("x", `return ${expr1}`);
      board.create("functiongraph", [f, min, max]);
    }

    // ---------- PARAMETRIC CURVE ----------
    else if (equationType === "parametric") {
      const fx = new Function("t", `return ${expr1}`);
      const fy = new Function("t", `return ${expr2}`);
      board.create("curve", [fx, fy, 0, 10]);
    }

    // ---------- IMPLICIT CURVE (FIXED) ----------
    else if (equationType === "implicit") {
      const f = new Function("x", "y", `return ${expr1}`);
      board.create("implicitcurve", [(x, y) => f(x, y)]);
    }

    return () => {
      if (boardRef.current) {
        JXG.JSXGraph.freeBoard(boardRef.current);
        boardRef.current = null;
      }
    };
  }, [equationType, expr1, expr2, range]);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        margin: "16px auto",
        border: "1px solid #ccc",
        borderRadius: "6px",
      }}
    />
  );
};

export default JSXGraph;
