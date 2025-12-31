import { useEffect, useRef } from "react";
import functionPlot from "function-plot";

export default function FunctionPlot({
  width = 300,
  height = 200,
  xDomain = [-5, 5],
  yDomain = [-3, 7],
  grid = true,
  data = [],
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous render (important for React re-renders)
    containerRef.current.innerHTML = "";

    functionPlot({
      target: containerRef.current,
      width,
      height,
      grid,
      xAxis: { domain: xDomain },
      yAxis: { domain: yDomain },
      data,
    });
  }, [width, height, xDomain, yDomain, grid, data]);

  return <div ref={containerRef} />;
}
