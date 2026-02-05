import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface TextPanelProps {
  onClose: () => void;
  onAddToCanvas: (svg: string, name: string) => void;
}

const googleFonts = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Oswald',
  'Raleway',
  'Poppins',
  'Inter',
  'Bebas Neue',
  'Playfair Display',
];

const SAMPLE_TEXTS = [
  { id: 't1', name: 'Welcome', text: 'WELCOME', font: 'Roboto', size: 48 },
  { id: 't2', name: 'Studio', text: 'Studio', font: 'Poppins', size: 48 },
  { id: 't3', name: 'Brand', text: 'Brand', font: 'Montserrat', size: 48 },
];

export default function TextPanel({ onClose, onAddToCanvas }: TextPanelProps) {
  const [text, setText] = useState('Your Text');
  const [font, setFont] = useState('Roboto');
  const [fontSize, setFontSize] = useState(48);
  const [textCase, setTextCase] = useState<'none' | 'uppercase' | 'lowercase'>('none');
  const [name, setName] = useState('Text Element');

  useEffect(() => {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@400;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [font]);

  const getDisplayText = () => {
    switch (textCase) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      default:
        return text;
    }
  };

  const createTextSvg = () => {
    const displayText = getDisplayText();
    const textWidth = displayText.length * fontSize * 0.6;
    const textHeight = fontSize * 1.2;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${textWidth}" height="${textHeight}" viewBox="0 0 ${textWidth} ${textHeight}">
      <text x="0" y="${fontSize}" font-family="${font}, sans-serif" font-size="${fontSize}" fill="currentColor">${displayText}</text>
    </svg>`;
  };

  const handleAddToCanvas = () => {
    const svg = createTextSvg();
    onAddToCanvas(svg, name);
  };

  const handleDragStart = (e: React.DragEvent, textItem?: typeof SAMPLE_TEXTS[0]) => {
    let svg;
    if (textItem) {
      const textWidth = textItem.text.length * textItem.size * 0.6;
      const textHeight = textItem.size * 1.2;
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${textWidth}" height="${textHeight}" viewBox="0 0 ${textWidth} ${textHeight}">
        <text x="0" y="${textItem.size}" font-family="${textItem.font}, sans-serif" font-size="${textItem.size}" fill="currentColor">${textItem.text}</text>
      </svg>`;
    } else {
      svg = createTextSvg();
    }
    e.dataTransfer.setData('text/plain', svg);
  };

  return (
    <div className="w-96 bg-white border-r border-slate-200 shadow-xl flex flex-col z-10">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Text</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="Text Element"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="Your Text"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Font</label>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                {googleFonts.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Size</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min="12"
                max="200"
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Case</label>
            <div className="flex gap-1">
              <button
                onClick={() => setTextCase('none')}
                className={`flex-1 px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                  textCase === 'none'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => setTextCase('uppercase')}
                className={`flex-1 px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                  textCase === 'uppercase'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                UPPER
              </button>
              <button
                onClick={() => setTextCase('lowercase')}
                className={`flex-1 px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                  textCase === 'lowercase'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                lower
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Preview</label>
            <div
              className="w-full p-4 bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 cursor-move overflow-hidden"
              draggable
              onDragStart={(e) => handleDragStart(e)}
              title="Drag to canvas"
            >
              <span
                style={{
                  fontFamily: `${font}, sans-serif`,
                  fontSize: `${Math.min(fontSize, 32)}px`,
                  textTransform: textCase === 'none' ? 'none' : textCase,
                }}
                className="text-slate-900"
              >
                {text}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Drag to canvas</p>
          </div>

          <button
            onClick={handleAddToCanvas}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add to Canvas
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Saved Texts</h3>
        <div className="grid grid-cols-2 gap-3">
          {SAMPLE_TEXTS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                const textWidth = item.text.length * item.size * 0.6;
                const textHeight = item.size * 1.2;
                const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${textWidth}" height="${textHeight}" viewBox="0 0 ${textWidth} ${textHeight}">
                  <text x="0" y="${item.size}" font-family="${item.font}, sans-serif" font-size="${item.size}" fill="currentColor">${item.text}</text>
                </svg>`;
                onAddToCanvas(svg, item.name);
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              className="group aspect-square bg-slate-50 rounded-lg border-2 border-slate-200 hover:border-slate-900 transition-all p-2 cursor-move flex flex-col items-center justify-center"
              title={item.name}
            >
              <span
                style={{
                  fontFamily: `${item.font}, sans-serif`,
                  fontSize: '12px',
                }}
                className="text-slate-900 text-center truncate w-full"
              >
                {item.text}
              </span>
              <span className="text-xs text-slate-500 mt-1">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
