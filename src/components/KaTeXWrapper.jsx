// KaTeXWrapper.jsx
import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const KaTeXWrapper = ({ children, displayMode = false }) => {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(children, ref.current, { displayMode });
      } catch (err) {
        ref.current.innerHTML = `<span style="color: red;">${err.message}</span>`;
      }
    }
  }, [children, displayMode]);

  return <span ref={ref}></span>;
};

export default KaTeXWrapper;
