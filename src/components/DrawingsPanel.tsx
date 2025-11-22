import { useState } from 'react';
import { X, Wand2, RefreshCw, Download, Save, ArrowRight } from 'lucide-react';

interface DrawingsPanelProps {
  onClose: () => void;
  onAddToCanvas: (svg: string, name: string) => void;
}

interface GeneratedDrawing {
  id: string;
  svg: string;
  name: string;
}

export default function DrawingsPanel({ onClose, onAddToCanvas }: DrawingsPanelProps) {
  const [brief, setBrief] = useState('');
  const [style, setStyle] = useState('modern');
  const [generating, setGenerating] = useState(false);
  const [generatedDrawings, setGeneratedDrawings] = useState<GeneratedDrawing[]>([]);

  const handleGenerate = async () => {
    if (!brief.trim()) return;

    setGenerating(true);

    setTimeout(() => {
      const drawings: GeneratedDrawing[] = [
        {
          id: '1',
          name: 'Variation 1',
          svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#1e293b"/><path d="M35,45 L45,55 L65,35" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        },
        {
          id: '2',
          name: 'Variation 2',
          svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="60" height="60" rx="12" fill="#1e293b"/><circle cx="50" cy="50" r="15" fill="white"/></svg>',
        },
        {
          id: '3',
          name: 'Variation 3',
          svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50,15 L75,40 L75,75 L50,90 L25,75 L25,40 Z" fill="#1e293b"/><circle cx="50" cy="50" r="12" fill="white"/></svg>',
        },
      ];
      setGeneratedDrawings(drawings);
      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="w-96 bg-white border-r border-slate-200 shadow-xl flex flex-col z-10">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Drawings Generator</h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </div>


      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Brief
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Describe your drawing: style, shapes, theme..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
            >
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
              <option value="geometric">Geometric</option>
              <option value="abstract">Abstract</option>
              <option value="elegant">Elegant</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!brief.trim() || generating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Drawings
              </>
            )}
          </button>
        </div>

        {generatedDrawings.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Generated Variations</h3>
            <div className="space-y-3">
              {generatedDrawings.map((drawing) => (
                <DrawingCard
                  key={drawing.id}
                  drawing={drawing}
                  onAddToCanvas={() => onAddToCanvas(drawing.svg, drawing.name)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DrawingCard({
  drawing,
  onAddToCanvas,
}: {
  drawing: GeneratedDrawing;
  onAddToCanvas: () => void;
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
      <div
        className="aspect-square bg-white rounded-lg mb-3 flex items-center justify-center p-4"
        dangerouslySetInnerHTML={{ __html: drawing.svg }}
      />
      <div className="flex gap-2">
        <button
          onClick={onAddToCanvas}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          To Canvas
        </button>
        <button className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors">
          <Save className="w-3.5 h-3.5 text-slate-700" />
        </button>
        <button className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors">
          <Download className="w-3.5 h-3.5 text-slate-700" />
        </button>
      </div>
    </div>
  );
}
