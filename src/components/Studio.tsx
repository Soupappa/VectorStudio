import { useState } from 'react';
import { Layers, Wand2, Box, Sparkles, Library, FolderOpen, Settings, SlidersHorizontal, Type, ZoomIn, ZoomOut, Download } from 'lucide-react';
import Canvas from './Canvas';
import DrawingsPanel from './DrawingsPanel';
import PathsPanel from './PathsPanel';
import TextPanel from './TextPanel';
import LibraryPanel from './LibraryPanel';
import ProjectsPanel from './ProjectsPanel';
import PropertiesPanel from './PropertiesPanel';
import { CanvasElement } from '../types';
import { changeSvgColor } from '../utils/svgColor';

type PanelMode = 'drawings' | 'paths' | 'text' | 'motion' | 'library' | 'projects' | 'settings' | null;

export default function Studio() {
  const [activePanel, setActivePanel] = useState<PanelMode>(null);
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [showBbox, setShowBbox] = useState(false);
  const [cleanMode, setCleanMode] = useState(false);
  const [zoom, setZoom] = useState(1);

  const togglePanel = (panel: PanelMode) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const addToCanvas = (svg: string, name: string) => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      name,
      svg,
      x: Math.random() * 2000 - 1000,
      y: Math.random() * 2000 - 1000,
      scale: 0.5,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 1,
      flipX: false,
      flipY: false,
    };
    setCanvasElements([...canvasElements, newElement]);
    setSelectedElementIds([newElement.id]);
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    setCanvasElements(prevElements => prevElements.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const deleteElements = (ids: string[]) => {
    setCanvasElements(prevElements => prevElements.filter((el) => !ids.includes(el.id)));
    setSelectedElementIds([]);
  };

  const duplicateElements = (ids: string[]) => {
    const elementsToDuplicate = canvasElements.filter((el) => ids.includes(el.id));
    const newElements = elementsToDuplicate.map((el) => ({
      ...el,
      id: Date.now().toString() + Math.random(),
      x: el.x + 50,
      y: el.y + 50,
    }));
    setCanvasElements([...canvasElements, ...newElements]);
    setSelectedElementIds(newElements.map((el) => el.id));
  };

  const groupElements = (ids: string[]) => {
    if (ids.length < 2) return;

    const groupId = `group_${Date.now()}`;
    setCanvasElements(prevElements => prevElements.map(el =>
      ids.includes(el.id) ? { ...el, groupId } : el
    ));
    setSelectedElementIds(ids);
  };

  const ungroupElements = (ids: string[]) => {
    setCanvasElements(prevElements => {
      const groupIds = new Set(
        prevElements
          .filter(el => ids.includes(el.id) && el.groupId)
          .map(el => el.groupId!)
      );
      return prevElements.map(el =>
        el.groupId && groupIds.has(el.groupId) ? { ...el, groupId: undefined } : el
      );
    });
  };

  const arrayDuplicateElements = (ids: string[], type: 'rectangular' | 'radial', spacing?: { x: number; y: number; radius: number }) => {
    const elementsToDuplicate = canvasElements.filter((el) => ids.includes(el.id));
    if (elementsToDuplicate.length === 0) return;

    const newElements: CanvasElement[] = [];
    const spacingX = spacing?.x || 120;
    const spacingY = spacing?.y || 120;
    const radius = spacing?.radius || 200;

    if (type === 'rectangular') {
      const rows = 3;
      const cols = 3;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (row === 0 && col === 0) continue;
          elementsToDuplicate.forEach((el) => {
            newElements.push({
              ...el,
              id: Date.now().toString() + Math.random(),
              x: el.x + col * spacingX,
              y: el.y + row * spacingY,
            });
          });
        }
      }
    } else {
      const count = 8;

      for (let i = 1; i < count; i++) {
        const angle = (i * 360) / count;
        const radians = (angle * Math.PI) / 180;
        elementsToDuplicate.forEach((el) => {
          newElements.push({
            ...el,
            id: Date.now().toString() + Math.random(),
            x: el.x + Math.cos(radians) * radius,
            y: el.y + Math.sin(radians) * radius,
            rotation: el.rotation + angle,
          });
        });
      }
    }

    setCanvasElements([...canvasElements, ...newElements]);
    setSelectedElementIds(newElements.map((el) => el.id));
  };

  const reorderElements = (ids: string[], direction: 'front' | 'forward' | 'backward' | 'back') => {
    const reorderedElements = [...canvasElements];
    const elementsToMove = reorderedElements.filter(el => ids.includes(el.id));
    const otherElements = reorderedElements.filter(el => !ids.includes(el.id));

    if (direction === 'front') {
      setCanvasElements([...otherElements, ...elementsToMove]);
    } else if (direction === 'back') {
      setCanvasElements([...elementsToMove, ...otherElements]);
    } else if (direction === 'forward') {
      elementsToMove.forEach(elToMove => {
        const currentIndex = reorderedElements.findIndex(el => el.id === elToMove.id);
        if (currentIndex < reorderedElements.length - 1) {
          const temp = reorderedElements[currentIndex + 1];
          reorderedElements[currentIndex + 1] = reorderedElements[currentIndex];
          reorderedElements[currentIndex] = temp;
        }
      });
      setCanvasElements(reorderedElements);
    } else if (direction === 'backward') {
      elementsToMove.reverse().forEach(elToMove => {
        const currentIndex = reorderedElements.findIndex(el => el.id === elToMove.id);
        if (currentIndex > 0) {
          const temp = reorderedElements[currentIndex - 1];
          reorderedElements[currentIndex - 1] = reorderedElements[currentIndex];
          reorderedElements[currentIndex] = temp;
        }
      });
      setCanvasElements(reorderedElements);
    }
  };

  const handleSelectElements = (ids: string[], isShiftKey: boolean) => {
    if (isShiftKey) {
      const newSelection = [...new Set([...selectedElementIds, ...ids])];
      setSelectedElementIds(newSelection);
    } else {
      setSelectedElementIds(ids);
    }
  };

  const exportSvg = () => {
    const svgContent = `<svg viewBox="0 0 2000 2000" xmlns="http://www.w3.org/2000/svg">
      ${canvasElements
        .map((el) => {
          const svg = el.color ? changeSvgColor(el.svg, el.color) : el.svg;
          const scaleX = el.scale * (el.scaleX || 1);
          const scaleY = el.scale * (el.scaleY || 1);
          const transform = [
            `translate(${el.x}, ${el.y})`,
            (scaleX !== 1 || scaleY !== 1) && `scale(${scaleX}, ${scaleY})`,
            el.rotation !== 0 && `rotate(${el.rotation})`,
            (el.flipX || el.flipY) && `scale(${el.flipX ? -1 : 1}, ${el.flipY ? -1 : 1})`,
          ]
            .filter(Boolean)
            .join(' ');
          return `<g transform="${transform}" opacity="${el.opacity}">${svg}</g>`;
        })
        .join('\n')}
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'composition.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedElement = selectedElementIds.length === 1
    ? canvasElements.find((el) => el.id === selectedElementIds[0])
    : undefined;

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <button
        onClick={() => setCleanMode(!cleanMode)}
        className="absolute top-3 left-6 z-50 p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
        title={cleanMode ? 'Show UI' : 'Clean Mode (Hide UI for screenshots)'}
      >
        <Layers className="w-5 h-5" />
      </button>

      {!cleanMode && (
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-20">
        <div className="w-12 flex items-center"></div>
        <>
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg text-slate-900">Vector Studio</span>

          <nav className="flex items-center gap-1">
            <ModeButton
              icon={<Box className="w-4 h-4" />}
              label="Paths"
              active={activePanel === 'paths'}
              onClick={() => togglePanel('paths')}
            />
            <ModeButton
              icon={<Type className="w-4 h-4" />}
              label="Text"
              active={activePanel === 'text'}
              onClick={() => togglePanel('text')}
            />
            <ModeButton
              icon={<Wand2 className="w-4 h-4" />}
              label="Drawings"
              active={activePanel === 'drawings'}
              onClick={() => togglePanel('drawings')}
            />
            <ModeButton
              icon={<Sparkles className="w-4 h-4" />}
              label="Motion"
              active={activePanel === 'motion'}
              onClick={() => togglePanel('motion')}
            />
            <ModeButton
              icon={<Library className="w-4 h-4" />}
              label="Library"
              active={activePanel === 'library'}
              onClick={() => togglePanel('library')}
            />
            <ModeButton
              icon={<FolderOpen className="w-4 h-4" />}
              label="Projects"
              active={activePanel === 'projects'}
              onClick={() => togglePanel('projects')}
            />
            <ModeButton
              icon={<Settings className="w-4 h-4" />}
              label="Settings"
              active={activePanel === 'settings'}
              onClick={() => togglePanel('settings')}
            />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.min(zoom + 0.2, 3))}
            className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ZoomIn className="w-4 h-4 text-slate-700" />
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.2, 0.1))}
            className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ZoomOut className="w-4 h-4 text-slate-700" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 shadow-sm min-w-[60px]"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={exportSvg}
            disabled={canvasElements.length === 0}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-700" />
            Export
          </button>
        </div>
        </>
      </header>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {!cleanMode && activePanel === 'drawings' && (
          <DrawingsPanel
            onClose={() => setActivePanel(null)}
            onAddToCanvas={addToCanvas}
          />
        )}

        {!cleanMode && activePanel === 'paths' && (
          <PathsPanel
            onClose={() => setActivePanel(null)}
            onAddToCanvas={addToCanvas}
          />
        )}

        {!cleanMode && activePanel === 'text' && (
          <TextPanel
            onClose={() => setActivePanel(null)}
            onAddToCanvas={addToCanvas}
          />
        )}

        {!cleanMode && activePanel === 'motion' && (
          <div className="w-96 bg-white border-r border-slate-200 shadow-xl flex flex-col items-center justify-center z-10">
            <Sparkles className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-500">Motion mode coming soon</p>
          </div>
        )}

        {!cleanMode && activePanel === 'library' && (
          <LibraryPanel
            onClose={() => setActivePanel(null)}
            onAddToCanvas={addToCanvas}
          />
        )}

        {!cleanMode && activePanel === 'projects' && (
          <ProjectsPanel
            onClose={() => setActivePanel(null)}
            canvasElements={canvasElements}
            onLoadProject={setCanvasElements}
          />
        )}

        {!cleanMode && activePanel === 'settings' && (
          <div className="w-96 bg-white border-r border-slate-200 shadow-xl flex flex-col items-center justify-center z-10">
            <Settings className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-500">Settings coming soon</p>
          </div>
        )}

        <div className="flex-1 relative">
          <Canvas
            elements={canvasElements}
            selectedElementIds={selectedElementIds}
            onSelectElements={handleSelectElements}
            onUpdateElement={updateElement}
            onUpdateElements={(updates) => {
              setCanvasElements(prevElements => {
                const updateMap = new Map(updates.map(u => [u.id, u]));
                return prevElements.map(el => {
                  const update = updateMap.get(el.id);
                  return update ? { ...el, ...update } : el;
                });
              });
            }}
            showBbox={showBbox}
            cleanMode={cleanMode}
            onToggleCleanMode={() => setCleanMode(!cleanMode)}
            zoom={zoom}
            onExport={exportSvg}
            onZoomChange={setZoom}
          />
        </div>

        {!cleanMode && selectedElementIds.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 shadow-lg z-30">
            <PropertiesPanel
              elements={canvasElements}
              selectedElementIds={selectedElementIds}
              onUpdate={updateElement}
              onDelete={deleteElements}
              onDeselect={() => setSelectedElementIds([])}
              onDuplicate={duplicateElements}
              onGroup={groupElements}
              onUngroup={ungroupElements}
              onArrayDuplicate={arrayDuplicateElements}
              onReorder={reorderElements}
              showBbox={showBbox}
              onToggleBbox={(value) => setShowBbox(value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ModeButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-slate-900 text-white'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}
