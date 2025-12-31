import { useState, useRef, useEffect } from 'react';

const LaTeXToHTML = ({ latex: initialLatex, onLatexChange }) => {
  const [latex, setLatex] = useState(initialLatex || '');
  const [showSource, setShowSource] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const saveTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setLatex(initialLatex || '');
  }, [initialLatex]);

  // Load KaTeX CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';
    document.head.appendChild(link);
  }, []);

  const handleLatexChange = (newLatex) => {
    setLatex(newLatex);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (onLatexChange) {
        onLatexChange(newLatex);
      }
    }, 1000);
  };

  const toggleView = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setShowSource(!showSource);
      setIsFlipping(false);
    }, 300);
  };

  // Render with KaTeX for math
  useEffect(() => {
    if (!latex || !containerRef.current || showSource) return;

    const renderLatex = async () => {
      try {
        const katex = await import('https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.mjs');
        containerRef.current.innerHTML = '';

        // Extract document content
        const docMatch = latex.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/);
        if (!docMatch) {
          containerRef.current.textContent = 'No document content found';
          return;
        }

        let content = docMatch[1];
        
        // Remove comments
        content = content.replace(/%.*$/gm, '');

        // Process content
        let processed = content
          // Handle line breaks
          .replace(/\\\\/g, '<br>')
          // Handle spacing commands
          .replace(/\\bigskip/g, '<div class="h-6"></div>')
          .replace(/\\medskip/g, '<div class="h-4"></div>')
          .replace(/\\smallskip/g, '<div class="h-2"></div>')
          // Handle sections
          .replace(/\\section\*?\{([^}]+)\}/g, '<h2 class="text-2xl font-bold mt-6 mb-4">$1</h2>')
          .replace(/\\subsection\*?\{([^}]+)\}/g, '<h3 class="text-xl font-semibold mt-5 mb-3">$1</h3>')
          // Convert enumerate
          .replace(/\\begin\{enumerate\}/g, '<ol class="list-decimal ml-8 my-4 space-y-2">')
          .replace(/\\end\{enumerate\}/g, '</ol>')
          // Convert itemize
          .replace(/\\begin\{itemize\}(\[.*?\])?/g, '<ul class="list-disc ml-8 my-4 space-y-2">')
          .replace(/\\end\{itemize\}/g, '</ul>')
          // Handle items
          .replace(/\\item\s*/g, '<li class="ml-2">')
          // Handle center
          .replace(/\\begin\{center\}/g, '<div class="text-center">')
          .replace(/\\end\{center\}/g, '</div>')
          // Remove noindent
          .replace(/\\noindent\s*/g, '');

        const wrapper = document.createElement('div');
        wrapper.innerHTML = processed;

        const processNode = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const fragment = document.createDocumentFragment();
            
            // Split by display math \[ ... \]
            const displayParts = text.split(/(\\\[[\s\S]*?\\\])/);
            
            displayParts.forEach(part => {
              if (part.startsWith('\\[') && part.endsWith('\\]')) {
                const math = part.slice(2, -2);
                const div = document.createElement('div');
                div.className = 'my-4 text-center overflow-x-auto';
                try {
                  katex.default.render(math, div, { 
                    displayMode: true,
                    throwOnError: false,
                    trust: true
                  });
                } catch (e) {
                  div.textContent = math;
                }
                fragment.appendChild(div);
              } else {
                // Process inline math $ ... $
                const inlineParts = part.split(/(\$[^$]+?\$)/);
                
                inlineParts.forEach(inline => {
                  if (inline.startsWith('$') && inline.endsWith('$') && inline.length > 2) {
                    const math = inline.slice(1, -1);
                    const span = document.createElement('span');
                    span.className = 'inline-math';
                    try {
                      katex.default.render(math, span, { 
                        displayMode: false,
                        throwOnError: false,
                        trust: true
                      });
                    } catch (e) {
                      span.textContent = math;
                    }
                    fragment.appendChild(span);
                  } else if (inline) {
                    // Process text formatting
                    const formatted = inline
                      .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
                      .replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
                      .replace(/\\texttt\{([^}]+)\}/g, '<code class="font-mono bg-gray-100 px-1">$1</code>')
                      .replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>')
                      .replace(/\\&/g, '&')
                      .replace(/--/g, '–')
                      .replace(/---/g, '—')
                      .replace(/``/g, '"')
                      .replace(/''/g, '"');
                    
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = formatted;
                    Array.from(tempDiv.childNodes).forEach(child => {
                      fragment.appendChild(child.cloneNode(true));
                    });
                  }
                });
              }
            });
            
            node.parentNode.replaceChild(fragment, node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(processNode);
          }
        };

        processNode(wrapper);
        
        // Add paragraph styling
        const paragraphs = wrapper.innerHTML.split(/\n\s*\n/);
        containerRef.current.innerHTML = paragraphs
          .filter(p => p.trim())
          .map(p => `<div class="mb-4">${p}</div>`)
          .join('');

      } catch (err) {
        console.error('Rendering error:', err);
        containerRef.current.textContent = 'Error rendering LaTeX';
      }
    };

    renderLatex();
  }, [latex, showSource]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden relative" style={{ perspective: '1000px' }}>
      <div 
        className="relative transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipping ? (showSource ? 'rotateY(180deg)' : 'rotateY(-180deg)') : 'rotateY(0deg)'
        }}
      >
        {/* Rendered Output Side */}
        <div 
          className={`p-8 ${showSource ? 'hidden' : 'block'}`}
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="bg-white border border-gray-200 rounded p-8">
            <div ref={containerRef} className="text-left leading-relaxed" />
          </div>
        </div>

        {/* LaTeX Source Side */}
        <div 
          className={`p-8 ${showSource ? 'block' : 'hidden'}`}
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <h2 className="text-xl font-semibold mb-6 text-gray-700">Edit Mode</h2>
          <textarea
            value={latex}
            onChange={(e) => handleLatexChange(e.target.value)}
            className="w-full h-96 font-mono text-sm p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Toggle Icon Button */}
      <button
        onClick={toggleView}
        disabled={isFlipping}
        className="absolute bottom-4 right-4 p-3 bg-white hover:bg-gray-100 disabled:bg-gray-200 rounded-full shadow-lg transition-all hover:scale-110 border border-gray-200"
        title={showSource ? 'Show Rendered Output' : 'Show LaTeX Source'}
      >
        {showSource ? (
          // Clipboard icon (for rendered output)
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ) : (
          // Code icon (for source)
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default LaTeXToHTML;