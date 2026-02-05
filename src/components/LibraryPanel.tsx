import { useState, useRef, useEffect } from 'react';
import { X, Library, Search, Upload, Trash2 } from 'lucide-react';

interface LibraryPanelProps {
  onClose: () => void;
  onAddToCanvas: (svg: string, name: string) => void;
}

type LibraryTab = 'fragments' | 'logos' | 'text' | 'import';

interface ImportedSvg {
  id: string;
  name: string;
  svg: string;
  created_at: string;
}

const SAMPLE_TEXTS = [
  { id: 't1', name: 'Welcome', svg: '<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><text x="0" y="48" font-family="Roboto, sans-serif" font-size="48" fill="currentColor">WELCOME</text></svg>' },
  { id: 't2', name: 'Studio', svg: '<svg viewBox="0 0 180 60" xmlns="http://www.w3.org/2000/svg"><text x="0" y="48" font-family="Poppins, sans-serif" font-size="48" fill="currentColor">Studio</text></svg>' },
  { id: 't3', name: 'Brand', svg: '<svg viewBox="0 0 150 60" xmlns="http://www.w3.org/2000/svg"><text x="0" y="48" font-family="Montserrat, sans-serif" font-size="48" fill="currentColor">Brand</text></svg>' },
];

const SAMPLE_LOGOS = [
  { id: 'logo-1', name: 'Circle Check', svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#1e293b"/><path d="M35,45 L45,55 L65,35" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  { id: 'logo-2', name: 'Square Dot', svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="60" height="60" rx="12" fill="#1e293b"/><circle cx="50" cy="50" r="15" fill="white"/></svg>' },
  { id: 'logo-3', name: 'Hexagon', svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50,15 L75,40 L75,75 L50,90 L25,75 L25,40 Z" fill="#1e293b"/><circle cx="50" cy="50" r="12" fill="white"/></svg>' },
  { id: 'logo-4', name: 'Diamond', svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50,10 L80,50 L50,90 L20,50 Z" fill="#1e293b"/></svg>' },
  { id: 'logo-5', name: 'Triangle', svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50,20 L80,80 L20,80 Z" fill="#1e293b"/><circle cx="50" cy="60" r="8" fill="white"/></svg>' },
  { id: 'logo-6', name: 'Pentagon', svg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50,15 L85,45 L70,85 L30,85 L15,45 Z" fill="#1e293b"/></svg>' },
];

const SAMPLE_FRAGMENTS = [
  { id: 'f1', name: 'Burst', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="8" fill="#1e293b"/><path d="M30,4 L30,14 M56,30 L46,30 M30,56 L30,46 M4,30 L14,30" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/></svg>' },
  { id: 'f2', name: 'Triangle', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30,10 L50,50 L10,50 Z" fill="#1e293b"/></svg>' },
  { id: 'f3', name: 'Square', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="40" height="40" rx="6" fill="#1e293b"/></svg>' },
  { id: 'f4', name: 'Star', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30,8 L35,23 L51,25 L40,35 L43,51 L30,43 L17,51 L20,35 L9,25 L25,23 Z" fill="#1e293b"/></svg>' },
  { id: 'f5', name: 'Wave', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M5,30 Q18,20 30,30 T55,30" stroke="#1e293b" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>' },
  { id: 'f6', name: 'Hexagon', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30,8 L50,20 L50,40 L30,52 L10,40 L10,20 Z" fill="#1e293b"/></svg>' },
  { id: 'f7', name: 'Arc', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M10,50 Q30,10 50,50" stroke="#1e293b" stroke-width="4.5" fill="none" stroke-linecap="round"/></svg>' },
  { id: 'f8', name: 'Diamond', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30,10 L45,30 L30,50 L15,30 Z" fill="#1e293b"/></svg>' },
  { id: 'f9', name: 'Plus', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30,10 L30,50 M10,30 L50,30" stroke="#1e293b" stroke-width="5" stroke-linecap="round"/></svg>' },
  { id: 'f10', name: 'Cross', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M15,15 L45,45 M45,15 L15,45" stroke="#1e293b" stroke-width="5" stroke-linecap="round"/></svg>' },
  { id: 'f11', name: 'Circle', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="20" fill="#1e293b"/></svg>' },
  { id: 'f12', name: 'Ring', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="20" fill="none" stroke="#1e293b" stroke-width="4"/></svg>' },
  { id: 'f13', name: 'Dots', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="3" fill="#1e293b"/><circle cx="30" cy="18" r="3" fill="#1e293b"/><circle cx="42" cy="18" r="3" fill="#1e293b"/><circle cx="18" cy="30" r="3" fill="#1e293b"/><circle cx="30" cy="30" r="3" fill="#1e293b"/><circle cx="42" cy="30" r="3" fill="#1e293b"/><circle cx="18" cy="42" r="3" fill="#1e293b"/><circle cx="30" cy="42" r="3" fill="#1e293b"/><circle cx="42" cy="42" r="3" fill="#1e293b"/></svg>' },
  { id: 'f14', name: 'Arrow', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M8,30 L42,30 M42,30 L32,20 M42,30 L32,40" stroke="#1e293b" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  { id: 'f15', name: 'Chevron', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M18,18 L42,30 L18,42" stroke="#1e293b" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  { id: 'f16', name: 'Lightning', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M36,8 L18,34 L30,34 L24,52 L42,26 L30,26 Z" fill="#1e293b"/></svg>' },
  { id: 'f17', name: 'Heart', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30,50 C15,40 8,32 8,22 C8,14 14,10 20,10 C24,10 28,12 30,16 C32,12 36,10 40,10 C46,10 52,14 52,22 C52,32 45,40 30,50 Z" fill="#1e293b"/></svg>' },
  { id: 'f18', name: 'Gear', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30,18 L34,24 L41,24 L44,30 L41,36 L34,36 L30,42 L26,36 L19,36 L16,30 L19,24 L26,24 Z" fill="#1e293b"/><circle cx="30" cy="30" r="6" fill="white"/></svg>' },
  { id: 'f19', name: 'Sparkle', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30,10 L32,28 L50,30 L32,32 L30,50 L28,32 L10,30 L28,28 Z" fill="#1e293b"/></svg>' },
  { id: 'f20', name: 'Shield', svg: '<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30,8 L48,16 L48,30 C48,42 40,50 30,52 C20,50 12,42 12,30 L12,16 Z" fill="#1e293b"/></svg>' },
];

export default function LibraryPanel({
  onClose,
  onAddToCanvas,
}: LibraryPanelProps) {
  const [activeTab, setActiveTab] = useState<LibraryTab>('fragments');
  const [search, setSearch] = useState('');
  const [importedSvgs, setImportedSvgs] = useState<ImportedSvg[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('imported_svgs');
    if (stored) {
      setImportedSvgs(JSON.parse(stored));
    }
  }, []);

  const saveImportedSvgs = (svgs: ImportedSvg[]) => {
    setImportedSvgs(svgs);
    localStorage.setItem('imported_svgs', JSON.stringify(svgs));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const svgContent = event.target?.result as string;
          const newSvg: ImportedSvg = {
            id: Date.now().toString() + Math.random(),
            name: file.name.replace('.svg', ''),
            svg: svgContent,
            created_at: new Date().toISOString(),
          };
          saveImportedSvgs([newSvg, ...importedSvgs]);
        };
        reader.readAsText(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deleteImportedSvg = (id: string) => {
    saveImportedSvgs(importedSvgs.filter((svg) => svg.id !== id));
  };

  const getCurrentItems = () => {
    if (activeTab === 'import') {
      return importedSvgs.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }
    const items = activeTab === 'logos' ? SAMPLE_LOGOS : activeTab === 'text' ? SAMPLE_TEXTS : SAMPLE_FRAGMENTS;
    return items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  };

  const items = getCurrentItems();

  return (
    <div className="w-96 bg-white border-r border-slate-200 shadow-xl flex flex-col z-10">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Library</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setActiveTab('fragments')}
            className={`flex-1 px-2 py-2 rounded-lg font-medium transition-colors text-xs ${
              activeTab === 'fragments' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Fragments
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 px-2 py-2 rounded-lg font-medium transition-colors text-xs ${
              activeTab === 'text' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setActiveTab('logos')}
            className={`flex-1 px-2 py-2 rounded-lg font-medium transition-colors text-xs ${
              activeTab === 'logos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Logos
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 px-2 py-2 rounded-lg font-medium transition-colors text-xs ${
              activeTab === 'import' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Import
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
          />
        </div>
      </div>


      <div className="flex-1 overflow-auto p-3">
        {activeTab === 'import' && (
          <div className="mb-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload SVG Files
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Library className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{activeTab === 'import' ? 'No imported SVGs yet' : 'No items found'}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {items.map((item) => (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onAddToCanvas(item.svg, item.name)}
                  className="w-full bg-slate-50 rounded-lg p-1.5 border border-slate-200 hover:border-slate-400 transition-all hover:scale-105"
                >
                  <div
                    className="aspect-square bg-white rounded mb-1 flex items-center justify-center p-1.5"
                    dangerouslySetInnerHTML={{ __html: item.svg }}
                  />
                  <p className="text-xs text-slate-700 text-center truncate leading-tight">{item.name}</p>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeTab === 'import') {
                      deleteImportedSvg(item.id);
                    }
                  }}
                  className={`absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 transition-opacity ${
                    activeTab === 'import' ? 'group-hover:opacity-100' : 'hidden'
                  }`}
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
