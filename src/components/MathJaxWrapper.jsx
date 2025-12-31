import { useEffect, useRef } from "react";
export default function MathJaxWrapper({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (window.MathJax && ref.current) {
      window.MathJax.typesetPromise([ref.current]);
    }
  }, [children]);

  return <span ref={ref}>{children}</span>;
}
