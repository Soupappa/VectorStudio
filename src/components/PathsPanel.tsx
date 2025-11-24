import { useState } from 'react';
import { X, Wand2, RefreshCw, ArrowRight } from 'lucide-react';

interface PathsPanelProps {
  onClose: () => void;
  onAddToCanvas: (svg: string, name: string) => void;
}

interface GeneratedPath {
  id: string;
  svg: string;
  name: string;
}

export default function PathsPanel({ onClose, onAddToCanvas }: PathsPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('geometric');
  const [generating, setGenerating] = useState(false);
  const [generatedPaths, setGeneratedPaths] = useState<GeneratedPath[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);

    setTimeout(() => {
      const paths: GeneratedPath[] = [
        { id: '1', name: 'Path 1', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="20" fill="#1e293b"/></svg>' },
        { id: '2', name: 'Path 2', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30,10 L50,50 L10,50 Z" fill="#1e293b"/></svg>' },
        { id: '3', name: 'Path 3', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="40" height="40" rx="8" fill="#1e293b"/></svg>' },
        { id: '4', name: 'Path 4', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30,10 L45,30 L30,50 L15,30 Z" fill="#1e293b"/></svg>' },
        { id: '5', name: 'Path 5', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30,8 L35,23 L51,25 L40,35 L43,51 L30,43 L17,51 L20,35 L9,25 L25,23 Z" fill="#1e293b"/></svg>' },
        { id: '6', name: 'Path 6', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30,8 L50,20 L50,40 L30,52 L10,40 L10,20 Z" fill="#1e293b"/></svg>' },
      ];
      setGeneratedPaths(paths);
      setGenerating(false);
    }, 1500);
  };

  return (
    <div className="w-96 bg-white border-r border-slate-200 shadow-xl flex flex-col z-10">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Paths Generator</h2>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </div>


      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe paths to generate: geometric shapes, abstract forms..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
            >
              <option value="geometric">Geometric</option>
              <option value="organic">Organic</option>
              <option value="abstract">Abstract</option>
              <option value="technical">Technical</option>
              <option value="decorative">Decorative</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
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
                Generate Paths
              </>
            )}
          </button>
        </div>

        {generatedPaths.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Generated Paths</h3>
            <div className="grid grid-cols-3 gap-2">
              {generatedPaths.map((path) => (
                <button
                  key={path.id}
                  onClick={() => onAddToCanvas(path.svg, path.name)}
                  className="group relative bg-slate-50 rounded-lg p-2 border border-slate-200 hover:border-slate-400 transition-all hover:scale-105"
                >
                  <div
                    className="aspect-square bg-white rounded mb-1.5 flex items-center justify-center p-2"
                    dangerouslySetInnerHTML={{ __html: path.svg }}
                  />
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
