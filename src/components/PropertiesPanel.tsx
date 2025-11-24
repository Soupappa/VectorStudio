import { useState, useRef, useEffect } from 'react';
import { Copy, Trash2, FlipHorizontal, FlipVertical, Group, Ungroup, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Grid3x3, CircleDot, ChevronsUp, ChevronsDown, ArrowUp, ArrowDown, X, Lock, Unlock } from 'lucide-react';
import { CanvasElement } from '../types';
import ColorPicker from './ColorPicker';

interface PropertiesPanelProps {
  elements: CanvasElement[];
  selectedElementIds: string[];
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (ids: string[]) => void;
  onDeselect?: () => void;
  onDuplicate: (ids: string[]) => void;
  onGroup: (ids: string[]) => void;
  onUngroup: (ids: string[]) => void;
  onArrayDuplicate: (ids: string[], type: 'rectangular' | 'radial', spacing?: { x: number; y: number; radius: number }) => void;
  onReorder: (ids: string[], direction: 'front' | 'forward' | 'backward' | 'back') => void;
  showBbox: boolean;
  onToggleBbox: (value: boolean) => void;
}

export default function PropertiesPanel({
  elements,
  selectedElementIds,
  onUpdate,
  onDelete,
  onDeselect,
  onDuplicate,
  onGroup,
  onUngroup,
  onArrayDuplicate,
  onReorder,
  showBbox,
  onToggleBbox,
}: PropertiesPanelProps) {
  const [showArrayMenu, setShowArrayMenu] = useState(false);
  const [arraySpacing, setArraySpacing] = useState({ x: 120, y: 120, radius: 200 });
  const selectedElements = elements.filter((el) => selectedElementIds.includes(el.id));
  const singleElement = selectedElements.length === 1 ? selectedElements[0] : null;

  const allSameGroup = selectedElements.length > 1 &&
    selectedElements.every(el => el.groupId && el.groupId === selectedElements[0].groupId);

  const displayElement = singleElement || (allSameGroup ? selectedElements[0] : null);

  const updateElementOrGroup = (updates: Partial<CanvasElement>) => {
    if (allSameGroup) {
      selectedElements.forEach(el => onUpdate(el.id, updates));
    } else if (singleElement) {
      const element = elements.find(el => el.id === singleElement.id);
      if (element?.groupId) {
        const groupedElements = elements.filter(el => el.groupId === element.groupId);
        groupedElements.forEach(el => onUpdate(el.id, updates));
      } else {
        onUpdate(singleElement.id, updates);
      }
    }
  };

  const hasGroup = selectedElements.length > 0 && selectedElements.some(el => el.groupId);
  const canGroup = selectedElements.length > 1 && !allSameGroup;

  const holdInterval = useRef<NodeJS.Timeout | null>(null);
  const holdAcceleration = useRef(1);

  const adjustPosition = (axis: 'x' | 'y', delta: number) => {
    if (!displayElement) return;
    updateElementOrGroup({ [axis]: displayElement[axis] + delta * holdAcceleration.current });
  };

  const startHold = (axis: 'x' | 'y', delta: number) => {
    holdAcceleration.current = 1;
    adjustPosition(axis, delta);

    let accelerationCounter = 0;
    holdInterval.current = setInterval(() => {
      accelerationCounter++;
      if (accelerationCounter > 10) holdAcceleration.current = 10;
      else if (accelerationCounter > 5) holdAcceleration.current = 5;
      adjustPosition(axis, delta);
    }, 100);
  };

  const stopHold = () => {
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }
    holdAcceleration.current = 1;
  };

  useEffect(() => {
    return () => {
      if (holdInterval.current) clearInterval(holdInterval.current);
    };
  }, []);

  if (selectedElements.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        <p className="text-xs">Select an element</p>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center px-4 py-2 gap-3 bg-white">
      <button
        onClick={() => onDeselect?.()}
        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
        title="Deselect"
      >
        <X className="w-4 h-4 text-slate-600" />
      </button>

      <div className="h-6 w-px bg-slate-300" />

      {displayElement && (
        <>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={displayElement.name}
              onChange={(e) => onUpdate(displayElement.id, { name: e.target.value })}
              className="w-20 px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:border-transparent"
              placeholder="Name"
            />
            <button
              onClick={() => onToggleBbox(!showBbox)}
              className={`p-1 rounded border transition-colors ${
                showBbox
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Show BBox"
            >
              {showBbox ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            </button>
          </div>

          <div className="h-6 w-px bg-slate-300" />

          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-600 w-4">X</span>
            <div className="flex items-center gap-0.5">
              <button
                onMouseDown={() => startHold('x', -5)}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                className="p-0.5 hover:bg-slate-200 rounded text-slate-700"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onMouseDown={() => startHold('x', 5)}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                className="p-0.5 hover:bg-slate-200 rounded text-slate-700"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <span className="text-xs text-slate-700 font-mono w-12 text-right">{Math.round(displayElement.x)}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-600 w-4">Y</span>
            <div className="flex items-center gap-0.5">
              <button
                onMouseDown={() => startHold('y', -5)}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                className="p-0.5 hover:bg-slate-200 rounded text-slate-700"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onMouseDown={() => startHold('y', 5)}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                className="p-0.5 hover:bg-slate-200 rounded text-slate-700"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <span className="text-xs text-slate-700 font-mono w-12 text-right">{Math.round(displayElement.y)}</span>
          </div>

          <div className="h-6 w-px bg-slate-300" />

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-medium w-10">Scale</span>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={displayElement.scale}
              onChange={(e) => updateElementOrGroup({ scale: Number(e.target.value) })}
              className="tech-slider w-12"
            />
            <span className="text-xs text-slate-900 font-mono w-8">{displayElement.scale.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-medium w-10">Scale X</span>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={displayElement.scaleX || 1}
              onChange={(e) => updateElementOrGroup({ scaleX: Number(e.target.value) })}
              className="tech-slider w-12"
            />
            <span className="text-xs text-slate-900 font-mono w-8">{(displayElement.scaleX || 1).toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-medium w-10">Scale Y</span>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={displayElement.scaleY || 1}
              onChange={(e) => updateElementOrGroup({ scaleY: Number(e.target.value) })}
              className="tech-slider w-12"
            />
            <span className="text-xs text-slate-900 font-mono w-8">{(displayElement.scaleY || 1).toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-medium w-14">Rotation</span>
            <input
              type="range"
              min="0"
              max="360"
              value={displayElement.rotation}
              onChange={(e) => updateElementOrGroup({ rotation: Number(e.target.value) })}
              className="tech-slider w-12"
            />
            <span className="text-xs text-slate-900 font-mono w-8">{Math.round(displayElement.rotation)}°</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-medium w-12">Opacity</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={displayElement.opacity}
              onChange={(e) => updateElementOrGroup({ opacity: Number(e.target.value) })}
              className="tech-slider w-12"
            />
            <span className="text-xs text-slate-900 font-mono w-8">{Math.round(displayElement.opacity * 100)}%</span>
          </div>

          <div className="h-6 w-px bg-slate-300" />

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600">Color</span>
            <ColorPicker
              value={displayElement.color || '#1e293b'}
              onChange={(color) => updateElementOrGroup({ color })}
            />
          </div>

          <div className="h-6 w-px bg-slate-300" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => updateElementOrGroup({ flipX: !displayElement.flipX })}
              className={`p-1 rounded border transition-colors ${
                displayElement.flipX
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Flip Horizontal"
            >
              <FlipHorizontal className="w-3 h-3" />
            </button>
            <button
              onClick={() => updateElementOrGroup({ flipY: !displayElement.flipY })}
              className={`p-1 rounded border transition-colors ${
                displayElement.flipY
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Flip Vertical"
            >
              <FlipVertical className="w-3 h-3" />
            </button>
          </div>
        </>
      )}

      {selectedElements.length > 1 && (
        <div className="text-xs text-slate-600">
          {selectedElements.length} elements{allSameGroup ? ' (Grouped)' : ''} selected
        </div>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onReorder(selectedElementIds, 'front')}
            className="p-1 hover:bg-slate-100 rounded text-slate-700 transition-colors"
            title="Bring to Front"
          >
            <ChevronsUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => onReorder(selectedElementIds, 'forward')}
            className="p-1 hover:bg-slate-100 rounded text-slate-700 transition-colors"
            title="Bring Forward"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => onReorder(selectedElementIds, 'backward')}
            className="p-1 hover:bg-slate-100 rounded text-slate-700 transition-colors"
            title="Send Backward"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
          <button
            onClick={() => onReorder(selectedElementIds, 'back')}
            className="p-1 hover:bg-slate-100 rounded text-slate-700 transition-colors"
            title="Send to Back"
          >
            <ChevronsDown className="w-3 h-3" />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-300" />

        <button
          onClick={() => onDuplicate(selectedElementIds)}
          className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium transition-colors"
          title="Duplicate"
        >
          <Copy className="w-3 h-3" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowArrayMenu(!showArrayMenu)}
            className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium transition-colors"
            title="Array Duplicate"
          >
            <Grid3x3 className="w-3 h-3" />
          </button>
          {showArrayMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg p-2 min-w-48 z-50">
              <div className="space-y-2">
                <div>
                  <button
                    onClick={() => {
                      onArrayDuplicate(selectedElementIds, 'rectangular', arraySpacing);
                      setShowArrayMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded text-xs font-medium"
                  >
                    <Grid3x3 className="w-3 h-3" />
                    Rectangular
                  </button>
                  <div className="px-3 py-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-600 w-12">X Gap:</label>
                      <input
                        type="number"
                        value={arraySpacing.x}
                        onChange={(e) => setArraySpacing({ ...arraySpacing, x: Number(e.target.value) })}
                        className="w-16 px-1 py-0.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-600 w-12">Y Gap:</label>
                      <input
                        type="number"
                        value={arraySpacing.y}
                        onChange={(e) => setArraySpacing({ ...arraySpacing, y: Number(e.target.value) })}
                        className="w-16 px-1 py-0.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-200" />

                <div>
                  <button
                    onClick={() => {
                      onArrayDuplicate(selectedElementIds, 'radial', arraySpacing);
                      setShowArrayMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded text-xs font-medium"
                  >
                    <CircleDot className="w-3 h-3" />
                    Radial
                  </button>
                  <div className="px-3 py-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-600 w-12">Radius:</label>
                      <input
                        type="number"
                        value={arraySpacing.radius}
                        onChange={(e) => setArraySpacing({ ...arraySpacing, radius: Number(e.target.value) })}
                        className="w-16 px-1 py-0.5 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {canGroup && (
          <button
            onClick={() => onGroup(selectedElementIds)}
            className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium transition-colors"
            title="Group"
          >
            <Group className="w-3 h-3" />
          </button>
        )}
        {hasGroup && (
          <button
            onClick={() => onUngroup(selectedElementIds)}
            className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium transition-colors"
            title="Ungroup"
          >
            <Ungroup className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => onDelete(selectedElementIds)}
          className="flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-medium transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
